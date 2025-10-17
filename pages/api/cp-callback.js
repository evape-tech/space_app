import nc from "next-connect";
import { prisma } from '@/utils/db'
import { CpStatusEnum } from "@/types/index";
;
// import User from "../../../models/User";
// import db from "../../../utils/db";
// import auth from "../../../middleware/auth";
const handler = nc(); //.use(auth);
handler.post(async (req, res, next) => {
  const { body } = req;

  if (process.env.SPACE_CALLBACK_APIKEY !== body.apikey) return next();

  //not log everything on prod.
  // if (body.current_status === 'Charging' && body.data > 1) return next()

  // data: {
  //   apikey,
  //   cpid,
  //   cp_online, //參數有:online , offline
  //   cmd,
  //   current_status, //參數有:Available -> Preparing -> Charging -> Finishing
  //   data1, // kWh
  //   data2, // A
  //   data3, // V
  //   data4,
  //   data5,
  //   data6 // roundId
  // },

  try {
    const cp = await prisma.cPile.findUnique({
      where: { cpIdKey: body.cpid },
    });

    if (!cp) {
      return res.status(404).json({ message: "Charger not found" });
    }

    // log
    const newLog = await prisma.cpReportCbLog.create({
      data: body,
    });

    // upsert cp status
    const statusData = {
      cpIdKey: body.cpid,
      cp_online: body.cp_online,
      current_status: body.current_status,
      currentkWh: +body.data1,
      eA: +body.data2,
      eV: +body.data3,
      roundId: body.data6,
    };

    const cpStatus = await prisma.cPileStatus.upsert({
      where: {
        cpIdKey: statusData.cpIdKey,
      },
      update: statusData,
      create: statusData,
    });

    if (statusData.current_status === CpStatusEnum.Finishing) {
      try {
        const paid = await prisma.$transaction(async () => {
          const endupBody = {
            fee: Math.trunc(statusData.currentkWh * 10),
            kWh: statusData.currentkWh,
          };

          // Find the open charging transaction for this cp
          const openChargingTx = await prisma.chargingTx.findFirst({
            where: {
              cpIdKey: statusData.cpIdKey,
              endTime: null,
            },
            orderBy: {
              startTime: 'desc',
            },
          });

          if (!openChargingTx) {
            throw new Error(`No open charging transaction found for cpId: ${statusData.cpIdKey}`);
          }

          // round - update the open transaction
          const cpRound = await prisma.chargingTx.update({
            where: {
              id: openChargingTx.id,
            },
            data: endupBody,
          });

          console.log("charge round", cpRound);

          // user wallet - balance
          const walletTx = await prisma.walletTx.findFirst({
            where: {
              userId: cpRound.userId,
            },
            orderBy: { id: "desc" },
          });
          console.log("wallet", walletTx);

          // pay log.
          const feeBody = {
            userId: cpRound.userId,
            points: -Math.trunc(cpRound.fee),
            depositId: null,
            txType: "spend",
            spendId: cpRound.id, // from chargeTx
            balance: walletTx.balance - Math.trunc(cpRound.fee),
          };
          const paid = await prisma.walletTx.create({
            data: feeBody,
          });

          console.log("paid", paid);
          return paid;
        });
      } catch (err) {
        console.log("rollback", err);
      }
    }

    // const users = await prisma.user.findMany()
    res.status(200).json({ message: "Logged cp-callback." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

export default handler;

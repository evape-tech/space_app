import nc from "next-connect";
import { prisma } from '@/utils/db'
const handler = nc(); //.use(auth);

handler.get(async (req, res, next) => {
  const { round } = req.query;

  // const data = {
  //     acc: '0933512472',
  //     provider: "phone"
  // }

  let queryBody = {
    where: {
      roundId: round,
    },
    select: {
      kWh: true,
      fee: true,
      startTime: true,
      endTime: true,
      cpile: {
        select: {
          name: true,
        },
      },
      station: {
        select: {
          name: true,
        },
      },
    },
  };

  try {
    const cpStatus = await prisma.chargingTx.findUnique(queryBody);
    res.status(200).json(cpStatus);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
});

export default handler;

import nc from "next-connect";
import { prisma } from "@/utils/db";
// import User from "../../../models/User";
// import db from "../../../utils/db";
// import auth from "../../../middleware/auth";
const handler = nc(); //.use(auth);
handler.post(async (req, res, next) => {
  const { body } = req;
  let userId = +req.body.CustomField1;
  try {
    // https://developers.ecpay.com.tw/?p=2878
    // RtnCode 若回傳值為1時，為付款成功

    // const fakeBbody = {
    //     CustomField1: '1', //userId
    //     CustomField2: '',
    //     CustomField3: '',
    //     CustomField4: '',
    //     MerchantID: '3002607',
    //     MerchantTradeNo: 'Z023',
    //     PaymentDate: '2023/02/18 03:04:23',
    //     PaymentType: 'Credit_CreditCard',
    //     PaymentTypeChargeFee: '2',
    //     RtnCode: '1',
    //     RtnMsg: '交易成功',
    //     SimulatePaid: '0',
    //     StoreID: '',
    //     TradeAmt: '100',
    //     TradeDate: '2023/02/18 03:03:08',
    //     TradeNo: '2302180303081971',
    //     CheckMacValue: '68082C14D30E907F5F2C61398AE966A78A6DA54B5AEA335C2E34EB6DC090F2B3'
    // }

    const payData = {
      orderNo: body.MerchantTradeNo,
      txId: body.TradeNo,
      txTime: new Date(body.TradeDate),
      paymentName: "ecpay",
      amount: +body.TradeAmt,
      payway: "credit",
      isPaid: body.RtnCode === "1",
    };
    let order;
    try {
      order = await prisma.$transaction(async () => {
        let fb = await prisma.PaymentFeedback.create({
          data: payData,
        });
        console.log("fb", fb);

        let order = await prisma.order.update({
          where: { orderNo: fb.orderNo },
          data: {
            paymentfbId: fb.id,
            status: payData.isPaid ? "paid" : "unpaid",
          },
        });
        console.log("order", order);
        return order;
      });
    } catch (err) {
      console.log("rollback", err);
    }

    if (order && order.status === "paid") {
      try {
        const dupWalletTx = await prisma.walletTx.findFirst({
          where: {
            depositId: order.id,
          },
        });

        if (dupWalletTx) {
          return res.status(200).send(1);
          // return res.status(404).json({
          //     code: 404,
          //     message: "dup order update"
          // });
        }

        // get wallet last one data.
        const walletTx = await prisma.walletTx.findFirst({
          where: {
            userId,
          },
          orderBy: { id: "desc" },
        });

        const walletData = {
          userId: +userId,
          points: order.qty,
          depositId: order.id,
          spendId: null,
          balance: walletTx ? walletTx.balance + order.qty : order.qty,
          txType: "income", // income / spend
        };

        // insert wallet. income.
        const newWalletTx = await prisma.walletTx.create({
          data: walletData,
        });
        console.log("walletTx", newWalletTx);
      } catch (error) {
        console.log(error);
      }
    }
    res.status(200).send(1);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
});

export default handler;

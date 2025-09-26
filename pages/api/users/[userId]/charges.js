import nc from "next-connect";
import { prisma } from '@/utils/db'
// import OrderNo from "../../../models/OrderNo";
// import db from "../../../utils/db";
// import auth from "../../../middleware/auth";
const handler = nc(); //.use(auth);
handler.get(async (req, res, next) => {
  // all

  const { userId } = req.query;
  try {
    const chargeTx = await prisma.chargingTx.findMany({
      where: {
        userId: +userId,
      },
      orderBy: { id: "desc" },
    });

    // const users = await prisma.user.findMany()
    res.status(200).json(chargeTx);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
});

export default handler;

import nc from "next-connect";
import { prisma } from '@/utils/db'
// import User from "../../../models/User";
// import db from "../../../utils/db";
// import auth from "../../../middleware/auth";
const handler = nc(); //.use(auth);

handler.get(async (req, res, next) => {
  // all

  const { userId } = req.query;
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: +userId,
      },
    });

    // const users = await prisma.user.findMany()
    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
});

export default handler;

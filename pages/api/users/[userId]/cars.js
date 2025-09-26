import nc from "next-connect";
import { prisma } from '@/utils/db'
// import User from "../../../models/User";
// import db from "../../../utils/db";
// import auth from "../../../middleware/auth";
const handler = nc(); //.use(auth);

handler.post(async (req, res, next) => {
  const { body } = req;

  // const data = {
  //     acc: '0933512472',
  //     provider: "phone"
  // }

  try {
    const newCar = await prisma.car.create({
      data: body,
    });

    // const users = await prisma.user.findMany()
    res.status(201).json(newCar);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
});

handler.get(async (req, res, next) => {
  // all

  const { userId } = req.query;
  try {
    const cars = await prisma.car.findMany({
      where: {
        userId: +userId,
      },
    });

    // const users = await prisma.user.findMany()
    res.status(200).json(cars);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
});

export default handler;

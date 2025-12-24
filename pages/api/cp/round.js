import nc from "next-connect";
import { prisma } from '@/utils/db'
import dayjs from '@/utils/dayjs'
// import User from "../../../models/User";
// import db from "../../../utils/db";
// import auth from "../../../middleware/auth";
const handler = nc(); //.use(auth);

handler.post(async (req, res, next) => {
  const { body } = req;

  // const data = {
  //     "stationId": 1,
  //     "cpIdKey": "1001",
  //     "userId": 30,
  //     "kW": .5,
  //     "fee": 100
  // }
  // use UTC as canonical stored startTime
  body.startTime = dayjs.utc().toDate(); // only startup
  // Generate auto roundId if not provided (using timestamp + random)
  if (!body.roundId) {
    body.roundId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  try {
    const cpRound = await prisma.chargingTx.create({
      data: body,
    });
    res.status(201).json(cpRound);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
});

export default handler;

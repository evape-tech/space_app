import nc from "next-connect";
import { prisma } from '@/utils/db'
// import User from "../../../models/User";
// import db from "../../../utils/db";
// import auth from "../../../middleware/auth";
const handler = nc(); //.use(auth);
handler.post(async (req, res, next) => {
  const { body } = req;
  const cpUrl = body.cpBaseUrl;
  delete body.cpBaseUrl;

  try {
    const result = await fetch(cpUrl, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    let cpRes = await result.json();
    // console.log(cpRes);
    res.status(200).json(cpRes);
  } catch (error) {
    console.log(error.message);
  }
});

export default handler;

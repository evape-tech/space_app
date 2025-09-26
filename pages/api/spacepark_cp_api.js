import nc from "next-connect";
import { prisma } from '@/utils/db'
const handler = nc(); //.use(auth);

handler.post(async (req, res, next) => {
  let cpRes = {
    cp_res: "cp_status",
    cpid: "1001",
    cp_online: "online",
    current_status: "Preparing",
    data1: "5",
    data2: "28.1",
    data3: "218.9",
    data4: "",
    data5: "",
    data6: "round-7",
  };
  res.status(200).json(cpRes);
});

export default handler;

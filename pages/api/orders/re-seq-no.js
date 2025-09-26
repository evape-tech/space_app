import nc from "next-connect";
import { prisma } from '@/utils/db'
// import OrderNo from "../../../models/OrderNo";
// import db from "../../../utils/db";
// import auth from "../../../middleware/auth";
const handler = nc() //.use(auth);
handler.post(async (req, res, next) => {

    // const { body } = req

    try {

        let orderSeq = await prisma.orderNoSeq.upsert({
            where: { id: 1 },
            create: { id: 1, seqNo: 1 },
            update: {
                seqNo: 0
            }
        })

        res.status(200)
            .json(orderSeq);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});



export default handler;

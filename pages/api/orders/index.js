import nc from "next-connect";
import { prisma } from '@/utils/db'
// import OrderNo from "../../../models/OrderNo";
// import db from "../../../utils/db";
// import auth from "../../../middleware/auth";
const handler = nc() //.use(auth);
handler.post(async (req, res, next) => {

    const { body: data } = req

    // const data = {
    //     orderNo: 'Z001',
    //     qty: 100,
    //     unitPrice: 1,
    //     amount: 100,
    //     userId: 27,
    //     status: 'unpaid'
    // }

    try {
        let order = await prisma.order.create({ data })

        res.status(201)
            .json(order);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});

export default handler;

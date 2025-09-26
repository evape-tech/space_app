import nc from "next-connect";
import { prisma } from '@/utils/db'
// import OrderNo from "../../../models/OrderNo";
// import db from "../../../utils/db";
// import auth from "../../../middleware/auth";
const handler = nc() //.use(auth);

handler.get(async (req, res, next) => {

    const { orderId } = req.query

    try {
        const order = await prisma.order.findUnique({
            where: { id: +orderId }
        })

        if (order) {
            res.status(200).json(order);
        }
        else {
            res.status(404).json({
                code: 404,
                message: "Order not found."
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});

handler.put(async (req, res, next) => {

    const { query: { orderId }, body: data } = req

    // const data = {
    //     orderNo: 'Z001',
    //     qty: 100,
    //     unitPrice: 1,
    //     amount: 100,
    //     userId: 27,
    //     status: 'unpaid'
    // }

    try {
        let order = await prisma.order.update({
            where: { id: orderId },
            data: data
        })

        res.status(200)
            .json(order);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});

handler.delete(async (req, res, next) => {

    const { orderId } = req.query

    // const data = {
    //     acc: '0933512472',
    //     provider: "phone"
    // }

    try {
        const deleteOrder = await prisma.order.delete({
            where: {
                id: +orderId,
            },
        })

        // const users = await prisma.user.findMany()
        res.status(200)
            .json(deleteOrder);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});

export default handler;

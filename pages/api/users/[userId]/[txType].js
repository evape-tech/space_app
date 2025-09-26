import nc from "next-connect";
import { prisma } from '@/utils/db'
// import User from "../../../models/User";
// import db from "../../../utils/db";
// import auth from "../../../middleware/auth";
const handler = nc() //.use(auth);

handler.post(async (req, res, next) => {

    const { body, query: { txType } } = req

    // const data = {
    //     acc: '0933512472',
    //     provider: "phone"
    // }

    body.txType = txType  // income / spend

    try {
        const tx = await prisma.walletTx.create({
            data: body,
        })

        // const users = await prisma.user.findMany()
        res.status(201)
            .json(tx);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});



export default handler;

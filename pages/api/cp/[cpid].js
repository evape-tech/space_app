import nc from "next-connect";
import { prisma } from '@/utils/db'

// import User from "../../../models/User";
// import db from "../../../utils/db";
// import auth from "../../../middleware/auth";
const handler = nc() //.use(auth);
handler.get(async (req, res, next) => {

    const { cpid } = req.query

    // const data = {
    //     acc: '0933512472',
    //     provider: "phone"
    // }

    try {
        const cPile = await prisma.cPile.findUnique({
            where: {
                cpIdKey: cpid
            }
        })
        res.status(200)
            .json(cPile);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});

handler.post(async (req, res, next) => {

    const { cpid } = req.query

    // const data = {
    //     acc: '0933512472',
    //     provider: "phone"
    // }

    try {
        const cpStatus = await prisma.cPileStatus.findUnique({
            where: {
                cpIdKey: cpid
            }
        })
        res.status(200)
            .json(cpStatus);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});

export default handler;

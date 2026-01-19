import nc from "next-connect";
import { prisma } from '@/utils/db'

/**
 * @deprecated 此 API 已棄用
 * 用戶管理現在完全通過遠端 API (NEXT_PUBLIC_BACKEND_API)
 * 所有用戶認證和資料操作都應該使用後端 API
 */

// import User from "../../../models/User";
// import db from "../../../utils/db";
// import auth from "../../../middleware/auth";
const handler = nc() //.use(auth);
handler.post(async (req, res, next) => {

    const { body } = req

    // const data = {
    //     acc: '0933512472',
    //     provider: "phone"
    // }

    try {
        const newUser = await prisma.user.create({
            data: body,
        })

        // const users = await prisma.user.findMany()
        res.status(201)
            .json(newUser);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});

handler.get(async (req, res, next) => { // all
    try {
        const users = await prisma.user.findMany(
            {
                include: {
                    profile: true,
                },
            }
        )

        // const users = await prisma.user.findMany()
        res.status(200)
            .json(users);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});

export default handler;

import nc from "next-connect";
import { prisma } from '@/utils/db'

/**
 * @deprecated 此 API 已棄用
 * 用戶 Profile 管理現在完全通過遠端 API (NEXT_PUBLIC_BACKEND_API)
 * 所有 profile 操作都應該使用後端 API
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
        const newProfile = await prisma.profile.create({
            data: body,
        })

        // const users = await prisma.user.findMany()
        res.status(201)
            .json(newProfile);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});

export default handler;

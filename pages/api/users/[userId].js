import nc from "next-connect";
import { prisma } from '@/utils/db'

/**
 * @deprecated 此 API 已棄用
 * 用戶資料管理現在完全通過遠端 API (NEXT_PUBLIC_BACKEND_API)
 * 所有用戶查詢、更新和刪除操作都應該使用後端 API
 */

// import User from "../../../models/User";
// import db from "../../../utils/db";
// import auth from "../../../middleware/auth";
const handler = nc() //.use(auth);

handler.get(async (req, res, next) => {

    const { userId } = req.query

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: +userId
            },
            include: {
                profile: true
            }
        })

        if (user) {
            res.status(200).json(user);
        }
        else {
            res.status(404).json({
                code: 404,
                message: "User not found."
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

    const { body, query: { userId } } = req

    // const data = {
    //     acc: '0933512472',
    //     provider: "phone"
    // }

    try {
        const uid = +userId

        // ensure user exists
        const user = await prisma.user.findUnique({ where: { id: uid } })
        if (!user) {
            return res.status(404).json({ code: 404, message: 'User not found.' })
        }

        // create profile if missing, otherwise update
        const profile = await prisma.profile.upsert({
            where: { userId: uid },
            create: Object.assign({ userId: uid }, body),
            update: body,
        })

        // const users = await prisma.user.findMany()
        res.status(200)
            .json(profile);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});

handler.delete(async (req, res, next) => {

    const { userId } = req.query

    // const data = {
    //     acc: '0933512472',
    //     provider: "phone"
    // }

    try {
        const deleteUser = await prisma.user.delete({
            where: {
                id: +userId,
            },
        })

        // const users = await prisma.user.findMany()
        res.status(200)
            .json(deleteUser);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});

export default handler;

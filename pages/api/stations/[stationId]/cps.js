import nc from "next-connect";
import { prisma } from '@/utils/db'
const handler = nc()

handler.get(async (req, res, next) => { // all
    const { stationId } = req.query
    try {
        const cps = await prisma.cPile.findMany({
            where: {
                stationId: +stationId
            }
        })
        res.status(200).json(cps);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});

export default handler;

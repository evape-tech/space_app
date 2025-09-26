import nc from "next-connect";
import { prisma } from '@/utils/db'
import { Prisma } from "@prisma/client";
// import User from "../../../models/User";
// import db from "../../../utils/db";
// import auth from "../../../middleware/auth";
const handler = nc() //.use(auth);



handler.get(async (req, res, next) => { // all
    try {
        var json = {lat: 0 , lng: 0}
        const stations = await prisma.station.findMany(
            {
                where:{
                    NOT:[
                        {
                            latLng: {
                                equals: json
                            },
                        },
                        {
                            latLng: {
                                equals: Prisma.DbNull
                            },
                        }
                    ]
                }
            }
        )

        // const stations = await prisma.station.findMany()
        res.status(200)
            .json(stations);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});

export default handler;

import nc from "next-connect";
import { prisma } from '@/utils/db'

// import User from "../../../models/User";
// import db from "../../../utils/db";
// import auth from "../../../middleware/auth";
const handler = nc() //.use(auth);

handler.get(async (req, res, next) => {

    const { carId } = req.query

    try {
        const car = await prisma.car.findUnique({
            where: {
                id: +carId
            }
        })

        if (car) {
            res.status(200).json(car);
        }
        else {
            res.status(404).json({
                code: 404,
                message: "Car not found."
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

    const { body, query: { carId } } = req

    // const data = {
    //     acc: '0933512472',
    //     provider: "phone"
    // }

    try {
        const car = await prisma.car.update({
            where: {
                id: +carId,
            },
            data: body
        })

        // const users = await prisma.user.findMany()
        res.status(200)
            .json(car);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});

handler.delete(async (req, res, next) => {

    const { carId } = req.query

    // const data = {
    //     acc: '0933512472',
    //     provider: "phone"
    // }

    try {
        const deleteCar = await prisma.car.delete({
            where: {
                id: +carId,
            },
        })

        // const users = await prisma.user.findMany()
        res.status(200)
            .json(deleteCar);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: 500,
            message: error.message
        });
    }
});

export default handler;

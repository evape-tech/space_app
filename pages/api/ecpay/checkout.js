import nc from "next-connect";
import { prisma } from '@/utils/db'
import { genHtml } from '@/utils/paymentHtml'
// import short from 'short-uuid';

// import User from "../../../models/User";
// import db from "../../../utils/db";
// import auth from "../../../middleware/auth";
const handler = nc() //.use(auth);
import dayjs from '@/utils/dayjs'
handler.post(async (req, res, next) => {

    const { body } = req
    const { orderTxNo, userId, points } = body

    // const translator = short(); // Defaults to flickrBase58
    // const orderNo = translator.generate().slice(2); // An alias for new.
    // console.log(orderNo)
    const txDT = dayjs.tz(dayjs(), process.env.APP_TIMEZONE || 'UTC').format('YYYY/MM/DD HH:mm:ss')

    const param = {
        MerchantTradeNo: orderTxNo, //請帶20碼uid, ex: f0a0d7e9fae1bb72bc93
        MerchantTradeDate: txDT, //'2023/01/29 15:18:30', //ex: 2017/02/13 15:45:30
        TotalAmount: points,
        CustomField1: userId
    }
    const html = genHtml(param)
    console.log(html)
    res.status(200)
        .send(html);

});

export default handler;

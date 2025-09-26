import nc from "next-connect";

const handler = nc() //.use(auth);

const smsUrl = process.env.SMS_API_URL;

const smsSend = async (phoneNo, vcode) => {
    const formData = new URLSearchParams();
    formData.append('username', "53150983SMS");
    formData.append('password', "Aa1234567");
    formData.append('dstaddr', phoneNo);
    formData.append('smbody', vcode);
    const res = await fetch(
        `${smsUrl}?` + new URLSearchParams({ CharsetURL: "UTF-8" }),
        {
            method: "POST",
            body: formData.toString(),
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
    );
    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data');
    }
    return res; // not json

};

handler.post(async (req, res, next) => {

    const { body: { phoneNo, vcode } } = req
    console.log(phoneNo, vcode)

    try {
        const rep = await smsSend(phoneNo, vcode)
        res.status(200).json({ message: "sms sent." });
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }

});

export default handler;

const transporter=require("../mails/transport")

const sendmail = async (to, sub, body) => {
    if (!process.env.gmail_name || !process.env.gmail_pass) {
        console.log(`Email is not configured. Message for ${to}: ${body}`);
        return;
    }

    const mail = {
        from: process.env.gmail_name,
        to: to,
        subject: sub,
        text: body
    };
    return transporter.sendMail(mail);
};

module.exports = sendmail;

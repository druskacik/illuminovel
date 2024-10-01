import nodemailer from 'nodemailer';

const environment = process.env.NODE_ENV || 'development';

const sendMail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: process.env.MAIL_PORT === '465',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });
    const info = await transporter.sendMail(options);
    if (environment === 'development') {
        console.log(`[EMAIL] Test preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
};

export default sendMail;

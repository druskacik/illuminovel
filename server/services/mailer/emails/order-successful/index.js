import Mustache from 'mustache';
import sendMail from '../../index.js';

const templateText = `
Order successful!

Your result will be available in a few moments at:

{{{ url }}}

--
https://illuminovel.com
`

const sendOrderSuccessfulEmail = async (email, resultsUrl) => {
    try {
        console.log(`Sending order successful email to ${email}`);

        const text = Mustache.render(templateText, {
            url: resultsUrl,
        });

        const options = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Illuminovel - Order Successful',
            text,
        };

        await sendMail(options);
    } catch (err) {
        console.error('Error sending order successful email:', err);
    }
};

export default sendOrderSuccessfulEmail;

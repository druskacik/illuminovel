import sendOrderSuccessfulEmail from '../services/mailer/emails/order-successful';

export default defineEventHandler(async (event) => {

    const { email } = getQuery(event);
    const config = useRuntimeConfig(event)
    const baseUrl = config.public.baseUrl

    try {

        const resultsUrl = `${baseUrl}/create?email=${email}`
        await sendOrderSuccessfulEmail(email, resultsUrl);

        return {
            status: 200,
            message: 'Email sent successfully',
        }

    } catch (error) {
        console.log(error)
        return createError({
            statusCode: 500,
            message: 'Failed to send email',
        });
    }
});

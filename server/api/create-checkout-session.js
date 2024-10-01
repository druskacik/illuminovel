import { useServerStripe } from "#stripe/server";

export default defineEventHandler(async (event) => {

    const config = useRuntimeConfig(event)
    const baseUrl = config.public.baseUrl

    const body = await readBody(event);
    const { book } = body;

    const stripe = await useServerStripe(event);
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Illustrate "${book.title}"`,
                        },
                        unit_amount: 200, // $2.00 in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${baseUrl}/create?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/`,
            metadata: book,
        });

        return { url: session.url };
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw createError({
            statusCode: 500,
            message: 'Failed to create checkout session',
        });
    }
});

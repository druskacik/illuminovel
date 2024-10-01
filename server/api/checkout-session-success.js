import { ObjectId } from 'mongodb';
import { useServerStripe } from "#stripe/server";

import mongoClient from '../db/mongo-client';
import agenda from '../jobs/agenda';
import sendOrderSuccessfulEmail from '../services/mailer/emails/order-successful';

export default defineEventHandler(async (event) => {

    const { session_id } = getQuery(event);
    const config = useRuntimeConfig(event)
    const baseUrl = config.public.baseUrl

    try {
        const stripe = await useServerStripe(event);
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== 'paid') {
            throw createError({
                statusCode: 400,
                message: 'Payment not completed',
            });
        }

        const { author, title, md5, extension, filename } = session.metadata;
        const email = session.customer_details.email;

        // Check if order already exists
        const database = mongoClient.db(process.env.MONGODB_DB_NAME);
        const ordersCollection = database.collection('orders');
        const existingOrder = await ordersCollection.findOne({ sessionId: session.id });

        if (existingOrder) {
            // If order exists, return details from the collection
            const jobId = ObjectId.createFromHexString(existingOrder.jobId)
            const jobs = await agenda.jobs({ _id: jobId })
            const job = jobs[0]

            if (job.attrs.data.status === 'completed') {
                const characters = job.attrs.data.characters;
                return {
                    jobId: existingOrder.jobId,
                    status: 'completed',
                    bookInfo: {
                        title,
                        author,
                        filename,
                    },
                    characters,
                };
            } else {
                return {
                    sessionId: session.id,
                    jobId: existingOrder.jobId,
                    status: 'pending',
                    bookInfo: {
                        title,
                        author,
                        filename,
                    },
                };
            }
        } else {
            // If order doesn't exist, start the agenda job and create the order
            const job = await agenda.now('generate-illustrations', {
                md5,
                extension,
                filename,
                sessionId: session.id,
                status: 'pending',
            });

            const order = {
                email,
                title,
                author,
                md5,
                extension,
                filename,
                paid: true,
                sessionId: session.id,
                jobId: job.attrs._id.toString(),
            };

            // Insert the new order into the collection
            await ordersCollection.insertOne(order);

            const resultsUrl = `${baseUrl}/create?session_id=${session_id}`
            await sendOrderSuccessfulEmail(email, resultsUrl);

            return {
                sessionId: session.id,
                jobId: job.attrs._id.toString(),
                status: 'pending',
                bookInfo: {
                    title,
                    author,
                    filename,
                },
            };
        }
    } catch (error) {
        console.error('Error verifying checkout session:', error);
        return createError({
            statusCode: 500,
            message: 'Failed to verify checkout session',
        });
    }
});

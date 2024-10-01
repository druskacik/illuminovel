import { ObjectId } from 'mongodb';
import { useServerStripe } from "#stripe/server";
import { PassThrough } from 'stream';

import mongoClient from '../db/mongo-client';
import agenda from '../jobs/agenda';

export default defineEventHandler(async (event) => {

    const { session_id } = getQuery(event);

    try {
        const stripe = await useServerStripe(event);
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== 'paid') {
            throw createError({
                statusCode: 400,
                message: 'Payment not completed',
            });
        }

        // Check if order already exists
        const database = mongoClient.db(process.env.MONGODB_DB_NAME);
        const ordersCollection = database.collection('orders');
        const existingOrder = await ordersCollection.findOne({ sessionId: session.id });

        if (!existingOrder) {
            throw createError({
                statusCode: 404,
                message: 'Order not found',
            });
        }

        // If order exists, return details from the collection
        const jobId = ObjectId.createFromHexString(existingOrder.jobId)
        const jobs = await agenda.jobs({ _id: jobId })
        const job = jobs[0]

        setHeader(event, 'Content-Type', 'application/json');
        setHeader(event, 'Transfer-Encoding', 'chunked');
        setHeader(event, 'Cache-Control', 'no-cache');
        setHeader(event, 'Connection', 'keep-alive');
        setResponseStatus(event, 200);
        
        const stream = new PassThrough()
        listenToAgendaJob(job.attrs._id, stream)
        return sendStream(event, stream)
    } catch (error) {
        console.error('Error verifying checkout session:', error);
        throw createError({
            statusCode: 500,
            message: 'Failed to verify checkout session',
        });
    }
});


async function listenToAgendaJob(jobId, stream) {
    let lastCharacterCount = 0;
    let isJobCompleted = false;

    while (!isJobCompleted) {
        const job = await agenda.jobs({ _id: jobId });

        if (job && job.length > 0) {
            const currentJob = job[0];
            const characters = currentJob.attrs.data.characters || [];

            // Check for new characters
            if (characters.length > lastCharacterCount) {
                for (let i = lastCharacterCount; i < characters.length; i++) {
                    stream.write(JSON.stringify(characters[i]) + '\n');
                }
                lastCharacterCount = characters.length;
            }

            // Check if job is completed
            if (currentJob.attrs.data.status === 'completed') {
                isJobCompleted = true;
                // TODO: send share url
                // stream.write(JSON.stringify({ _id: jobId, status: 'completed' }) + '\n');
            } else if (currentJob.attrs.data.status === 'failed') {
                isJobCompleted = true;
                stream.write(JSON.stringify({ _id: jobId, status: 'failed', error: 'Job processing failed' }) + '\n');
            }
        }

        if (!isJobCompleted) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before next check
        }
    }

    stream.end(); // End the stream when job is completed or failed
}

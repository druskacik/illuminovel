import Agenda from 'agenda';

import downloadBook from '../utils/download-book-from-libgen';
import extractTextFromPDF from '../utils/extract-text-from-pdf';
import extractTextFromEpub from '../utils/extract-text-from-epub';
import mongoClient from '../db/mongo-client';
import minioClient from '../db/minio-client';
import { extractCharacters } from '../gemini/extract-characters';
import { generateImage } from '../flux/generate-image';

const agenda = new Agenda({
    db: {
        address: process.env.MONGODB_URI_AGENDA,
        collection: 'agendaJobs',
    },
});

agenda.define('generate-illustrations', async (job, done) => {

    let { md5, extension, filename, nRetries } = job.attrs.data;
    nRetries = nRetries || 0;
    
    // if filename is defined, the file was provided by the user
    const minioBookPath = filename || `${md5}.${extension}`;

    try {

        let file;
        try {
            file = await minioClient.getFile('illuminovel', minioBookPath);
        } catch (err) {
            file = await downloadBook(md5, minioBookPath);
        }

        let text = '';
        if (extension === 'pdf') {
            text = await extractTextFromPDF(file, minioBookPath);
        } else if (extension === 'epub') {
            text = await extractTextFromEpub(file, minioBookPath);
        } else {
            throw new Error('Unsupported file type');
        }

        // dummy
        // const dummyCharacters = [
        //     { name: "Alice", description: "A curious and adventurous young girl.\nNew Paragraph", imageUrl: "https://placehold.co/1024x1024" },
        //     { name: "Bob", description: "A friendly and helpful neighbor", imageUrl: "https://placehold.co/1024x1024" },
        //     { name: "Charlie", description: "A mischievous and playful cat", imageUrl: "https://placehold.co/1024x1024" },
        //     { name: "Diana", description: "A wise and mysterious old woman", imageUrl: "https://placehold.co/1024x1024" }
        // ];

        // for (const character of dummyCharacters) {
        //     console.log('character', character.name)
        //     const prompt = `${character.description} Photorealistic.`;
        //     // const imageUrl = await generateImage(prompt);
        //     const characterWithImage = {
        //       name: character.name,
        //       description: prompt,
        //       imageUrl: "https://placehold.co/1024x1024"
        //     };
        //     job.attrs.data.characters = [...(job.attrs.data.characters || []), characterWithImage];

        //     // sleep for 5 seconds
        //     await new Promise(resolve => setTimeout(resolve, 5000));
        //     await job.save();
        // }

        for await (const character of extractCharacters(text)) {
            const prompt = `${character.description} Photorealistic.`;
            const imageUrl = await generateImage(prompt);
            const characterWithImage = {
                name: character.name,
                description: prompt,
                imageUrl,
            };
            job.attrs.data.characters = [...(job.attrs.data.characters || []), characterWithImage];
            await job.save();
        }

        job.attrs.data.status = 'completed';
        await job.save();

        done();
    } catch (error) {
        console.error('Error generating illustrations:', error);
        job.attrs.data.status = 'failed';
        await job.save();

        // repeat the job
        // TODO: the uniqueID is necessary, otherwise the same job would be re-run
        // TODO: check whether this can be used - it would mean we don't need to update the jobId in the orders collection
        const newJob = await agenda.schedule(new Date(Date.now() + 10000* (2**nRetries)), 'generate-illustrations', {
            ...job.attrs.data,
            nRetries: nRetries + 1,
            status: 'pending',
            uniqueId: Date.now().toString()
        });

        // Update the order status in the orders collection
        try {
            const database = mongoClient.db(process.env.MONGODB_DB_NAME);
            const ordersCollection = database.collection('orders');
            
            await ordersCollection.updateOne(
                { jobId: job.attrs._id.toString() },
                { $set: { jobId: newJob.attrs._id.toString() } }
            );
        } catch (dbError) {
            console.error('Error updating order status:', dbError);
        }

        done();
    }
});

agenda.start();

export default agenda;

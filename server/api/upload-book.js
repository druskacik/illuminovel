import minioClient from '../db/minio-client';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { name, file, extension } = body;

        if (!file) {
            console.log('No file provided')
            return createError({
              statusCode: 400,
              message: 'No file provided'
            });
        }

        // TODO: add metadata
        const metadata = null;
        const savePath = name
        const response = await minioClient.uploadFile('illuminovel', savePath, Buffer.from(file, 'base64'), metadata)
        return {
            status: 200,
            message: 'Book uploaded successfully',
            response: response
        }
    } catch (error) {
        console.error('Error uploading book:', error)
        return createError({
            statusCode: 500,
            statusMessage: 'An error occurred while uploading a book'
        });
    }
});
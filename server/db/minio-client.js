// import { Readable } from 'stream';
import * as Minio from 'minio'

class MinioClient {
    constructor() {
        this.client = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT,
            useSSL: true,
            accessKey: process.env.MINIO_ACCESS_KEY,
            secretKey: process.env.MINIO_SECRET_KEY,
        })
    }

    async uploadFile(bucketName, objectName, contentAsBlob, metadata = null) {
        // const preparedMetadata = metadata ? this.prepareMetadata(metadata) : null;
        // const readableStream = contentAsBlob.stream();
        const readableStream = Buffer.from(contentAsBlob);
        return this.client.putObject(bucketName, objectName, readableStream, null, metadata);
    }

    async getFile(bucketName, objectName) {
        const dataStream = await this.client.getObject(bucketName, objectName);
        
        // Convert the stream to a buffer
        const chunks = [];
        for await (const chunk of dataStream) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        return buffer;
    }

    static prepareMetadata(metadata) {
        return Object.fromEntries(
            Object.entries(metadata).map(([key, val]) => [`x-amz-meta-${key.toLowerCase().replace("_", "")}`, val])
        );
    }

    static readMetadata(response) {
        return Object.fromEntries(
            Object.entries(response)
                .filter(([key]) => key.startsWith('x-amz-meta-'))
                .map(([key, val]) => [key.slice(11), val])
        );
    }
}

const minioClient = new MinioClient();

export default minioClient;
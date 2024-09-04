import { v2 as cloudinary } from 'cloudinary';

import { config } from 'dotenv';
config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function generateImage(description) {
    try {
        const response = await $fetch('https://api.getimg.ai/v1/flux-schnell/text-to-image', {
            method: 'POST',
            body: {
                prompt: description,
            },
            headers: {
                'Authorization': `Bearer ${process.env.GETIMG_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.image) {
            const { image } = response;

            // Upload image to cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }).end(Buffer.from(image, 'base64'));
            });

            // Return the cloudinary URL
            return uploadResult.secure_url;
        } else {
            throw new Error('No image data in the response');
        }
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}

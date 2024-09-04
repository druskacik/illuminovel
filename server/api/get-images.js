import extractTextFromPDF from '../utils/extract-text-from-pdf';
import extractTextFromEpub from '../utils/extract-text-from-epub';
import { extractCharacters } from '../gemini/extract-characters';
import { generateImage } from '../flux/generate-image';
import { createError } from 'h3';
import { PassThrough } from 'stream';

import client from '../db/mongo-client';


export default defineEventHandler(async (event) => {
  try {

    setHeader(event, 'Content-Type', 'application/json');
    setHeader(event, 'Transfer-Encoding', 'chunked');
    setHeader(event, 'Cache-Control', 'no-cache');
    setHeader(event, 'Connection', 'keep-alive');

    const body = await readBody(event);
    const { name, file, fileType } = body;

    if (!file) {
      console.log('No file provided')
      return createError({
        statusCode: 400,
        message: 'No file provided'
      });
    }

    let text = '';

    if (fileType === 'application/pdf') {
      text = await extractTextFromPDF(file, name);
    } else if (fileType === 'application/epub+zip') {
      text = await extractTextFromEpub(file, name);
    }

    const stream = new PassThrough()

    setResponseStatus(event, 200);
    
    // Start the processing
    processTextAndStream(text, stream)
    return sendStream(event, stream)
  } catch (error) {
    console.error('Error in get-images API:', error);
    return createError({
      statusCode: 500,
      message: 'Internal server error'
    });
  }
});

async function processTextAndStream(text, stream) {
  try {
    let index = 0;
    const characters = [];
    let bookName = '';
    for await (const character of extractCharacters(text)) {
      if (index === 0) {
        bookName = character.bookName;
      }
      const prompt = `${character.description} Photorealistic.`;
      const imageUrl = await generateImage(prompt);
      const characterWithImage = {
        name: character.name,
        description: prompt,
        imageUrl,
      };
      stream.write(JSON.stringify({
        ...characterWithImage,
        index,
      }) + '\n');
      characters.push(characterWithImage);
      index++;
    }

    // Save characters to MongoDB
    try {
      const db = client.db('bookCharacters');
      const collection = db.collection('characters');
      
      const result = await collection.insertOne({
        bookName: bookName,
        characters: characters,
      })
      stream.write(JSON.stringify({
        _id: result.insertedId,
      }) + '\n');
    } catch (dbError) {
      console.error('Error saving characters to MongoDB:', dbError);
    }
  } catch (error) {
    console.error('Error processing characters:', error);
    stream.write(JSON.stringify({ error: 'Error processing characters' }) + '\n');
  } finally {
    console.log('Stream ended');
    stream.end(); // End the stream when all characters have been processed
  }

  // If the client disconnects, stop the processing
  stream.on('close', () => {
    console.log('Client disconnected');
  });
}

import { createError } from 'h3';
import { PassThrough } from 'stream';

export default defineEventHandler(async (event) => {
  try {

    setHeader(event, 'Content-Type', 'application/json');
    setHeader(event, 'Transfer-Encoding', 'chunked');
    setHeader(event, 'Cache-Control', 'no-cache');
    setHeader(event, 'Connection', 'keep-alive');
    const stream = new PassThrough()

    setResponseStatus(event, 200);
    
    // Start the processing
    processTextAndStream('DUMMY', stream)
    return sendStream(event, stream)
  } catch (error) {
    console.error('Error in get-images API:', error);
    return createError({
      statusCode: 500,
      message: 'Internal server error'
    });
  }
});

const dummyCharacters = [
  { name: "Alice", description: "A curious and adventurous young girl", imageUrl: "https://placehold.co/1024x1024" },
  { name: "Bob", description: "A friendly and helpful neighbor", imageUrl: "https://placehold.co/1024x1024" },
  // { name: "Charlie", description: "A mischievous and playful cat", imageUrl: "https://placehold.co/1024x1024" },
  // { name: "Diana", description: "A wise and mysterious old woman", imageUrl: "https://placehold.co/1024x1024" }
];

async function processTextAndStream(text, stream) {
  try {
    let index = 0;
    for (const character of dummyCharacters) {
      const prompt = `${character.description} Photorealistic.`;
      stream.write(JSON.stringify({
        name: character.name,
        description: prompt,
        imageUrl: character.imageUrl,
        index,
      }) + '\n');
      index++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    // send dummy id
    stream.write(JSON.stringify({
      _id: 'dummy-id',
    }) + '\n');
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

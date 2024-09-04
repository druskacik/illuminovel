import { createError } from 'h3';
import { ObjectId } from 'mongodb';

import client from '../db/mongo-client';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = query.id;

  if (!id) {
    return createError({
      statusCode: 400,
      message: 'Missing id parameter'
    });
  }

  try {
    const database = client.db('bookCharacters');
    const collection = database.collection('characters');

    const result = await collection.findOne({ _id: new ObjectId(id) });

    if (!result) {
      return createError({
        statusCode: 404,
        message: 'No data found for this id'
      });
    }

    return {
      bookName: result.bookName,
      characters: result.characters
    };
  } catch (error) {
    console.error('Error fetching shared data:', error);
    return createError({
      statusCode: 500,
      message: 'Internal server error'
    });
  }
});

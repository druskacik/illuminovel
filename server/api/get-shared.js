import { createError } from 'h3';
import { ObjectId } from 'mongodb';

import client from '../db/mongo-client';

const getResult = async (id, dbName, collectionName) => {
  const database = client.db(dbName);
  const collection = database.collection(collectionName);

  const result = await collection.findOne({ _id: new ObjectId(id) });

  return result;
}

export default defineEventHandler(async (event) => {
  console.log('get-shared')
  const query = getQuery(event);
  const id = query.id;

  console.log(`id ${id}`)

  if (!id) {
    return createError({
      statusCode: 400,
      message: 'Missing id parameter'
    });
  }

  try {
    let result = await getResult(id, 'bookCharacters', 'characters');
    console.log(`result ${id}`, result)

    if (!result) {
      result = await getResult(id, process.env.MONGODB_DB_NAME, 'agendaJobs');
      console.log(`result ${process.env.MONGODB_DB_NAME} ${id}`, result)
      if (result) {
        return {
          bookName: result.data.filename,
          characters: result.data.characters
        };
      }
    }

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

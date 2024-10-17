import { SearchClient as TypesenseSearchClient } from "typesense";

let client = new TypesenseSearchClient({
  'nodes': [{
    'host': process.env.TYPESENSE_HOST,
    'port': process.env.TYPESENSE_PORT,
    'protocol': 'http'
  }],
  'apiKey': process.env.TYPESENSE_API_KEY,
  'connectionTimeoutSeconds': 2
})

export default defineEventHandler(async (event) => {
  try {
    const { q: query } = getQuery(event);
    
    if (!query) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Query parameter is required'
      });
    }

    let searchParameters = {
      'q'         : query,
      'query_by'  : 'title',
      'sort_by'   : 'relevance:desc'
    }
    
    const response = await client.collections('books').documents().search(searchParameters)
    return response.hits.map((book) => ({
      bookId: book.document.wikidata_id,
      title: book.document.title,
      author: book.document.authors.join(', '),
    }))
  } catch (error) {
    console.error('Error suggesting book:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred while suggesting a book'
    });
  }
});



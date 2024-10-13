export default defineEventHandler(async (event) => {
  try {
    const { q: query } = getQuery(event);
    
    if (!query) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Query parameter is required'
      });
    }

    const url = `https://www.goodreads.com/book/auto_complete?format=json&q=${encodeURIComponent(query)}`

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch data from Goodreads API');
    }

    const data = await response.json();
    return data.map((book) => ({
      bookId: book.bookId,
      bookUrl: book.bookUrl,
      imageUrl: book.imageUrl,
      title: book.bookTitleBare,
      author: book?.author?.name || '',
    }));
    
  } catch (error) {
    console.error('Error suggesting book:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred while suggesting a book'
    });
  }
});



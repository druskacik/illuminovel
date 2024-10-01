export default defineEventHandler(async (event) => {
  try {
    const { q: query } = getQuery(event);
    
    if (!query) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Query parameter is required'
      });
    }

    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch data from OpenLibrary API');
    }

    const data = await response.json();

    if (data.docs.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No books found matching the query'
      });
    }

    const suggestedBooks = data.docs.map(book => ({
      olid: book.olid || 'xx',
      key: book.key,
      title: book.title,
      author: book.author_name ? book.author_name[0] : 'Unknown',
      publishYear: book.first_publish_year,
      coverImage: book.cover_i ? `http://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null
    }));

    return suggestedBooks;
  } catch (error) {
    console.error('Error suggesting book:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred while suggesting a book'
    });
  }
});



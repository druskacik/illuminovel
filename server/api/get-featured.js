import knex from '../utils/connection';

export default defineEventHandler(async (event) => {
  try {
    const recentPlaylists = await knex('playlist')
      .select('name', 'spotify_url', 'image_url', 'book_title', 'book_author')
      .orderBy('id', 'desc')
      .limit(5);

    return recentPlaylists.map(playlist => ({
      title: playlist.book_title,
      author: playlist.book_author,
      spotifyLink: playlist.spotify_url,
      imageUrl: playlist.image_url
    }));
  } catch (error) {
    console.error('Error fetching recent playlists:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred while fetching recent playlists'
    });
  }
});

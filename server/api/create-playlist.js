import knex from '../utils/connection';
import { createSpotifyPlaylist } from '../services/spotify';
// import { generateSoundtrackDescription } from '../services/claude';
import { generateSoundtrackDescription } from '../services/openai';

export default defineEventHandler(async (event) => {

    const book = await readBody(event);
    const { bookId, title, author } = book;

    // Check if a playlist for the given bookId already exists in the DB
    const existingPlaylist = await knex('playlist')
        .where({ book_id: bookId })
        .first();

    if (existingPlaylist) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        return {
            spotifyUrl: existingPlaylist.spotify_url,
            imageUrl: existingPlaylist.image_url,
            tracks: existingPlaylist.tracks,
        };
    }

    const soundtrackDescription = await generateSoundtrackDescription(title, author);

    const apiEndpoint = process.env.EMBEDDINGS_API_ENDPOINT;
    const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: soundtrackDescription }),
    });

    const data = await response.json();
    const embeddings = data.query_embedding;
    const embeddingStr = `[${embeddings.join(',')}]`;

    const results = await knex.raw('SELECT * FROM track ORDER BY embedding <=> ? LIMIT 50', [embeddingStr]);
    const trackUris = results.rows.map(row => row.spotify_track_uri);

    const playlistName = `${author} - ${title} Soundtrack`;
    const playlist = await createSpotifyPlaylist(trackUris, playlistName);

    // Insert the playlist information into the database
    await knex('playlist').insert({
        name: playlist.name,
        description: soundtrackDescription,
        spotify_url: playlist.external_urls.spotify,
        spotify_playlist_id: playlist.id,
        image_url: playlist.images[0].url,
        tracks: JSON.stringify(playlist.tracks.items.map(item => ({
            title: item.track.name,
            artist: item.track.artists[0].name,
        }))),
        book_id: bookId,
        book_url: `https://www.wikidata.org/wiki/${bookId}`,
        book_title: title,
        book_author: author,
    });

    return {
        spotifyUrl: playlist.external_urls.spotify,
        imageUrl: playlist.images[0].url,
        tracks: playlist.tracks.items.map(item => ({
            title: item.track.name,
            artist: item.track.artists[0].name,
        })),
    };
});
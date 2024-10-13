const refreshSpotifyAccessToken = async () => {
    const url = "https://accounts.spotify.com/api/token";

    const payload = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: process.env.SPOTIFY_REFRESH_TOKEN
    });

    const headers = {
        'Authorization': 'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: payload
    });

    const data = await response.json();
    return data.access_token;
}

export const createSpotifyPlaylist = async (trackUris, name) => {
    try {
        const accessToken = await refreshSpotifyAccessToken();
        const userId = process.env.SPOTIFY_USER_ID;

        // Create a new playlist
        const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                description: 'Book soundtrack made by https://illuminovel.com.',
                public: true,
            })
        });
        let playlist = await createPlaylistResponse.json();

        // Add tracks to the playlist
        const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uris: trackUris
            })
        });

        await addTracksResponse.json();

        // Reload the playlist to get the updated version with tracks
        const reloadPlaylistResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        playlist = await reloadPlaylistResponse.json();
        return playlist;
    } catch (error) {
        console.error('Error creating Spotify playlist:', error);
        throw error;
    }
}

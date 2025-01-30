async function fetchWebApi(endpoint, token, method, body) {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body: JSON.stringify(body)
  });
  return await res.json();
}

export class Spotify {
    constructor(token, userId) {
        this.token = token;
        this.userId = userId;
    }

    async searchTracks(query, value) {
        return (await fetchWebApi(
            `v1/search?q=${query}&type=${value}`,
            this.token,
            "GET"
        )).tracks;
    }

    async fetchTrackApi (trackName) {
        return (await fetchWebApi(
            `v1/search?q=${trackName}&type=track`, 
            this.token, 
            "GET")).tracks;
    }

    async fetchPlaylistApi (offset, limit) {
        return (await fetchWebApi (
            `v1/users/${this.userId}/playlists?offset=${offset}&limit=${limit}`,
            this.token,
            "GET")).items;
    }

    async fetchGenresApi () {
        return (await fetchWebApi (
            "v1/recommendations/available-genre-seeds",
            this.token,
            "GET")).genres;
    }

    async fetchPlaylistDetails (playlistId) {
        return await fetchWebApi (
            `v1/playlists/${playlistId}`,
            this.token,
            "GET"
        )
    }

    async createPlaylist (name, description, isPublic) {
        return await fetchWebApi (
            `v1/users/${this.userId}/playlists`,
            this.token,
            "POST",
            {name: name,
	        description: description,
	        public: isPublic})
    }

    async addTracks (playlistId, uris, position) {
        return (await fetchWebApi(
            `v1/playlists/${playlistId}/tracks`,
            this.token,
            "POST",
            {
                uris: uris,
                position: position
            }
        ));
    }

    async getAllPlaylists () {
        return (await fetchWebApi(
            `v1/users/${this.userId}/playlists?offset=0&limit=50`,
            this.token,
            "GET"
        )).items;
    }

    async removeTracks (playlistId, tracks) {
        return (await fetchWebApi(
            `v1/playlists/${playlistId}/tracks`,
            this.token,
            "DELETE",
            {
                tracks: tracks
            }
        ));
    }
}


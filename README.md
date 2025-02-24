## Requirements

## Configuration

1. Sign up to Spotify Web API: https://developer.spotify.com/documentation/web-api/tutorials/getting-started
2. Create a `.env` file with the following configurations:
```
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=
SPOTIFT_SCOPES="playlist-modify-public playlist-modify-private playlist-read-private
ugc-image-upload"
SPOTIFY_USERNAME=
```

## CLI

```
Spotify Playlist Generator 🪄

Usage:
    spg [command] [flags]

Available Commands:
    create      Create spotify playlist
    track       Add track to a spotify playlist
    rtrack      Remove track from a spotify playlist
    magic       Generate spotify playlist with AI [llama2]
    delete      Delete playlist
    show        Show playlist
    help        Help about any command

Flags:
    -h, --help      help for spg
    -v, --version   show version
    -g, --genre     track genre
    -p, --playlist  playlist name
    -t, --track     track name
    -a, --author    author name

Use "spg [command] --help" for more information about a command.
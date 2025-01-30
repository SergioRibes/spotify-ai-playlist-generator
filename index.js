import { checkFlags, processFlags } from "./utils.js";
import {Magic} from "./magic.js";
import {Spotify} from "./spotify.js";
import PromptSync from "prompt-sync";
import dotenv from "dotenv";
import axios from "axios";
import open from "open";
import fs from "fs";
import { getRefreshToken } from "./utils.js";

async function startLogin() {
    if (fs.existsSync("auth.env")) {
        await axios.get(`http://localhost:8080/refresh_token?refresh_token=${getRefreshToken()}`)
    } else {
        open("http://localhost:8080/login");
    }
}

async function removeTracksFromPlaylist (playlist) {
    let tracks = []

    let tracksToRemove = [];
    let uris = new Set ()

    for (let i = 0; i < playlist.tracks.items.length; i++) {
        const track = playlist.tracks.items[i].track;
        if(uris.has(track.uri)) {
            continue;
        } else {
            uris.add(track.uri);
            tracks.push({
                uri: track.uri,
                name: track.name,
                artists: track.artists.map(artist => artist.name).join(", ")
            })
        }
    }

    while (true) {
        for(let i = 0; i < tracks.length; i++) {
            console.log(`${i +1} - ${tracks[i].artists}, ${tracks[i].name}`);
        }
        console.log("-1 - exit");
        const trackNumber = parseInt(prompt("Choose track to delete (number): "));
        if (trackNumber == -1) break;
        tracksToRemove.push({
            uri: tracks[trackNumber - 1].uri
        })
    }
    const response = await spotify.removeTracks(playlist.id, tracksToRemove);
    if ("snapshot_id" in response) {
        console.log(`Tracks removed successfully from ${playlist.name}.`);
    } else {
        console.log("Something went wrong. Please try again.")
    }

}

async function addTrackToPlaylist (query, playlist) {
    const tracksSearched = await spotify.searchTracks(query, "artist,track")
    let uris = [];
    if (tracksSearched.items) {
        const track = tracksSearched.items[0];
        if (track) {
            console.log(track.name);
            console.log(track.artists.map(artist => artist.name).join(", "));
            console.log(track.external_urls.spotify);
            uris.push(track.uri);
        } else {
            console.log("Track not found. Please try again.")
            return;
        }
        
    } else {
        console.log("No tracks were found")
        return;
    }
    if (uris.length > 0) {
        const response = await spotify.addTracks (playlist.id, uris, 0);
        if ("snapshot_id" in response) {
            console.log(`Track added successfully to ${playlist.name}. Playlist available at ${playlist.external_urls.spotify}`);
        } else {
            console.log("Something went wrong. Please try again.")
        }
    }
}
async function pickPlaylist() {
    const playlists = await spotify.getAllPlaylists();
    const playlistIds = [];
    
    for (playlist in playlists) {
    const playlistId = playlists[playlist].id;
    const playlistInfo = await spotify.fetchPlaylistDetails(playlistId);
    console.log(`${Number(playlist) + 1} - ${playlistInfo.name}`)
    playlistIds.push(playlistId);
    }
const playlistNumber = prompt("Choose a playlist number: ")
const playlistIdPicked = playlistIds[Number(playlistNumber) - 1];
return await spotify.fetchPlaylistDetails(playlistIdPicked);
}

async function createPlaylist(playlistName, playlistDescription, isPublic) {
    // create playlist on spotify
    const playlistOnSpotify = await spotify.createPlaylist(playlistName, playlistDescription, isPublic);
    console.log(playlistOnSpotify);
    const playlistLink = playlistOnSpotify.external_urls.spotify;
    const playlistId = playlistOnSpotify.id
    console.log(`Playlist Link: ${playlistLink})`);
    console.log(`Playlist id: ${playlistOnSpotify}`);
    return[playlistLink, playlistId];

}

async function getPlaylistInfos(result) {
     //  get playlist name
     let playlistName = JSON.parse(result.content).playlistName;
     console.log(`Playlist Name: ${playlistName}`);
     
     // get playlist description
     let playlistDescription = JSON.parse(result.content).playlistDescription;
     console.log(`Playlist Description: ${playlistDescription}`);
     
     // get tracks
     let tracks = JSON.parse(result.content).tracks;

     return [playlistName, playlistDescription, tracks];
}

async function showPlaylist() {
    console.log("Loading playlist data...")
        const playlistSearch = await spotify.fetchPlaylistApi(0, 50);
        let myPlaylists = [];
        let myPlaylistsIds = [];
        for (let i = 0; i < playlistSearch.length; i++) {
            myPlaylists.push(playlistSearch[i].name);
            myPlaylistsIds.push(playlistSearch[i].id);
            
        }
        for (let i = 0; i < myPlaylists.length; i++) {
            console.log(`${i + 1} - ${myPlaylists[i]}`)
        }
        let input = parseInt(prompt("Select desired playlist: "));
        const playlistId = await spotify.fetchPlaylistDetails(myPlaylistsIds[input - 1]);
        console.log(`Playlist owner: ${playlistId.owner.display_name}`);
        console.log(`Playlist link: ${playlistId.external_urls.spotify}`);
        console.log(`Total tracks: ${playlistId.tracks.total}`);
        for (let i = 0; i < playlistId.tracks.items.length; i++) {
            let artists = "";
            for (let j = 0; j < playlistId.tracks.items[i].track.artists.length; j++) {
                artists += playlistId.tracks.items[i].track.artists[j].name + ", ";
            }

            console.log(`  Track name: ${playlistId.tracks.items[i].track.name} by: ${artists}`);
        }
}

await startLogin();
[".env", "auth.env"].forEach((path) => dotenv.config({path}));

const prompt = PromptSync();

// get arguments in `node index.js [command/flags]`
let args = process.argv.slice(2); // this removes `node` and the filename from arguments list

checkFlags(args);

let command = args[0];
let flags = args.slice(1);

const spotify = new Spotify(
    process.env.access_token,
    process.env.SPOTIFY_USERNAME
);

//processing inputed flags
let [playlist, genre, mood, duration, maxTracks, author, isPublic, description, query] = processFlags(flags);

switch (command) {
    // node index.js create --playlist <playlist name> -- description <playlist description>
    case "create":
        console.log("Creating playlist...");
        const response = await spotify.createPlaylist(playlist, description, true);
        if ("snapshot_id" in response) {
            console.log(`Playlist ${playlist} was generated succesfully at ${response.external_urls.spotify}`);
        }
        
        break;
    // node index.js track --query <query>
    case "track":
        console.log(`Adding song...`);
        const playlistPickedInfo = await pickPlaylist();
        await addTrackToPlaylist (query, playlistPickedInfo);
        break;
    // node index.js rtrack
    case "rtrack":
        console.log("Removing track...");
        const playlistToRemoveSongFrom = await pickPlaylist();
        removeTracksFromPlaylist(playlistToRemoveSongFrom);
        break;
    // node index.js magic --mood <mood> --maxtracks <maxtracks>
    case "magic":
        console.log("Generating request...");
        
        // create magic object -- responsible for the AI generation engine
        let magic = new Magic(playlist, genre, mood, duration, maxTracks, author);
        // generate playlist info 
        let result = "";
        console.log(`LLaMa is generating your playlist...`)
        while (true) {
            try{
                result = await magic.generate();            
                // parsing AI output
                console.log("Parsing playlist infos...")
                let [playlistName, playlistDescription, tracks] = await getPlaylistInfos(result);
                console.log(`Playlist parsed successfully! Name=${playlistName}, Playlist Description=${playlistDescription}, Number of Tracks=${tracks.length}`)

                // create playlist on spotify
                let [playlistLink, playlistId] = await createPlaylist(playlistName, playlistDescription, isPublic);
                let uris = [];
                // search tracks on spotify based on their names and artists
                for (let i = 0; i < tracks.length; i++) {
                    // using spotify API to search tracks with the title and artist of each track
                    console.log(`${tracks[i].trackArtist}: ${tracks[i].trackTitle}`);
                    const searchedTracks = await spotify.searchTracks(
                        `track:${tracks[i]["trackTitle"]} artist:${tracks[i]["trackArtist"]}`,
                        "track,artist"
                    );
                    // if tracks are found on spotify 
                    if(searchedTracks.items) {
                        // we get the first track on the list
                        if(searchedTracks.items[0]) {
                            console.log(`${tracks[i]["trackTitle"]}, ${tracks[i]["trackArtist"]}, ${searchedTracks.items[0].uri}`);
                            // store the track uri
                            uris.push(searchedTracks.items[0].uri); 
                        } else {
                            // we show the user the track generated by AI was not found on spotify
                            console.log(`${tracks[i]["trackTitle"]}, ${tracks[i]["trackArtist"]}, NOT FOUND`);
                        }
                    }
                }
                // add tracks to the playlist on spotify
                const res = await spotify.addTracks(playlistId, uris, 0);
                if ("snapshot_id" in res) {
                    console.log(`Playlist ${playlistName} was generated succesfully at ${playlistLink}`);
                }
                break;
            } catch (error) {
                console.log(`LLaMa failed to generate the playlist...\n${error.message}\n Trying to generate the playlist again`);
            }
        }
        break;
   
        console.log("Deleting playlist...");
        del();
        break;
    // node index.js show
    case "show":
        await showPlaylist();
        break;
    // node index.js help
    case "help":
        console.log("Help on its way...")
        help();
        break;
    default:
        console.log(`Error: unknown command \"${command}\" for \"spg\"`)
}
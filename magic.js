import ollama from 'ollama'

let dPrompt = `"""Generate a spotify playlist using the JSON format presented below. 
  The playlist should have 10 tracks of good vibes. Your response should only present 
  the JSON object.

  JSON Format:
  {
    "playlistName": "<name>",
    "playlistDescription": "<description>",
    "tracks": [{
      "trackTitle": "<track Title without authors>",
      "trackArtist": "<Track Artist>"
    }]
  }
  
  json"""`

  let mPrompt = `"""Generate a spotify playlist using the JSON format presented below. 
  The playlist should have MAXTRACKS tracks of MOOD music. Your response should only present 
  the JSON object.

  JSON Format:
  {
    "playlistName": "<name>",
    "playlistDescription": "<description>",
    "tracks": [{
      "trackTitle": "<track Title without authors>",
      "trackArtist": "<Track Artist>"
    }]
  }
  
  json"""`

  export class Magic {
    constructor(playlist, genre, mood, duration, maxTracks, author) {
      this.playlist = playlist;
      this.genre = genre;
      this.mood = mood;
      this.duration = duration;
      this.maxTracks = maxTracks;
      this.author = author;
    }
    getPrompt () {
      /* choose the right prompt according to the flags available
      if flags inputed are maxtracks and mood */
      if (this.mood && this.maxTracks) {
        // replace values in prompt with the flags respective values
         return mPrompt.replace("MOOD", this.mood).replace("MAXTRACKS", this.maxTracks)
      }
      // if no flags are inputed, then return the default prompt
      return dPrompt;
    }
    async generate() {
      // pick prompt
      let prompt = this.getPrompt() 
      // use lamma to generate the playlist infos
      const response = await ollama.chat({
        model: 'llama2',  
        messages: [{ role: 'user', content: prompt, format: "json"}]
      })
      return response.message;
    }
  
  }


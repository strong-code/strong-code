const axios = require('axios')
const http = require('http')
const vash = require('vash')
const fs = require('fs')

const USERNAME = process.env.LASTFM_USERNAME
const API_KEY = process.env.LASTFM_API_KEY
const API_URL = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json`

const nowPlaying = function() {
  return axios.get(API_URL)
    .then(res => {
      const lastPlayed = res.data.recenttracks.track[0]
      const info = {
        artist: lastPlayed.artist['#text'],
        album: lastPlayed.album['#text'],
        image: lastPlayed.image[2]['#text'], // this is "large" album art, can be 0-3
        name: lastPlayed.name,
        date: lastPlayed.date['#text']
      }
      return info
    })
    .catch(err => {
      console.log(err)
    })
}


const tpl = vash.compile(fs.readFileSync('templates/nowplaying.vash', 'utf8'))

//const server = http.createServer((req, res) => {
module.exports = async (req, res) => {
  nowPlaying().then(data => {
    res.send(tpl({
      image: data.image,
      name: data.name,
      artist: data.artist,
      album: data.album,
      date: data.date
    }))
  })
})

/*const port = process.env.PORT
server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})*/

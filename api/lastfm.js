const axios = require('axios')
const vash = require('vash')
const fs = require('fs')
const path = require('path')

const USERNAME = process.env.LASTFM_USERNAME
const API_KEY = process.env.LASTFM_API_KEY
const API_URL = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json`

const nowPlaying = function() {
  const info = {}
  return axios.get(API_URL)
    .then(res => {
      const lastPlayed = res.data.recenttracks.track[0]
      info.artist = lastPlayed.artist['#text'],
      info.album = lastPlayed.album['#text'],
      info.image = lastPlayed.image[2]['#text'], // this is "large" album art, can be 0-3
      info.name = lastPlayed.name,
      return info
    })
    .then(info => {
      return axios.get(info.image, {responseType: 'arraybuffer'})
    })
    .then(buff => {
      let b64 = Buffer.from(buff.data).toString('base64')
      info.image = b64
      return info
    })
    .catch(err => {
      console.log(err)
    })
}

const tpl = vash.compile(fs.readFileSync(path.join(__dirname, 'templates/nowplaying.vash'), 'utf8'))

module.exports = async (req, res) => {
  nowPlaying()
    .then(data => {
      res.setHeader('Content-Type', 'image/svg+xml')
      res.send(tpl({
        image: data.image,
        name: data.name,
        artist: data.artist,
        album: data.album,
        date: data.date
      }))
    })
}

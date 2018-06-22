const axios = require('axios')
const JSONStream = require('JSONStream')

let gameId = null

const instance = axios.create({
  baseURL: 'https://lichess.org/api/',
  headers: {'Authorization': `Bearer ${process.env.LICHESS_TOKEN}`}
})

function acceptChallenge (challengeId) {
  instance({
    method: 'post',
    url: `challenge/${challengeId}/accept`
  }).then((game) => {
    console.log(game)
  })
}

function respondToMove (gameState) {
  console.log(gameState)
}

function streamGame (gameId) {
  console.log(`STREAMING ${gameId}`)
  instance({
    method: 'get',
    url: `bot/game/stream/${gameId}`,
    resposneType: 'stream'
  }).then((response) => {
    response.data.pipe(JSONStream.parse()).on('data', respondToMove)
  })
}

function receiveEvent (inputJSON) {
  if (inputJSON.type === 'game') {
    streamGame(inputJSON.game.id)
  }

  if (inputJSON.type === 'challenge' && inputJSON.challenge.challenger.name === 'BannerBSchafer') {
    acceptChallenge(inputJSON.challenge.id)
  }
}

instance({
  method: 'get',
  url: 'stream/event',
  responseType: 'stream'
})
  .then(function (response) {
    response.data.pipe(JSONStream.parse()).on('data', receiveEvent)
  })
  .catch((err) => {
    console.log(err)
  })

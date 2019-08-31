var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');

const Forty = require('./app/forty');

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`Listening on port ${port}`));

app.use(bodyParser.json());
app.io = io;
app.forty = new Forty();

app.post('/api/create', (req, res) => {
  const game = app.forty.createGame();
  
  res.send({
    gameCode: `${game.code}`
  });
});

app.get('/api/checkname', (req, res) => {
  const { name } = req.query;
  if (name.length < 2 || name.length > 12) {
    res.send({ valid: false, message: 'Your name must be between 2 and 12 characters long' });
    return;
  }

  const { gameCode } = req.query;
  if (gameCode != undefined) {
    const game = app.forty.retrieveGame(gameCode);
    if (game.playerExists(name)) {
      res.send({ valid: false, message: 'This name has been taken' });
      return;
    }
    if (game.isFull()) {
      res.send({ valid: false, message: 'This game is full' });
      return;
    }
  }

  res.send({ valid: true });
});

app.get('/api/checkcode', (req, res) => {
  const { gameCode } = req.query;
  const game = app.forty.retrieveGame(gameCode);
  if (game != undefined) {
    res.send({ valid: true });
  } else {
    res.send({ valid: false, message: 'This game code is invalid' })
  }
})

app.io.of('/lobby').on('connect', function (socket) {
  var game;
  var name;

  socket.on('join', data => {
    name = data.name;
    game = app.forty.retrieveGame(data.gameCode);

    game.addPlayer(name, socket);
  });

  socket.on('disconnect', data => {
    game.removePlayer(name);
  });
});

app.io.of('/table').on('connect', function (socket) {
  var game;
  var name;

  socket.on('enter', data => {
    name = data.name;
    game = app.forty.retrieveGame(data.gameCode);
  });
});
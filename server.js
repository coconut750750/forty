const express = require('express');
const path = require('path');
var bodyParser = require('body-parser');

var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

const Forty = require('./app/forty');
const gameSocketio = require('./app/socketio');

const port = process.env.FORTY_PORT || process.env.PORT || 5000;
const dev = process.env.NODE_ENV === 'dev';

app.use(bodyParser.json());
app.io = io;
app.forty = new Forty(dev);

app.post('/api/create', (req, res) => {
  const game = app.forty.createGame(req.body);
  
  res.send({
    gameCode: `${game.code}`
  });
});

app.get('/dump', (req, res) => {
  console.log(app.forty);
  res.send();
});

app.get('/api/checkname', (req, res) => {
  const { name } = req.query;
  if (name.length < 1 || name.length > 16) {
    res.send({ valid: false, message: 'Your name must be between 1 and 16 characters long' });
    return;
  }

  const { gameCode } = req.query;
  if (gameCode != undefined) {
    const game = app.forty.retrieveGame(gameCode);
    if (game.playerExists(name) && !game.isActive(name)) {
      res.send({ valid: true });
      return;
    } else if (game.playerExists(name)) {
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
    res.send({ valid: false, message: 'This game code is invalid' });
  }
});

app.io.on('connect', function (socket) {
  var game;
  var name;
  var player;

  socket.on('join', data => {
    name = data.name;
    game = app.forty.retrieveGame(data.gameCode);

    if (game.playerExists(name)) {
      game.activatePlayer(name, socket);
    } else {
      game.addPlayer(name, socket);
    }

    if (game.started) {
      socket.emit('start', {});
    }
    player = game.getPlayer(name);

    gameSocketio(socket, game, name, player);
  });

  socket.on('exitGame', data => {
    if (player.isAdmin) {
      game.end();
    } else if (game.started) {
      game.deactivatePlayer(name);
    } else {
      game.removePlayer(name);
    }
  });

  socket.on('disconnect', data => {
    if (game !== undefined && game.playerExists(name)) {
      game.deactivatePlayer(name);
    }
  });
});

if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/build')));
    // Handle React routing, return all requests to React app
    app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

server.listen(port, () => console.log(`Listening on port ${port}`));

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');

const Forty = require('./app/forty');

const port = process.env.PORT || 5000;
const dev = process.env.NODE_ENV === 'dev';

server.listen(port, () => console.log(`Listening on port ${port}`));

app.use(bodyParser.json());
app.io = io;
app.forty = new Forty(dev);

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
})

app.io.on('connect', function (socket) {
  var game;
  var name;
  var player;

  socket.on('join', data => {
    name = data.name;
    game = app.forty.retrieveGame(data.gameCode);

    if (game.started) {
      game.activatePlayer(name, socket);
      socket.emit('start', {});
    } else {
      game.addPlayer(name, socket);
    }
    player = game.getPlayer(name);
  });

  socket.on('getPlayers', data => {
    socket.emit('players', game.getPlayerData());
  });

  socket.on('startGame', data => {
    if (game.isFull()) {
      game.start();
    } else {
      socket.emit('startFail', { message: 'Not enough players have joined the game' });
    }
  });

  socket.on('getPhase', data => {
    socket.emit('phase', { phase: game.phase });
  });

  socket.on('readyForAction', data => {
    if (name === game.getActionPlayerName()) {
      game.notifyActionPlayer();
    }
  });

  socket.on('permutePlayers', data => {
    game.permute();
  });

  socket.on('startRound', data => {
    game.startRound();
    game.notifyPlayerChange();
    game.startDeal();
  });

  socket.on('getHand', data => {
    player.sendHand();
  });

  socket.on('getLegalCards', data => {
    if (game.canSetTrumpSuit()) {
      player.sendCardsToReveal();
    } else if (game.phase === 'kitty' && name === game.getActionPlayerName()) {
      player.sendCardsForKitty();
    } else if (game.phase === 'tricks' && name === game.getActionPlayerName()) {
      player.sendCardsToPlay();
    }
  });

  socket.on('draw', data => {
    game.deal(name);
  });

  socket.on('setTrump', data => {
    const { suit } = data;
    game.setTrumpSuit(suit);
    game.trumpSetter = name;
    game.notifyTrumpSet();
  });

  socket.on('getTrump', data => {
    if (game.trumpCard !== undefined) {
      socket.emit('trump', { card: game.trumpCard.json(), name: game.trumpSetter });
    }
  });

  socket.on('setKitty', data => {
    game.setKitty(data.cards);
    game.startTrick();
  });

  socket.on('playCard', data => {
    game.playCard(data.card);
  });

  socket.on('getPlay', data => {
    socket.emit('play', { trick: game.trick.json() });
  });

  socket.on('disconnect', data => {
    if (game.started && !player.isAdmin) {
      game.deactivatePlayer(name);
    } else {
      game.removePlayer(name);
    }
  });
});

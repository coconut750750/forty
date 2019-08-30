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

app.io.of('/lobby').on('connect', function (socket) {
  var game;
  var name;

  socket.on('join', data => {
    name = data.name;
    const gameCode = data.gameCode;
    game = app.forty.retrieveGame(gameCode);

    game.addPlayer(name, socket);
    console.log(app.forty);
  });

  socket.on('disconnect', data => {
    game.removePlayer(name);
  });
});

app.io.of('/table').on('connect', function (socket) {
  // socket.emit('news', { hello: 'world' });
  // socket.on('asdf', function (data) {
  //   console.log(data);
  // });
});
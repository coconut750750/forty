var _ = require('lodash');
var Player = require('./player');

class Game {
  constructor(code, onEnd) {
    this.code = code;
    this.players = [];
    this.onEnd = onEnd;
  }

  addPlayer(playerName, socket) {
    this.players.push(new Player(playerName, socket, this.players.length == 0));
    this.notifyPlayerChange();
  }

  removePlayer(playerName) {
    var removedPlayer = _.remove(this.players, p => p.name == playerName);
    if (removedPlayer[0].isAdmin) {
      this.endGame();
    }
    this.notifyPlayerChange();
  }

  notifyPlayerChange() {
    this.players.forEach(player => {
      player.send('updateLobby', { players: this.players.map(p => p.name) });
    });
  }

  endGame() {
    this.players.forEach(player => {
      player.send('endGame', {});
    });
    this.onEnd();
  }
}

module.exports = Game;
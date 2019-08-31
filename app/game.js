var _ = require('lodash');
var Player = require('./player');

const MAX_PLAYERS = 4;

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

  playerExists(playerName) {
    return _.filter(this.players, p => p.name == playerName).length > 0;
  }

  getPlayer(playerName) {
    return _.filter(this.players, p => p.name == playerName)[0];
  }

  removePlayer(playerName) {
    var removedPlayer = _.remove(this.players, p => p.name == playerName);
    if (removedPlayer[0].isAdmin) {
      this.endGame();
    }
    this.notifyPlayerChange();
  }

  isFull() {
    return this.players.length >= MAX_PLAYERS;
  }

  notifyPlayerChange() {
    this.players.forEach(player => {
      player.send('updateLobby', { players: this.players.map(p => p.name) });
    });
  }

  endGame() {
    this.players.forEach(player => player.send('endGame', {}));
    this.onEnd();
  }
}

module.exports = Game;
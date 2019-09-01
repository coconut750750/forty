var _ = require('lodash');
var Player = require('./player');

const MAX_PLAYERS = 4;
const PHASES = ['teams'];

class Game {
  constructor(code, onEnd) {
    this.code = code;
    this.players = [];
    this.onEnd = onEnd;

    this.started = false;
    this.phase = undefined;
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

  activatePlayer(playerName) {
    this.getPlayer(playerName).active = true;
    this.notifyPlayerChange();
  }

  deactivatePlayer(playerName) {
    this.getPlayer(playerName).active = false;
    this.notifyPlayerChange();
  }

  isActive(playerName) {
    return this.getPlayer(playerName).active;
  }

  removePlayer(playerName) {
    var removedPlayer = _.remove(this.players, p => p.name == playerName);
    if (removedPlayer[0].isAdmin) {
      this.endGame();
    } else {
      this.notifyPlayerChange();
    }
  }

  isFull() {
    return this.players.length >= MAX_PLAYERS;
  }

  permute() {
    this.players = [this.players[0]] + this.players.slice(2, MAX_PLAYERS) + [this.players[1]];
    this.notifyPlayerChange();
  }

  notifyPlayerChange() {
    this.players.forEach(player => player.send('updatePlayers', this.getPlayerData()));
  }

  getPlayerData() {
    return { players: this.players.map(p => p.json()) };
  }

  start() {
    this.started = true;
    this.phase = PHASES[0];
    this.notifyGameStart();
  }

  notifyGameStart() {
    this.players.forEach(player => player.send('startGame', {}));
  }

  endGame() {
    this.players.forEach(player => player.send('endGame', {}));
    this.onEnd();
  }
}

module.exports = Game;
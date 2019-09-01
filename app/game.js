var _ = require('lodash');

var Player = require('./player');
var { newDeck, calibrate } = require('./deckutils');

const MAX_PLAYERS = 4;
const PHASES = ['teams', 'deal'];

class Game {
  constructor(code, onEnd) {
    this.code = code;
    this.players = [];
    this.onEnd = onEnd;

    this.started = false;
    this.phase = undefined;
    this.actionIndex = undefined;
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

  getPlayerData() {
    return { players: this.players.map(p => p.json()) };
  }

  start() {
    this.started = true;
    this.phase = PHASES[0];
    this.notifyGameStart();
  }

  permute() {
    this.players = [this.players[0], ...this.players.slice(2, MAX_PLAYERS), this.players[1]];
    this.notifyPlayerChange();
  }

  startRound() {
    this.deck = newDeck();
    this.trumpCard = undefined;
    this.dealsLeft = 48;
    this.phase = PHASES[1];
    this.notifyPhaseChange();
  }

  startDeal() {
    this.actionIndex = 0;
    this.notifyActionPlayer();
  }

  deal(name) {
    if (this.players[this.actionIndex].name === name && this.dealsLeft > 0) {
      this.players[this.actionIndex].addCard(this.deck.pop());
      this.players[this.actionIndex].sendHand();

      this.actionIndex = (this.actionIndex + 1) % MAX_PLAYERS;
      this.notifyActionPlayer();
      this.dealsLeft--;
    }
  }

  canSetTrumpCard() {
    return this.trumpCard === undefined;
  }

  setTrumpCard(trumpCard) {
    this.trumpCard = trumpCard;
    calibrate(this.deck, trumpCard);
    this.players.forEach(player => calibrate(player.hand, trumpCard));
  }

  notifyPlayerChange() {
    this.players.forEach(player => player.send('players', this.getPlayerData()));
  }

  notifyGameStart() {
    this.players.forEach(player => player.send('start', {}));
  }

  notifyPhaseChange() {
    this.players.forEach(player => player.send('phase', { phase: this.phase }));
  }

  notifyActionPlayer() {
    this.players[this.actionIndex].send('action', {});
  }

  endGame() {
    this.players.forEach(player => player.send('end', {}));
    this.onEnd();
  }
}

module.exports = Game;
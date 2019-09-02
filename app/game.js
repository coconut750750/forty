var _ = require('lodash');

var Player = require('./player');
var Card = require('./card');
var { newDeck, calibrate } = require('./deckutils');

const MAX_PLAYERS = 4;
const STARTING_LEVEL = 2;
const KITTY_CARDS = 6;
const PHASES = ['teams', 'deal'];

class Game {
  constructor(code, onEnd) {
    this.code = code;
    this.players = [];
    this.onEnd = onEnd;

    this.started = false;
  }

  addPlayer(playerName, socket) {
    this.players.push(new Player(
      playerName,
      socket,
      this.players.length == 0,
      () => this.getTrumpRank(),
      () => this.getTrumpSuit(),
    ));
    this.notifyPlayerChange();
  }

  playerExists(playerName) {
    return _.filter(this.players, p => p.name == playerName).length > 0;
  }

  getPlayer(playerName) {
    return _.filter(this.players, p => p.name == playerName)[0];
  }

  activatePlayer(playerName, socket) {
    this.getPlayer(playerName).active = true;
    this.getPlayer(playerName).socket = socket;
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
    this.teamLevels = [STARTING_LEVEL, STARTING_LEVEL];
    this.topTeam = undefined;
    this.notifyGameStart();
  }

  permute() {
    this.players = [this.players[0], ...this.players.slice(2, MAX_PLAYERS), this.players[1]];
    this.notifyPlayerChange();
  }

  startRound() {
    this.deck = newDeck();
    this.trumpSuit = undefined;
    this.level = this.topTeam === undefined ? STARTING_LEVEL : this.teamLevels[this.topTeam];
    this.dealsLeft = this.deck.length - KITTY_CARDS;
    this.phase = PHASES[1];
    this.notifyPhaseChange();
  }

  startDeal() {
    this.startIndex = this.startIndex || Math.floor(Math.random() * MAX_PLAYERS);
    this.actionIndex = this.startIndex;
    this.notifyActionPlayer();
  }

  deal(name) {
    if (this.players[this.actionIndex].name === name && this.dealsLeft > 0) {
      this.players[this.actionIndex].addCard(this.deck.pop());
      this.players[this.actionIndex].sendHand();
      this.dealsLeft--;

      if (this.dealsLeft > 0) {
        this.actionIndex = (this.actionIndex + 1) % MAX_PLAYERS;
        this.notifyActionPlayer();
      // } else {
      //   this.players[this.startIndex].addCards(this.deck);
      //   this.players[this.startIndex].sendHand();
      //   this.deck = [];
      }
    }
  }

  canSetTrumpSuit() {
    return this.trumpSuit === undefined;
  }

  setTrumpSuit(trumpSuit) {
    this.trumpSuit = trumpSuit;
    const trumpCard = new Card(this.level, this.trumpSuit);
    calibrate(this.deck, trumpCard);
    this.players.forEach(player => calibrate(player.hand, trumpCard));
    this.players.forEach(player => player.sortHand());
    this.players.forEach(player => player.sendHand());
  }

  getTrumpRank() {
    return this.level.toString();
  }

  getTrumpSuit() {
    return this.trumpSuit;
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
    if (this.actionIndex !== undefined) {
      this.players[this.actionIndex].send('action', {});
    }
  }

  endGame() {
    this.players.forEach(player => player.send('end', {}));
    this.onEnd();
  }
}

module.exports = Game;
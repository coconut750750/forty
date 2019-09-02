var _ = require('lodash');

var Player = require('./player');
var Card = require('./card');
var { newDeck, calibrate } = require('./deckutils');

const MAX_PLAYERS = 4;
const STARTING_LEVEL = 2;
const KITTY_CARDS = 6;
const PHASES = ['teams', 'deal', 'kitty', 'tricks'];

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
    this.trumpCard = undefined;
    this.trumpSetter = undefined;
    this.kitty = [];
    this.level = this.topTeam === undefined ? STARTING_LEVEL : this.teamLevels[this.topTeam];
    this.dealsLeft = this.deck.length - KITTY_CARDS;
    this.phase = PHASES[1];

    if (this.startIndex === undefined) {
      this.startIndex = Math.floor(Math.random() * MAX_PLAYERS);
    }
    this.actionIndex = this.startIndex;

    this.notifyPhaseChange();
  }

  getActionPlayerName() {
    if (this.actionIndex === undefined) {
      return undefined;
    }
    return this.players[this.actionIndex].name;
  }

  startDeal() {
    this.notifyActionPlayer();
  }

  deal(name) {
    if (this.players[this.actionIndex].name === name && this.dealsLeft > 0) {
      this.players[this.actionIndex].addCard(this.deck.pop());
      this.players[this.actionIndex].sendHand();
      this.dealsLeft--;

      if (this.dealsLeft === 0 && !this.canSetTrumpSuit()) {
        this.startKitty();
      } else {
        this.actionIndex = (this.actionIndex + 1) % MAX_PLAYERS;
        this.notifyActionPlayer();
      }
    }
  }

  canSetTrumpSuit() {
    return this.trumpCard === undefined;
  }

  setTrumpSuit(trumpSuit) {
    this.trumpCard = new Card(this.level, trumpSuit);
    calibrate(this.deck, this.trumpCard);
    this.players.forEach(player => calibrate(player.hand, this.trumpCard));
    this.players.forEach(player => player.sortHand());
    this.players.forEach(player => player.sendHand());
  }

  getTrumpRank() {
    return this.level.toString();
  }

  getTrumpSuit() {
    return this.trumpCard === undefined ? undefined : this.trumpCard.suit;
  }

  startKitty() {
    this.actionIndex = this.startIndex;
    this.phase = PHASES[2];
    this.notifyPhaseChange();

    this.players[this.actionIndex].addCards(this.deck);
    this.players[this.actionIndex].sendHand();
    this.deck = [];

    this.notifyActionPlayer();
  }

  setKitty(cards) {
    cards.map(c => new Card(c.rank, c.suit));
    this.kitty = cards;
    console.log(this.kitty);

    this.phase = PHASES[3];
    this.notifyPhaseChange();

    this.notifyActionPlayer();
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

  notifyTrumpSet() {
    this.players.forEach(player => player.send('trump', { card: this.trumpCard.json(), name: this.trumpSetter }));
  }

  endGame() {
    this.players.forEach(player => player.send('end', {}));
    this.onEnd();
  }
}

module.exports = Game;
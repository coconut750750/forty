var _ = require('lodash');

var Player = require('./player');
var Card = require('./card');
var Trick = require('./trick');
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
      () => this.getTrump(),
      () => this.getLead(),
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
    this.level = this.topTeam === undefined ? STARTING_LEVEL : this.teamLevels[this.topTeam];
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

  addTurn(start, inc) {
    return (start + inc) % MAX_PLAYERS;
  }

  nextActionPlayer() {
    this.actionIndex = this.addTurn(this.actionIndex, 1);
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
        this.nextActionPlayer();
        this.notifyActionPlayer();
      }
    }
  }

  canSetTrumpSuit() {
    return this.trumpCard === undefined;
  }

  setTrumpSuit(trumpSuit) {
    this.trumpCard = new Card(this.level.toString(), trumpSuit);
    this.trumpCard.calibrate(this.trumpCard);
    calibrate(this.deck, this.trumpCard);
    this.players.forEach(player => calibrate(player.hand, this.trumpCard));
    this.players.forEach(player => player.sortHand());
    this.players.forEach(player => player.sendHand());
  }

  getTrump() {
    const rank = this.level.toString();
    const suit = this.trumpCard === undefined ? undefined : this.trumpCard.suit;
    return { rank, suit };
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
    cards.forEach(c => this.players[this.actionIndex].popCard(c))
    this.players[this.actionIndex].sendHand();

    this.phase = PHASES[3];
    this.notifyPhaseChange();

    this.notifyActionPlayer();
  }

  startTrick() {
    if (this.winnerIndex === undefined) {
      this.actionIndex = this.startIndex;
      this.winnerIndex = this.startIndex;
    } else {
      this.actionIndex = this.winnerIndex;
    }

    this.trick = new Trick();

    this.notifyActionPlayer();
  }

  playCard(card) {
    card = this.players[this.actionIndex].popCard(card);
    console.log(this.players[this.actionIndex].hand);
    this.players[this.actionIndex].sendHand();
    this.trick.addCard(card);
    this.notifyCardPlayed(card);

    if (this.trick.cards.length === MAX_PLAYERS) {
      this.winnerIndex = this.addTurn(this.winnerIndex, this.trick.determineWinnerPosition(this.trumpCard));
      this.notifyTrickEnd(this.trick);
      this.startTrick();
    } else {
      this.nextActionPlayer();
      this.notifyActionPlayer();
    }
  }

  getLead() {
    if (this.trick !== undefined && this.trick.cards.length > 0) {
      return this.trick.cards[0];
    }
    return undefined;
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

  notifyTrickEnd(trick) {
    this.players.forEach(player => player.send('trick', { points: trick.calculatePoints() }));
  }

  notifyCardPlayed(card) {
    this.players.forEach(player => player.send('play', { name: this.players[this.actionIndex].name, card }))
  }

  endGame() {
    this.players.forEach(player => player.send('end', {}));
    this.onEnd();
  }
}

module.exports = Game;
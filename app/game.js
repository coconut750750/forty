var _ = require('lodash');

var Player = require('./player');
var Card = require('./card');
var Trick = require('./trick');
var { newDeck, calibrate } = require('./deckutils');
const { RANKS } = require('./const');

const MAX_PLAYERS = 4;
const STARTING_LEVEL = 2;
const KITTY_CARDS = 6;
const PHASES = ['teams', 'deal', 'kitty', 'tricks', 'endRound'];

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
      this.end();
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
    this.teamLevels = [0, 0];
    this.teamNextStarts = [-1, -1];

    this.startIndex = Math.floor(Math.random() * MAX_PLAYERS);
    this.defenseTeam = this.startIndex % 2;
    this.teamNextStarts[this.defenseTeam] = (this.startIndex + 2) % MAX_PLAYERS;
    this.teamNextStarts[1 - this.defenseTeam] = (this.startIndex + 1) % MAX_PLAYERS;

    this.notifyGameStart();
  }

  permute() {
    this.players = [this.players[0], ...this.players.slice(2, MAX_PLAYERS), this.players[1]];
    this.notifyPlayerChange();
  }

  startRound() {
    this.deck = newDeck();
    this.points = 0;
    this.level = this.teamLevels[this.defenseTeam];

    this.trumpCard = undefined;
    this.trumpSetter = undefined;
    this.phase = PHASES[1];

    this.players.forEach((player, index) => {
      player.team = index % 2 === this.defenseTeam;
    });

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
    this.kitty = [];
    this.dealsLeft = this.deck.length - KITTY_CARDS;
    this.notifyActionPlayer();
  }

  deal(name) {
    if (this.players[this.actionIndex].name === name && this.dealsLeft > 0) {
      this.players[this.actionIndex].addCard(this.deck.pop());
      this.players[this.actionIndex].sendHand();
      this.dealsLeft--;

      if (this.dealsLeft === 0) {
        if (this.trumpCard !== undefined) {
          this.startKitty();
        }
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
    this.trumpCard = new Card(RANKS.charAt(this.level), trumpSuit);
    this.trumpCard.calibrate(this.trumpCard);
    calibrate(this.deck, this.trumpCard);

    this.players.forEach(player => calibrate(player.hand, this.trumpCard));
    this.players.forEach(player => player.sortHand());
    this.players.forEach(player => player.sendHand());

    if (this.dealsLeft === 0) {
      this.startKitty();
    }
  }

  getTrump() {
    if (this.trumpCard !== undefined) {
      return this.trumpCard;
    }
    const rank = RANKS.charAt(this.level);
    return { rank };
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
    cards.forEach(c => this.players[this.actionIndex].popCard(c));
    this.players[this.actionIndex].sendHand();

    this.phase = PHASES[3];
    this.notifyPhaseChange();

    this.notifyActionPlayer();
  }

  startTrick() {
    if (this.players[0].hand.length === 0) {
      this.endRound();
    }

    // first trick of the round
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
    const actionPlayer = this.players[this.actionIndex];
    card = actionPlayer.popCard(card);
    actionPlayer.sendHand();
    this.trick.addCard(card, actionPlayer.name);
    this.notifyTrickUpdate();

    if (this.trick.cards.length === MAX_PLAYERS) {
      this.winnerIndex = this.addTurn(this.winnerIndex, this.trick.determineWinnerPosition(this.trumpCard));
      if (this.winnerIndex % 2 === this.defenseTeam) {
        this.points += this.trick.calculatePoints();
      }
      this.notifyTrickEnd();
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

  endRound() {
    if (this.winnerIndex % 2 !== this.defenseTeam) {
      var kittyTrick = new Trick();
      this.kitty.forEach(c => kittyTrick.addCard(c));
      this.points += 2 * kittyTrick.calculatePoints();

      this.notifyKittyReveal();
    }

    this.winnerIndex = undefined;
    this.updateLevels();
    this.updateStartIndex();

    this.phase = PHASES[4];
    this.notifyPhaseChange();
  }

  updateLevels() {
    if (this.points === 0) {
      this.teamLevels[this.defenseTeam] += 2;
    } else if (this.points <= 35) {
      this.teamLevels[this.defenseTeam] += 1;
    } else {
      this.defenseTeam = 1 - this.defenseTeam;
      if (this.points >= 100) {
        this.teamLevels[this.defenseTeam] += 2;
      } else if (this.points >= 80) {
        this.teamLevels[this.defenseTeam] += 1;
      }
    }
  }

  updateStartIndex() {
    const index = this.teamNextStarts[this.defenseTeam];
    this.startIndex = index;
    this.teamNextStarts[this.defenseTeam] = (index + 2) % MAX_PLAYERS;
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

  notifyTrickEnd() {
    this.players.forEach(player => player.send('trick', { points: this.points, winner: this.winnerIndex }));
  }

  notifyTrickUpdate() {
    this.players.forEach(player => player.send('play', { trick: this.trick.json() }));
  }

  notifyKittyReveal() {
    this.players.forEach(player => player.send('kitty', { cards: this.kitty }));
  }

  end() {
    this.players.forEach(player => player.send('end', {}));
    this.onEnd();
  }
}

module.exports = Game;
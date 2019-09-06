var _ = require('lodash');

var Player = require('./player');
var Card = require('./card');
var Trick = require('./trick');
var { newDeck, calibrate, getTrumpFromKitty } = require('./deckutils');
const { RANKS } = require('./const');

const MAX_PLAYERS = 4;
const KITTY_CARDS = 6;
const PHASES = ['teams', 'deal', 'kitty', 'tricks', 'roundEnd'];

const STARTING_LEVEL = 0;
const LAST_LEVELS = RANKS.length - 1;

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
    this.getPlayer(playerName).socket = undefined;
    if (this.allDeactivated()) {
      this.end();
    } else {
      this.notifyPlayerChange();
    }
  }

  allDeactivated() {
    for (var p of this.players) {
      if (p.active) {
        return false;
      }
    }
    return true;
  }

  isActive(playerName) {
    return this.getPlayer(playerName).active;
  }

  removePlayer(playerName) {
    var removedPlayer = _.remove(this.players, p => p.name == playerName);
    if (this.players.length === 0) {
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
    this.teamLevels = [STARTING_LEVEL, STARTING_LEVEL];
    this.teamNextStarts = [-1, -1];

    this.startIndex = Math.floor(Math.random() * MAX_PLAYERS);
    this.defenseTeam = this.startIndex % 2;
    this.teamNextStarts[this.defenseTeam] = (this.startIndex + 2) % MAX_PLAYERS;
    this.teamNextStarts[1 - this.defenseTeam] = (this.startIndex + 1) % MAX_PLAYERS;

    this.notifyGameStart();
    this.notifyPhaseChange();
  }

  permute() {
    this.players = [this.players[0], ...this.players.slice(2, MAX_PLAYERS), this.players[1]];
    this.notifyPlayerChange();
  }

  onDefense(index) {
    return index % 2 === this.defenseTeam;
  }

  getDefenseTeam() {
    return this.players.filter((_, index) => this.onDefense(index));
  }

  getOffenseTeam() {
    return this.players.filter((_, index) => !this.onDefense(index));
  }

  startRound() {
    this.deck = newDeck();
    this.points = 0;
    this.level = this.teamLevels[this.defenseTeam];

    this.trumpCard = undefined;
    this.trumpSetter = undefined;
    this.trumpRevealed = undefined;

    this.players.forEach((player, index) => {
      player.team = index % 2 === this.defenseTeam;
    });

    this.actionIndex = this.startIndex;

    this.phase = PHASES[1];
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
        } else {
          this.notifyNeedTrump();
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

  setTrumpSuit(trumpSuit, name) {
    this.trumpCard = new Card(RANKS.charAt(this.level), trumpSuit);
    this.trumpCard.calibrate(this.trumpCard);
    calibrate(this.deck, this.trumpCard);

    this.players.forEach(player => calibrate(player.hand, this.trumpCard));
    this.players.forEach(player => player.sortHand());
    this.players.forEach(player => player.sendHand());

    this.trumpSetter = name;
    this.notifyTrumpSet();

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

  forceSetTrump() {
    const { suit, revealed } = getTrumpFromKitty(this.deck, RANKS.charAt(this.level));
    this.trumpRevealed = revealed;
    this.setTrumpSuit(suit, "");
    this.notifyRevealed(revealed);
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
      return;
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
      if (!this.onDefense(this.winnerIndex)) {
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
    this.phase = PHASES[4];
    this.notifyPhaseChange();

    if (this.winnerIndex % 2 !== this.defenseTeam) {
      var kittyTrick = new Trick();
      this.kitty.forEach(c => kittyTrick.addCard(c));
      this.points += 2 * kittyTrick.calculatePoints();

    }

    this.winnerIndex = undefined;
    this.updateWithResults();
    this.updateStartIndex();

    this.notifyKittyReveal();
    this.notifyResults();
  }

  updateWithResults() {
    if (this.points >= 40) {
      this.defenseTeam = 1 - this.defenseTeam;
    }
    var defenseLevel = this.teamLevels[this.defenseTeam];
    if (defenseLevel === RANKS.length - 1) {
      this.endGame();
    }

    if (this.points === 0 || this.points >= 100) {
      this.teamLevels[this.defenseTeam] = Math.min(defenseLevel + 2, RANKS.length - 1);
    } else if (this.points <= 35 || this.points >= 80) {
      this.teamLevels[this.defenseTeam] = Math.min(defenseLevel + 1, RANKS.length - 1);
    }
  }

  updateStartIndex() {
    const index = this.teamNextStarts[this.defenseTeam];
    this.startIndex = index;
    this.teamNextStarts[this.defenseTeam] = (index + 2) % MAX_PLAYERS;
  }

  endGame() {
    this.started = false;
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

  notifyNeedTrump() {
    this.players.forEach(player => player.send('trump', {}));
  }

  notifyTrumpSet() {
    this.players.forEach(player => player.send('trump', { card: this.trumpCard.json(), name: this.trumpSetter }));
  }

  notifyRevealed(revealed) {
    this.players.forEach(player => player.send('reveal', { revealed }));
  }

  notifyTrickEnd() {
    this.players.forEach(player => player.send('trick', {
      points: this.points,
      cards: !this.onDefense(this.winnerIndex) ? this.trick.getPointCards() : [],
      winner: this.winnerIndex,
    }));
  }

  notifyTrickUpdate() {
    this.players.forEach(player => player.send('play', { trick: this.trick.json() }));
  }

  notifyKittyReveal() {
    this.players.forEach(player => player.send('kitty', { cards: this.kitty }));
  }

  notifyResults() {
    this.players.forEach(player => player.send('results', this.getResults()));
  }

  notifyGameEnd() {

  }

  getResults() {
    const defenders = this.getDefenseTeam();
    const attackers = this.getOffenseTeam();

    return {
      points: this.points,
      defenders: defenders.map(p => p.json()),
      defenseLevel: RANKS.charAt(this.teamLevels[this.defenseTeam]),
      attackers: attackers.map(p => p.json()),
      attackLevel: RANKS.charAt(this.teamLevels[1 - this.defenseTeam]),
      gameOver: !this.started,
    };
  }

  end() {
    this.players.forEach(player => player.send('end', {}));
    this.onEnd();
  }
}

module.exports = Game;
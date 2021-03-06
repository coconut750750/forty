var _ = require('lodash');

var Player = require('./player');
var Card = require('./card');
var Trick = require('./trick');
var { newDeck, calibrate, getTrumpFromKitty } = require('./deckutils');
const { RANKS, LEVELS } = require('./const');

const MAX_PLAYERS = 4;
const KITTY_CARDS = 6;
const PHASES = ['teams', 'deal', 'kitty', 'tricks', 'roundEnd'];

const STARTING_LEVEL = 0;
const LAST_LEVEL = RANKS.length - 1;

class Game {
  constructor(code, onEnd, options) {
    this.code = code;
    this.players = [];
    this.onEnd = onEnd;

    this.started = false;

    // options
    const { starting_level } = options;
    this.starting_level = starting_level == undefined ? STARTING_LEVEL : starting_level;
  }

  addPlayer(playerName, socket) {
    this.players.push(new Player(
      playerName,
      socket,
      this.players.length == 0,
      () => this.getTrump(),
      () => this.getLead(),
    ));
    this.notifyPlayerUpdate();
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
    this.notifyPlayerUpdate();
  }

  deactivatePlayer(playerName) {
    this.getPlayer(playerName).active = false;
    this.getPlayer(playerName).socket = undefined;
    if (this.allDeactivated()) {
      this.end();
    } else {
      this.notifyPlayerUpdate();
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
    if (this.allDeactivated()) {
      this.end();
    } else {
      this.notifyPlayerUpdate();
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
    this.teamLevels = [this.starting_level, this.starting_level];
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
    this.notifyPlayerUpdate();
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
    this.notifyLevelChange();

    this.trumpCard = undefined;
    this.trumpSetter = undefined;
    this.trumpRevealed = undefined;

    this.pointCards = [];

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
    if (this.players[this.actionIndex].name !== name) {
      throw new Error("It's not your turn to draw");
    }
    if (this.dealsLeft <= 0) {
      throw new Error("No more cards to draw")
    }
    
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

  canSetTrumpSuit() {
    return this.trumpCard === undefined;
  }

  getTrumpRank() {
    return RANKS.charAt(this.level);
  }

  setTrumpSuit(trumpSuit, name) {
    this.trumpCard = new Card(this.getTrumpRank(), trumpSuit);
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
    const rank = this.getTrumpRank();
    return { rank };
  }

  forceSetTrump() {
    const { suit, revealed } = getTrumpFromKitty(this.deck, this.getTrumpRank());
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

  playCard(player, card) {
    const actionPlayer = this.players[this.actionIndex];
    if (player.name !== actionPlayer.name) {
      throw new Error("You cannot play cards right now");
    }
    const cards = actionPlayer.popCard(card);
    if (cards.length !== 1) {
      throw new Error("The card you played was not in your hand");
    }

    card = cards[0];
    actionPlayer.sendHand();
    this.trick.addCard(card, actionPlayer.name);
    this.notifyTrickUpdate();

    if (this.trick.cards.length === MAX_PLAYERS) {
      this.winnerIndex = this.addTurn(this.winnerIndex, this.trick.determineWinnerPosition(this.trumpCard));
      if (!this.onDefense(this.winnerIndex)) {
        this.points += this.trick.calculatePoints();
        this.pointCards = this.pointCards.concat(this.trick.getPointCards());
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
    } else if (this.teamLevels[this.defenseTeam] === LAST_LEVEL) {
      // defense team beat the last level
      this.endGame();
    }
    var defenseLevel = this.teamLevels[this.defenseTeam];

    if (this.points === 0 || this.points >= 100) {
      this.teamLevels[this.defenseTeam] = Math.min(defenseLevel + 2, LAST_LEVEL);
    } else if (this.points <= 35 || this.points >= 80) {
      this.teamLevels[this.defenseTeam] = Math.min(defenseLevel + 1, LAST_LEVEL);
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

  notifyPlayerUpdate() {
    this.players.forEach(player => player.send('players', this.getPlayerData()));
  }

  notifyGameStart() {
    this.players.forEach(player => player.send('start', {}));
  }

  notifyPhaseChange() {
    this.players.forEach(player => player.send('phase', { phase: this.phase }));
  }

  notifyLevelChange() {
    this.players.forEach(player => player.send('level', { level: LEVELS[this.level] }));
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
      cards: this.pointCards,
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
    const results = this.getResults();
    this.players.forEach(player => player.send('results', results));
  }

  getResults() {
    const defenders = this.getDefenseTeam();
    const challengers = this.getOffenseTeam();

    return {
      points: this.points,
      defenders: defenders.map(p => p.json()),
      defenseLevel: LEVELS[this.teamLevels[this.defenseTeam]],
      challengers: challengers.map(p => p.json()),
      challengeLevel: LEVELS[this.teamLevels[1 - this.defenseTeam]],
      gameOver: !this.started,
    };
  }

  end() {
    this.players.forEach(player => player.send('end', {}));
    this.onEnd();
  }
}

module.exports = Game;
var Card = require('./card');
var _ = require('lodash');

class Player {
  constructor(name, socket, isAdmin, getTrump, getLead) {
    this.name = name;
    this.socket = socket;
    this.isAdmin = isAdmin;
    this.hand = [];

    this.getTrump = getTrump;
    this.getLead = getLead;

    this.active = true;
  }

  addCards(cards) {
    this.hand = this.hand.concat(cards);
    this.sortHand();
  }

  addCard(card) {
    this.hand.push(card);
    this.sortHand();
  }

  popCard(card) {
    const index = _.findIndex(this.hand, c => c.rank == card.rank && c.suit === card.suit);
    card = this.hand[index];
    this.hand.splice(index, 1);
    return card;
  }

  legalAllCards() {
    return _.range(this.hand.length);
  }

  legalPlayCards() {
    const leadCard = this.getLead();
    if (leadCard === undefined) {
      return this.legalAllCards();
    }

    var cardsInFamily = _.map(_.keys(_.pickBy(this.hand, c => c.family === leadCard.family)), Number);
    if (cardsInFamily.length === 0) {
      return this.legalAllCards();
    }
    return cardsInFamily;
  }

  legalRevealCards() {
    const { rank } = this.getTrump();
    return _.map(_.keys(_.pickBy(this.hand, c => c.rank === rank)), Number);
  }

  json() {
    return {
      name: this.name,
      isAdmin: this.isAdmin,
      active: this.active,
      team: this.team,
    };
  }

  send(event, data) {
    if (this.socket != undefined) {
      this.socket.emit(event, data);
    }
  }

  sortHand() {
    const { rank, suit } = this.getTrump();
    this.hand = _.reverse(_.sortBy(this.hand, c => c.getSortOrder(rank, suit)));
  }

  getHandData() {
    return this.hand.map(card => card.json());
  }

  sendHand() {
    this.send('hand', { hand: this.getHandData() });
  }

  sendCardsToReveal() {
    this.send('legal', { cards: this.legalRevealCards()});
  }

  sendCardsForKitty() {
    this.send('legal', { cards: this.legalAllCards()});
  }

  sendCardsToPlay() {
    this.send('legal', { cards: this.legalPlayCards()});
  }
}

module.exports = Player;

var Card = require('./card');
var _ = require('lodash');

class Player {
  constructor(name, socket, isAdmin, getTrumpRank, getTrumpSuit) {
    this.name = name;
    this.socket = socket;
    this.isAdmin = isAdmin;
    this.hand = [];

    this.getTrumpRank = getTrumpRank;
    this.getTrumpSuit = getTrumpSuit;

    this.active = true;
  }

  addCards(cards) {
    this.hand = this.hand + cards;
    this.sortHand();
  }

  addCard(card) {
    this.hand.push(card);
    this.sortHand();
  }

  // playCard(index, trick) {
  //   trick.addCard(this.hand.splice(index, 1)[0]);
  // }

  legalPlayCards(leadCard) {
    if (leadCard === undefined) {
      return _.range(this.hand.length);
    }

    var cardsInFamily = _.map(_.keys(_.pickBy(this.hand, c => c.family === leadCard.family)), Number);
    if (cardsInFamily.length === 0) {
      return _.range(this.hand.length);
    }
    return cardsInFamily;
  }

  legalRevealCards() {
    return _.map(_.keys(_.pickBy(this.hand, c => c.rank === this.getTrumpRank())), Number);
  }

  json() {
    return {
      name: this.name,
      isAdmin: this.isAdmin,
      active: this.active,
    };
  }

  send(event, data) {
    if (this.socket != undefined) {
      this.socket.emit(event, data);
    }
  }

  sortHand() {
    this.hand = _.reverse(_.sortBy(this.hand, c => c.getSortOrder(this.getTrumpRank(), this.getTrumpSuit())));
  }

  sendHand() {
    this.send('hand', { hand: this.hand.map(card => card.json()) });
  }

  sendCardsToReveal() {
    this.send('legal', { cards: this.legalRevealCards()});
  }

  sendCardsToPlay() {
    this.send('legal', { cards: this.legalPlayCards()});
  }
}

module.exports = Player;

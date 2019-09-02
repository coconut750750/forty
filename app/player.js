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

  addCard(card) {
    this.hand.push(card);
    this.sortHand();
  }

  // playCard(index, trick) {
  //   trick.addCard(this.hand.splice(index, 1)[0]);
  // }

  legalCards(leadCard) {
    var cardsInFamily = [];
    for (var card of this.hand) {
      if (card.family === leadCard.family) {
        cardsInFamily.push(card);
      }
    }
    if (cardsInFamily.length === 0) {
      return this.hand
    }
    return cardsInFamily;
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
}

module.exports = Player;

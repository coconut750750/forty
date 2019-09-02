var Card = require('./card');
var _ = require('lodash');

class Trick {
  constructor() {
    this.cards = [];
    this.names = [];
  }

  addCard(name, card) {
    this.names.push(name);
    this.cards.push(card);
  }

  determineWinnerPosition(trumpCard) {
    const leadCard = this.cards[0];
    var leadValue = leadCard.calculateRelativeRank(leadCard, trumpCard);
    var position = 0;

    for (var i = 1; i < this.cards.length; i++ ){
      const card = this.cards[i];
      const value = card.calculateRelativeRank(leadCard, trumpCard);
      if (value > leadValue) {
        leadValue = value;
        position = i;
      }
    }

    return position;
  }

  calculatePoints() {
    var points = 0;
    for (var card of this.cards) {
      if (card.rank == '5') {
        points += 5;
      } else if (card.rank == '0' || card.rank == 'k') {
        points += 10;
      }
    }
    return points;
  }

  json() {
    const cardJson = this.cards.map(c => c.json());
    return _.zipObject(this.names, cardJson)
  }
}

module.exports = Trick;
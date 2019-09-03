var Card = require('./card');
var _ = require('lodash');

class Trick {
  constructor() {
    this.cards = [];
    this.names = [];
  }

  addCard(card, name) {
    this.cards.push(card);
    this.names.push(name);
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
    const pointCards = this.getPointCards();
    pointCards.forEach(card => {
      points += card.rank == '5' ? 5 : 10;
    });
    return points;
  }

  getPointCards() {
    return this.cards.filter(card => card.rank == '5' || card.rank == '0' || card.rank == 'k');
  }

  json() {
    const cardJson = this.cards.map(c => c.json());
    return _.zipObject(this.names, cardJson)
  }
}

module.exports = Trick;
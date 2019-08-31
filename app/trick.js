var Card = require('./card');

class Trick {
  constructor() {
    this.cards = [];
  }

  addCard(card) {
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
}

module.exports = Trick;
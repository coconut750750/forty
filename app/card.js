const RANKS = '234567890jqkayz';
const SUITS = 'hcds';

class Card {
  constructor(rank, suit) {
    this.rank = rank;
    this.suit = suit;
    this.family = undefined;
  }

  calibrate(trumpCard) {
    if (this.rank === 'y' || this.rank === 'z' || this.rank === trumpCard.rank) {
        this.family = trumpCard.suit;
    } else {
        this.family = this.suit;
    }
  }

  calculateRelativeRank(leadCard, trumpCard) {
    if (this.rank === 'z') {
        return 100;
    } else if (this.rank === 'y') {
        return 99;
    } else if (this.rank === trumpCard.rank) {
        if (this.suit === trumpCard.suit) {
            return 98;
        } else {
            return 97;
        }
    } else if (this.family === trumpCard.family) {
        return 50 + RANKS.indexOf(this.rank);
    } else if (this.family === leadCard.family) {
        return RANKS.indexOf(this.rank); // 0 - 12
    } else {
        return -1; // -1
    }
  }
}

module.exports = Card;

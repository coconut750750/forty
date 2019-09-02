const { RANKS, SUITS, SJOKER, FJOKER } = require('./const');

class Card {
  constructor(rank, suit) {
    this.rank = rank;
    this.suit = suit;
    this.family = undefined;
  }

  calibrate(trumpCard) {
    if (this.rank === SJOKER || this.rank === FJOKER || this.rank === trumpCard.rank) {
        this.family = trumpCard.suit;
    } else {
        this.family = this.suit;
    }
  }

  calculateRelativeRank(leadCard, trumpCard) {
    if (this.rank === FJOKER) {
        return 100;
    } else if (this.rank === SJOKER) {
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

  getSortOrder(trumpRank, trumpSuit) {
    if (this.rank === FJOKER) {
      return 100;
    } else if (this.rank === SJOKER) {
      return 99;
    } else if (this.rank === trumpRank) {
      return 98;
    } else if (this.suit === trumpSuit) {
      return 80 + RANKS.indexOf(this.rank);
    } else {
      return SUITS.indexOf(this.suit) * 20 + RANKS.indexOf(this.rank);
    }
  }

  json() {
    return {rank: this.rank, suit: this.suit};
  }
}

module.exports = Card;

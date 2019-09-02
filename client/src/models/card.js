export default class Card {
  constructor(rank, suit, highlight) {
    this.rank = rank;
    this.suit = suit;
    this.highlight = highlight;
  }

  equals(o) {
    return this.rank === o.rank && this.suit === o.suit;
  }

  json() {
    return { rank: this.rank, suit: this.suit };
  }
}
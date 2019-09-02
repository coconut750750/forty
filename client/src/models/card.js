export default class Card {
  constructor(rank, suit, highlight) {
    this.rank = rank;
    this.suit = suit;
    this.highlight = highlight;
  }

  json() {
    return { rank: this.rank, suit: this.suit };
  }
}
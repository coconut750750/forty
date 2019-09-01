export default class Card {
  constructor(rank, suit) {
    this.rank = rank;
    this.suit = suit;
  }

  json() {
    return { rank: this.rank, suit: this.suit };
  }
}
export default class Card {
  constructor(rank, suit, revealable) {
    this.rank = rank;
    this.suit = suit;
    this.revealable = revealable;
  }

  json() {
    return { rank: this.rank, suit: this.suit };
  }
}
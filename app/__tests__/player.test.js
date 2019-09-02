var Player = require('../player');
var Card = require('../card');

function getNumLegalCards(cards, trumpCard, leadCard) {
  var player = new Player('test', undefined, false);
  trumpCard.calibrate(trumpCard);
  leadCard.calibrate(leadCard);

  for (var card of cards) {
    card.calibrate(trumpCard);
    player.addCard(card);
  }
  return player.legalCards(leadCard).length;
}

function getSortedCards(cards, trumpRank, trumpSuit) {
  var player = new Player('test', undefined, false);

  for (var card of cards) {
    player.addCard(card);
  }
  player.sortHand(trumpRank, trumpSuit);
  return player.hand;
}

describe('list legal cards to play', () => {
  it('non trump suit lead and player follow suit', () => {
    expect(getNumLegalCards([
      new Card('4', 's'),
      new Card('5', 'h'),
      new Card('9', 'd'),
      new Card('k', 'h'),
      new Card('z', 'z'),
      new Card('q', 'h'),
      ], new Card('2', 's'), new Card('a', 'h'))).toBe(3);
  });

  it('non trump suit lead and player cannot follow suit', () => {
    expect(getNumLegalCards([
      new Card('4', 's'),
      new Card('5', 'h'),
      new Card('9', 'd'),
      new Card('k', 'h'),
      new Card('z', 'z'),
      new Card('q', 'h'),
      ], new Card('2', 's'), new Card('a', 'c'))).toBe(6);
  });

  it('trump suit lead and player has trump cards', () => {
    expect(getNumLegalCards([
      new Card('4', 's'),
      new Card('5', 'h'),
      new Card('9', 'd'),
      new Card('k', 'h'),
      new Card('z', 'z'),
      new Card('q', 'h'),
      ], new Card('2', 's'), new Card('a', 's'))).toBe(2);
  });

  it('trump suit lead and player forced to play joker', () => {
    expect(getNumLegalCards([
      new Card('4', 's'),
      new Card('5', 'h'),
      new Card('9', 'd'),
      new Card('k', 'h'),
      new Card('z', 'z'),
      new Card('q', 'h'),
      ], new Card('2', 'c'), new Card('a', 'c'))).toBe(1);
  });
});

describe('sorting cards', () => {
  it('no trump suit', () => {
    const cards = [
      new Card('3', 'h'),
      new Card('5', 'c'),
      new Card('8', 's'),
      new Card('j', 's'),
      new Card('4', 'h'),
      new Card('6', 'd'),
      new Card('a', 'c'),
      new Card('z', ''),
      new Card('k', 'd'),
    ];

    const sortedIndicies = [7, 0, 3, 2, 8, 5, 6, 1, 4]
    const sorted = sortedIndicies.map(i => cards[i]);
    expect(getSortedCards(cards, '3')).toEqual(sorted);
  });

  it('with trump suit', () => {
    const cards = [
      new Card('3', 'h'),
      new Card('5', 'c'),
      new Card('8', 's'),
      new Card('j', 's'),
      new Card('4', 'h'),
      new Card('6', 'd'),
      new Card('a', 'c'),
      new Card('z', ''),
      new Card('k', 'd'),
    ];

    const sortedIndicies = [7, 0, 6, 1, 3, 2, 8, 5, 4]
    const sorted = sortedIndicies.map(i => cards[i]);
    expect(getSortedCards(cards, '3', 'c')).toEqual(sorted);
  });
});
var deckutils = require('../deckutils');
var Card = require('../card');

describe('getting trump card from 6 card kitty', () => {
  it('kitty contains trump', () => {
    const kitty = [
      new Card('k', 'c'),
      new Card('0', 'd'),
      new Card('5', 's'),
      new Card('2', 's'),
      new Card('3', 'h'),
      new Card('8', 'd'),
    ];

    const { card, revealed } = deckutils.getTrumpFromKitty(kitty, '2');

    expect(card.rank).toBe('2');
    expect(card.suit).toBe('s');
    expect(revealed).toEqual(kitty.slice(0, 4));
  });

  it('kitty does not contain trump', () => {
    const kitty = [
      new Card('k', 'c'),
      new Card('0', 'd'),
      new Card('5', 's'),
      new Card('8', 's'),
      new Card('3', 'h'),
      new Card('8', 'd'),
    ];

    const { card, revealed } = deckutils.getTrumpFromKitty(kitty, '2');

    expect(card.rank).toBe('2');
    expect(card.suit).toBe('c');
    expect(revealed).toEqual(kitty);
  });
});
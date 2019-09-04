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

    const { suit, revealed } = deckutils.getTrumpFromKitty(kitty, '2');

    expect(suit).toBe('s');
    expect(revealed).toEqual(kitty.slice(0, 4));
  });
});
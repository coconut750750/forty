var Game = require('../game');
var Card = require('../card');

test('generate deck', () => {
  var game = new Game('code', undefined);

  game.startRound();
  expect(game.deck.length).toBe(54);
});

test('calibrate deck', () => {
  var game = new Game('code', undefined);

  game.startRound();
  expect(game.deck[0].family).toBe(undefined);
  game.setTrumpCard(new Card('2', 's'));
  expect(game.deck[0].family).not.toBe(undefined);
})
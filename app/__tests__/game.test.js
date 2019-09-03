var Game = require('../game');
var Card = require('../card');

test('generate deck', () => {
  var game = new Game('code', undefined);

  game.start();
  game.startRound();
  expect(game.deck.length).toBe(54);
});

test('calibrate deck', () => {
  var game = new Game('code', undefined);

  game.start();
  game.startRound();
  expect(game.deck[0].family).toBe(undefined);
  game.setTrumpSuit('s');
  expect(game.deck[0].family).not.toBe(undefined);
})
const Game = require("../game");
const c = require("../const");
const errors = require("../errors");

const order = ['p1', 'p2', 'p3', 'p4'];
const unstartedGame = (players, onEnd, options) => {
  const g = new Game('code', onEnd, options);
  for (let p of players) {
    g.addPlayer(p.name, p.socket);
  }
  return g;
};
const startedGame = (players, onEnd, options) => {
  const g = unstartedGame(players, onEnd, options);
  g.start();
  return g;
};

describe('game deal test', () => {
  test('correctly show players legal cards to reveal', () => {
    let hands = {p1: undefined, p2: undefined, p3: undefined, p4: undefined};
    let legal = {p1: undefined, p2: undefined, p3: undefined, p4: undefined};

    const players = order.map(name => ({name, socket: {emit: (event, data) => {
        if (event === 'hand') {
          hands[name] = data['hand'];
        }
        if (event === 'legal') {
          legal[name] = data['cards'];
        }
      }}})
    );

    const g = startedGame(players, () => {}, { starting_level: 0 });
    g.startRound();
    g.dealDelay = 0;
    g.deal();

    g.pm.doAll(player => player.sendCardsToReveal());

    for (let p of order) {
      expect(hands[p].length).toBe(12);

      const indexes = legal[p];
      const cards = indexes.map(i => hands[p][i]);
      for (let c of cards) {
        expect(c.rank).toBe("2");
      }
    }
  });

  test('successully allow players to reveal trump card', () => {
    let hands = {p1: undefined, p2: undefined, p3: undefined, p4: undefined};
    let legal = {p1: [], p2: [], p3: [], p4: []};
    let trumpBroadcast = undefined;

    const players = order.map(name => ({name, socket: {emit: (event, data) => {
        if (event === 'hand') {
          hands[name] = data['hand'];
        }
        if (event === 'legal') {
          legal[name] = data['cards'];
        }
        if (event === 'trump') {
          trumpBroadcast = data;
        }
      }}})
    );

    const g = startedGame(players, () => {}, { starting_level: 0 });
    g.startRound();
    g.dealDelay = 0;
    g.deal();

    g.pm.doAll(player => player.sendCardsToReveal());

    // p1 attempt to set trump suit with an invalid card
    let nonTrumpIndex = hands.p1.length - 1;
    while (legal.p1.includes(nonTrumpIndex)) {
      nonTrumpIndex--;
    }
    expect(() => g.playerSetTrumpSuit(g.getPlayer('p1'), [nonTrumpIndex])).toThrow(errors.ErrorInvalidTrumpReveal);

    for (let p of order) {
      if (legal[p].length > 0) {
        let trumpIndex = legal[p][0];
        let card = hands[p][trumpIndex];

        const player = g.getPlayer(p);

        // successfully set trump suit
        if (trumpBroadcast.card == undefined) {
          g.playerSetTrumpSuit(player, [trumpIndex]);
          expect(g.trumpCard.rank).toBe('2');
          expect(g.trumpCard.suit).toBe(card.suit);

          expect(trumpBroadcast.name).toBe(p);
          expect(trumpBroadcast.card.rank).toBe('2');
          expect(trumpBroadcast.card.suit).toBe(card.suit);
        } else { // fail to set trump suit again
          expect(() => g.playerSetTrumpSuit(player, [trumpIndex])).toThrow(errors.ErrorInvalidTrumpReveal);
        }
      }
    }

    // no need to force set trump
    expect(() => g.forceSetTrumpSuit()).toThrow(errors.ErrorCannotForceSetTrumpSuit);
  });

  test('force reveal trump from kitty', () => {
    let reveal = undefined;
    let trumpBroadcast = undefined;

    const players = order.map(name => ({name, socket: {emit: (event, data) => {
        if (event === 'kittyReveal') {
          reveal = data;
        }
        if (event === 'trump') {
          trumpBroadcast = data;
        }
      }}})
    );

    const g = startedGame(players, () => {}, { starting_level: 0 });
    g.startRound();
    g.dealDelay = 0;
    g.deal();

    g.forceSetTrumpSuit();

    expect(reveal.revealed.length >= 1).toBeTruthy();
    expect(g.trumpCard.rank).toBe('2');

    expect(trumpBroadcast.name).toBe('');
    expect(trumpBroadcast.card.rank).toBe('2');
  });

  test('correctly allow player to set kitty', () => {
    let hands = {p1: undefined, p2: undefined, p3: undefined, p4: undefined};

    const players = order.map(name => ({name, socket: {emit: (event, data) => {
        if (event === 'hand') {
          hands[name] = data['hand'];
        }
      }}})
    );

    const g = startedGame(players, () => {}, { starting_level: 0 });
    g.startRound();
    g.dealDelay = 0;
    g.deal();

    g.forceSetTrumpSuit();

    const actionPlayerName = g.getActionPlayerName();
    const actionPlayer = g.getPlayer(actionPlayerName);
    expect(hands[actionPlayerName].length).toBe(18);

    const kitty = [12, 13, 14, 15, 16, 17];
    g.setKitty(actionPlayer, kitty);
    expect(hands[actionPlayerName].length).toBe(12);
  });
});
const Game = require("../game");
const c = require("../const");

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
  test('game dealing cards allow players to reveal trump card', () => {
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
    g.startDeal();

    while (g.dealsLeft > 0) {
      let actionPlayer = g.getActionPlayerName();
      g.deal(actionPlayer);
    }

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
});
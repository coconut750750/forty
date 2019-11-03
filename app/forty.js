var Game = require('./game');

class Forty {
  constructor(dev) {
    this.games = {};
    this.dev = dev;

    if (dev) {
      const code = 'ffff';
      const newGame = new Game(code, () => this.endGame(code));
      newGame.addPlayer('player1', undefined);
      newGame.addPlayer('player2', undefined);
      newGame.addPlayer('player3', undefined);
      newGame.addPlayer('player4', undefined);
      newGame.start();
      newGame.startIndex = 0;
      newGame.deactivatePlayer('player1');
      this.games[code] = newGame;
    }
  }

  createGame(options) {
    const code = this.generateCode();
    const newGame = new Game(code, () => this.endGame(code), options);
    this.games[code] = newGame;
    return newGame;
  }

  retrieveGame(code) {
    return this.games[code];
  }

  endGame(code) {
    delete this.games[code];
  }

  generateCode() {
    var code = '';
    const length = 4;
    do {
      for (var i = 0; i < length; i++) {
        code += String.fromCharCode(97 + Math.random() * 26);
      }
    } while (this.games[code]);
    return code;
  }
}

module.exports = Forty;
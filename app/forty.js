var Game = require('./game');

class Forty {
  constructor() {
    this.games = {};
  }

  createGame(creatorName) {
    const code = this.generateCode();
    const newGame = new Game(code, () => this.endGame(code));
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
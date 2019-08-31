var Card = require('./card');

class Player {
  constructor(name, socket, isAdmin) {
    this.name = name;
    this.socket = socket;
    this.isAdmin = isAdmin;
    this.hand = [];
  }

  possibleCards(leadCard) {
    var cardsInFamily = [];
    for (var card of this.hand) {
      if (card.family === leadCard.family) {
        cardsInFamily.push(card);
      }
    }
    if (cardsInFamily.length === 0) {
      return this.hand
    }
    return cardsInFamily;
  }

  send(event, data) {
    this.socket.emit(event, data);
  }
}

module.exports = Player;

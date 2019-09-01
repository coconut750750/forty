var Card = require('./card');

class Player {
  constructor(name, socket, isAdmin) {
    this.name = name;
    this.socket = socket;
    this.isAdmin = isAdmin;
    this.hand = [];

    this.active = true;
  }

  addCard(card) {
    this.hand.push(card);
  }

  // playCard(index, trick) {
  //   trick.addCard(this.hand.splice(index, 1)[0]);
  // }

  legalCards(leadCard) {
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

  json() {
    return {
      name: this.name,
      isAdmin: this.isAdmin,
      active: this.active,
    };
  }

  send(event, data) {
    if (this.socket != undefined) {
      this.socket.emit(event, data);
    }
  }
}

module.exports = Player;

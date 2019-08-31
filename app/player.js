var Card = require('./card');

class Player {
  constructor(name, socket, isAdmin) {
    this.name = name;
    this.socket = socket;
    this.isAdmin = isAdmin;
    this.hand = [];
  }

  possibleCards(leadCard) {
    
  }

  send(event, data) {
    this.socket.emit(event, data);
  }
}

module.exports = Player;

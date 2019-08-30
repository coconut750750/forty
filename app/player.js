

class Player {
  constructor(name, socket, isAdmin) {
    this.name = name;
    this.socket = socket;
    this.isAdmin = isAdmin;
    this.hand = [];
  }

  send(event, data) {
    this.socket.emit(event, data);
  }
}

module.exports = Player;

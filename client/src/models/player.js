export default class Player {
  constructor(name, isAdmin, active) {
    this.name = name;
    this.isAdmin = isAdmin;
    this.active = active;
    this.winner = false;
  }

  win() {
    this.winner = true;
  }

  resetWin() {
    this.winner = false;
  }
}
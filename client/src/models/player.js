export default class Player {
  constructor(name, isAdmin, active, isDefending) {
    this.name = name;
    this.isAdmin = isAdmin;
    this.active = active;
    this.isDefending = isDefending;

    this.winner = false;
  }

  win() {
    this.winner = true;
  }

  resetWin() {
    this.winner = false;
  }
}
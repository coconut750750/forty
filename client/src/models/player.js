export default class Player {
  constructor(name, isAdmin, active, team) {
    this.name = name;
    this.isAdmin = isAdmin;
    this.active = active;
    this.team = team;

    this.winner = false;
  }

  win() {
    this.winner = true;
  }

  resetWin() {
    this.winner = false;
  }

  isDefending() {
    return this.team;
  }
}
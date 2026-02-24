class PlayerManager {
  constructor() {
    this.players = new Map();
    this.order = [];
  }

  count() {
    return this.order.length;
  }

  add(name, playerObj) {
    if (!this.exists(name)) {
      this.players.set(name, playerObj);
      this.order.push(name);
      return true;
    }
    return false;
  }

  exists(name) {
    return this.players.has(name)
  }

  get(name) {
    return this.players.get(name);
  }

  getNextN(n) {
    return this.order[(n + 1) % this.order.length];
  }

  indexOf(name) {
    return this.order.indexOf(name);
  }

  getNextName(name) {
    return this.getNextN(this.order.indexOf(name));
  }

  getN(n) {
    return this.get(this.order[n]);
  }

  remove(name) {
    if (this.exists(name)) {
      this.players.delete(name);
      this.order.splice(this.order.indexOf(name), 1);
    }
  }

  permuteOrder() {
    this.order = [this.order[0], ...this.order.slice(2), this.order[1]];;
  }

  all(f) {
    for (let [name, obj] of this.players) {
      if (!f(obj)) {
        return false;
      }
    }
    return true;
  }

  do(name, f) {
    if (this.exists(name)) {
      return f(this.players.get(name));
    }
  }

  doN(n, f) {
    return this.do(this.order[n], f);
  }

  doAll(f) {
    for (let [name, obj] of this.players) {
      f(obj);
    }
  }

  filter(f) {
    return this.order.filter((name, index) => f(this.players.get(name), index)).map(name => this.players.get(name));
  }

  forEach(f) {
    this.order.forEach((name, index) => f(this.players.get(name), index));
  }

  map(f) {
    return this.order.map(name => f(this.players.get(name)));
  }

  reduce(init, f) {
    return this.order.reduce((acc, name) => f(acc, this.players.get(name)), init);
  }

  json() {
    return this.order.map(name => this.players.get(name).json())
  }
}

module.exports = PlayerManager;
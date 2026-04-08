export class EconomyManager {
  constructor(initialCoins = 300) {
    this.coins = initialCoins;
    this.onChangeCallbacks = [];
  }

  getCoins() {
    return this.coins;
  }

  canAfford(cost) {
    return this.coins >= cost;
  }

  spend(cost) {
    if (!this.canAfford(cost)) return false;
    this.coins -= cost;
    this.notify();
    return true;
  }

  earn(amount) {
    this.coins += amount;
    this.notify();
  }

  onChange(cb) {
    this.onChangeCallbacks.push(cb);
  }

  notify() {
    this.onChangeCallbacks.forEach(cb => cb(this.coins));
  }
}

const STATE = { PREP: 'prep', ACTIVE: 'active', CLEARED: 'cleared', DONE: 'done' };

export class WaveManager {
  constructor(scene, waveConfig, hpMultiplier = 1.0, speedMultiplier = 1.0) {
    this.scene = scene;
    this.waveConfig = waveConfig;
    this.hpMultiplier = hpMultiplier;
    this.speedMultiplier = speedMultiplier;
    this.currentWave = 0;
    this.state = STATE.PREP;
    this.totalWaves = waveConfig.length;
    this.activeEnemies = 0;
    this.spawnQueue = [];
    this.spawnTimer = null;
  }

  getState() { return this.state; }
  getWaveNumber() { return this.currentWave + 1; }
  getTotalWaves() { return this.totalWaves; }

  startWave() {
    if (this.state !== STATE.PREP) return;
    if (this.currentWave >= this.totalWaves) return;

    this.state = STATE.ACTIVE;
    this.activeEnemies = 0;
    const waveDef = this.waveConfig[this.currentWave];

    this.spawnQueue = [];
    for (const group of waveDef.enemies) {
      for (let i = 0; i < group.count; i++) {
        this.spawnQueue.push({ type: group.type, delay: group.interval });
      }
    }

    this.spawnNext();
    this.scene.events.emit('wave-start', this.currentWave + 1);
  }

  spawnNext() {
    if (this.spawnQueue.length === 0) return;

    const entry = this.spawnQueue.shift();
    this.activeEnemies++;
    this.scene.events.emit('spawn-enemy', entry.type, this.hpMultiplier, this.speedMultiplier);

    if (this.spawnQueue.length > 0) {
      this.spawnTimer = this.scene.time.delayedCall(entry.delay, () => this.spawnNext());
    }
  }

  enemyDefeated() {
    this.activeEnemies--;
    this.checkWaveCleared();
  }

  enemyReachedEnd() {
    this.activeEnemies--;
    this.checkWaveCleared();
  }

  checkWaveCleared() {
    if (this.state !== STATE.ACTIVE) return;
    if (this.activeEnemies <= 0 && this.spawnQueue.length === 0) {
      this.currentWave++;
      if (this.currentWave >= this.totalWaves) {
        this.state = STATE.DONE;
        this.scene.events.emit('all-waves-cleared');
      } else {
        this.state = STATE.PREP;
        this.scene.events.emit('wave-cleared', this.currentWave);
      }
    }
  }

  destroy() {
    if (this.spawnTimer) this.spawnTimer.remove();
  }
}

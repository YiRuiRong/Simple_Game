import Phaser from 'phaser';
import { GridManager, CELL_SIZE, GRID_COLS, GRID_ROWS } from '../systems/GridManager.js';
import { EconomyManager } from '../systems/EconomyManager.js';
import { WaveManager } from '../systems/WaveManager.js';
import { ProgressManager } from '../systems/ProgressManager.js';
import { Enemy } from '../entities/Enemy.js';
import { ENEMY_CONFIG } from '../config/enemies.js';
import { TOWER_CONFIG } from '../config/towers.js';
import { LEVELS } from '../config/levels.js';
import { StarTower } from '../entities/towers/StarTower.js';
import { FrostTower } from '../entities/towers/FrostTower.js';
import { MeteorTower } from '../entities/towers/MeteorTower.js';
import { HealTower } from '../entities/towers/HealTower.js';
import { BlackHoleTower } from '../entities/towers/BlackHoleTower.js';

const TOWER_CLASSES = {
  star: StarTower,
  frost: FrostTower,
  meteor: MeteorTower,
  heal: HealTower,
  blackhole: BlackHoleTower,
};

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create(data) {
    // Load level config
    this.levelId = data.levelId || 1;
    this.levelConfig = LEVELS.find(l => l.id === this.levelId) || LEVELS[0];

    this.planetHP = 20;
    this.maxPlanetHP = 20;

    // Systems — use level-specific config
    this.gridManager = new GridManager(this, this.levelConfig.path);
    if (this.levelConfig.path2) {
      this.gridManager.markAdditionalPath(this.levelConfig.path2);
    }
    this.economy = new EconomyManager(this.levelConfig.startCoins);
    this.waveManager = new WaveManager(
      this,
      this.levelConfig.waves,
      this.levelConfig.hpMultiplier,
      this.levelConfig.speedMultiplier,
    );

    // Groups
    this.towers = [];
    this.enemies = this.add.group();
    this.projectiles = this.physics.add.group();

    // Selected tower type for placement
    this.selectedTowerType = null;
    this.highlightTile = null;

    // Create layers
    this.createStarfield();
    this.createMap();
    this.createHUD();
    this.createToolbar();
    this.createStartWaveButton();

    // Events
    this.events.on('spawn-enemy', this.spawnEnemy, this);
    this.events.on('enemy-killed', this.onEnemyKilled, this);
    this.events.on('enemy-reached-end', this.onEnemyReachedEnd, this);
    this.events.on('heal-planet', this.onHealPlanet, this);
    this.events.on('all-waves-cleared', this.onVictory, this);
    this.events.on('wave-cleared', this.onWaveCleared, this);
    this.events.on('wave-start', this.onWaveStart, this);

    this.economy.onChange(() => this.updateHUD());

    // Input
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerdown', this.onPointerDown, this);
  }

  // --- Starfield Background ---
  createStarfield() {
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, 960);
      const y = Phaser.Math.Between(0, 640);
      const size = Phaser.Math.FloatBetween(0.5, 1.5);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.7);
      const star = this.add.circle(x, y, size, 0xffffff, alpha);
      this.tweens.add({
        targets: star,
        alpha: alpha * 0.3,
        duration: Phaser.Math.Between(2000, 5000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  // --- Map Rendering ---
  createMap() {
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const { x, y } = this.gridManager.gridToWorld(c, r);
        const isPath = this.gridManager.grid[r][c] === 1;
        this.add.image(x, y, isPath ? 'tile-path' : 'tile-empty');
      }
    }

    // Planet at path end
    const pathPixels = this.gridManager.getPathAsPixels();
    const last = pathPixels[pathPixels.length - 1];
    this.planetSprite = this.add.image(last.x, last.y, 'planet').setScale(1.2);
    this.tweens.add({
      targets: this.planetSprite,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Highlight tile (follows cursor when placing)
    this.highlightTile = this.add.image(-100, -100, 'tile-highlight').setAlpha(0);
  }

  // --- HUD ---
  createHUD() {
    const hudY = 10;
    this.add.rectangle(480, hudY + 12, 960, 30, 0x000000, 0.5);

    this.coinText = this.add.text(20, hudY, `Coins: ${this.economy.getCoins()}`, {
      fontSize: '16px', fontFamily: 'Arial', color: '#ffdd44',
    });
    this.waveText = this.add.text(200, hudY, `Wave: 0/${this.waveManager.getTotalWaves()}`, {
      fontSize: '16px', fontFamily: 'Arial', color: '#44ccff',
    });
    this.hpText = this.add.text(400, hudY, `Planet HP: ${this.planetHP}/${this.maxPlanetHP}`, {
      fontSize: '16px', fontFamily: 'Arial', color: '#44ff88',
    });
    this.levelText = this.add.text(620, hudY, `Lv.${this.levelId} ${this.levelConfig.name}`, {
      fontSize: '16px', fontFamily: 'Arial', color: '#cc88ff',
    });
  }

  updateHUD() {
    this.coinText.setText(`Coins: ${this.economy.getCoins()}`);
    this.waveText.setText(`Wave: ${this.waveManager.getWaveNumber()}/${this.waveManager.getTotalWaves()}`);
    this.hpText.setText(`Planet HP: ${this.planetHP}/${this.maxPlanetHP}`);
  }

  // --- Toolbar ---
  createToolbar() {
    const toolbarY = 600;
    this.add.rectangle(480, toolbarY + 20, 960, 50, 0x000000, 0.6);

    const types = ['star', 'frost', 'meteor', 'heal', 'blackhole'];
    const startX = 200;

    types.forEach((type, i) => {
      const x = startX + i * 120;
      const cfg = TOWER_CONFIG[type];
      const btn = this.add.image(x, toolbarY + 18, cfg.key).setScale(0.9).setInteractive({ useHandCursor: true });
      const label = this.add.text(x + 20, toolbarY + 10, `${cfg.cost}`, {
        fontSize: '12px', fontFamily: 'Arial', color: '#ffdd44',
      });

      btn.on('pointerdown', (pointer) => {
        pointer.event.stopPropagation();
        this.selectedTowerType = type;
        this.toolbarButtons.forEach(b => b.btn.setAlpha(0.6));
        btn.setAlpha(1);
      });

      if (!this.toolbarButtons) this.toolbarButtons = [];
      this.toolbarButtons.push({ btn, label, type });
    });
  }

  // --- Start Wave Button ---
  createStartWaveButton() {
    this.startWaveBtn = this.add.text(850, 5, '[ START WAVE ]', {
      fontSize: '14px', fontFamily: 'Arial', fontStyle: 'bold', color: '#44ff88',
      backgroundColor: '#224422',
      padding: { x: 8, y: 4 },
    }).setInteractive({ useHandCursor: true });

    this.startWaveBtn.on('pointerdown', () => {
      this.waveManager.startWave();
    });
  }

  // --- Input Handlers ---
  onPointerMove(pointer) {
    if (!this.selectedTowerType) {
      this.highlightTile.setAlpha(0);
      return;
    }

    const { col, row } = this.gridManager.worldToGrid(pointer.x, pointer.y);
    if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS && row < 14) {
      const { x, y } = this.gridManager.gridToWorld(col, row);
      const canPlace = this.gridManager.canPlace(col, row);
      this.highlightTile.setPosition(x, y);
      this.highlightTile.setTexture(canPlace ? 'tile-highlight' : 'tile-invalid');
      this.highlightTile.setAlpha(1);
    } else {
      this.highlightTile.setAlpha(0);
    }
  }

  onPointerDown(pointer) {
    const hitObjects = this.input.hitTestPointer(pointer);
    const clickedUI = hitObjects.some(obj =>
      obj === this.startWaveBtn ||
      (this.toolbarButtons && this.toolbarButtons.some(b => b.btn === obj))
    );
    if (clickedUI || pointer.y < 30 || pointer.y > 590) return;

    const { col, row } = this.gridManager.worldToGrid(pointer.x, pointer.y);

    // Try to upgrade existing tower
    const existingTower = this.towers.find(t => {
      const tGrid = this.gridManager.worldToGrid(t.x, t.y);
      return tGrid.col === col && tGrid.row === row;
    });

    if (existingTower) {
      if (existingTower.isMaxLevel()) {
        this.showFloatingText(existingTower.x, existingTower.y - 20, 'MAX', '#ffdd44');
      } else {
        const cost = existingTower.getUpgradeCost();
        if (this.economy.spend(cost)) {
          existingTower.upgrade();
          this.showUpgradeEffect(existingTower);
        } else {
          this.showInsufficientFunds();
        }
      }
      return;
    }

    // Place new tower
    if (!this.selectedTowerType) return;
    if (!this.gridManager.canPlace(col, row)) return;

    const cfg = TOWER_CONFIG[this.selectedTowerType];
    if (!this.economy.spend(cfg.cost)) {
      this.showInsufficientFunds();
      return;
    }

    const { x, y } = this.gridManager.gridToWorld(col, row);
    const TowerClass = TOWER_CLASSES[this.selectedTowerType];
    const tower = new TowerClass(this, x, y);
    this.towers.push(tower);
    this.gridManager.placeTower(col, row);

    tower.setScale(0);
    this.tweens.add({
      targets: tower,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });
  }

  showInsufficientFunds() {
    const text = this.add.text(480, 300, 'Not enough coins!', {
      fontSize: '24px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ff4444', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(1);

    this.tweens.add({
      targets: text,
      y: 260,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy(),
    });
  }

  showFloatingText(x, y, message, color) {
    const text = this.add.text(x, y, message, {
      fontSize: '20px', fontFamily: 'Arial', fontStyle: 'bold',
      color, stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy(),
    });
  }

  showUpgradeEffect(tower) {
    const ring = this.add.circle(tower.x, tower.y, 10, 0xffdd44, 0.8);
    this.tweens.add({
      targets: ring,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 500,
      onComplete: () => ring.destroy(),
    });

    this.showFloatingText(tower.x, tower.y - 25, 'UPGRADED!', '#44ff88');

    const particles = this.add.particles(tower.x, tower.y, 'particle-star', {
      speed: { min: 40, max: 100 },
      scale: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 10,
      tint: [0xffdd44, 0xffffff],
    });
    this.time.delayedCall(700, () => particles.destroy());
  }

  // --- Spawning ---
  spawnEnemy(type, hpMult, speedMult) {
    const baseConfig = ENEMY_CONFIG[type];
    const config = {
      ...baseConfig,
      type,
      hp: Math.round(baseConfig.hp * (hpMult || 1)),
      speed: Math.round(baseConfig.speed * (speedMult || 1)),
      shield: baseConfig.shield ? Math.round(baseConfig.shield * (hpMult || 1)) : 0,
    };

    // Pick path — for twin-paths, alternate between path and path2
    let pathWaypoints = this.levelConfig.path;
    if (this.levelConfig.path2) {
      this.spawnPathToggle = !this.spawnPathToggle;
      pathWaypoints = this.spawnPathToggle ? this.levelConfig.path : this.levelConfig.path2;
    }

    const pathPixels = this.gridManager.getPathAsPixels(pathWaypoints);
    const start = pathPixels[0];
    const enemy = new Enemy(this, start.x, start.y, config, pathPixels.slice(1));
    this.enemies.add(enemy);

    // Boss summon behavior
    if (type === 'boss') {
      this.time.addEvent({
        delay: baseConfig.summonInterval || 8000,
        callback: () => {
          if (enemy.active && enemy.hp > 0) {
            for (let i = 0; i < (baseConfig.summonCount || 3); i++) {
              this.time.delayedCall(i * 300, () => {
                this.waveManager.activeEnemies++;
                const minionConfig = {
                  ...ENEMY_CONFIG.octopus,
                  type: 'octopus',
                  hp: Math.round(ENEMY_CONFIG.octopus.hp * (hpMult || 1)),
                  speed: Math.round(ENEMY_CONFIG.octopus.speed * (speedMult || 1)),
                };
                const minion = new Enemy(this, enemy.x, enemy.y, minionConfig, pathPixels.slice(1));
                this.enemies.add(minion);
              });
            }
          }
        },
        repeat: 3,
      });
    }
  }

  // --- Events ---
  onEnemyKilled(enemy) {
    this.economy.earn(enemy.reward);
    this.waveManager.enemyDefeated();
  }

  onEnemyReachedEnd(enemy) {
    this.planetHP -= enemy.damage;
    if (this.planetHP <= 0) this.planetHP = 0;
    this.updateHUD();

    this.tweens.add({
      targets: this.planetSprite,
      x: this.planetSprite.x + 5,
      duration: 50,
      yoyo: true,
      repeat: 3,
    });

    this.waveManager.enemyReachedEnd();

    if (this.planetHP <= 0) {
      this.scene.start('GameOver', { victory: false, wave: this.waveManager.getWaveNumber(), levelId: this.levelId });
    }
  }

  onHealPlanet(amount) {
    this.planetHP = Math.min(this.planetHP + amount, this.maxPlanetHP);
    this.updateHUD();
  }

  onVictory() {
    // Calculate star rating
    const hpRatio = this.planetHP / this.maxPlanetHP;
    let stars = 1;
    if (hpRatio >= 1) stars = 3;
    else if (hpRatio > 0.5) stars = 2;

    // Save progress
    ProgressManager.completeLevel(this.levelId, stars);

    this.time.delayedCall(1000, () => {
      this.scene.start('GameOver', {
        victory: true,
        wave: this.waveManager.getWaveNumber(),
        levelId: this.levelId,
        stars,
      });
    });
  }

  onWaveCleared() {
    this.startWaveBtn.setVisible(true);
    this.updateHUD();
  }

  onWaveStart() {
    this.startWaveBtn.setVisible(false);
    this.updateHUD();
  }

  // --- Game Loop ---
  update(time) {
    this.towers.forEach(tower => {
      if (tower.active) tower.update(time, this.enemies);
    });

    this.projectiles.getChildren().forEach(proj => {
      if (!proj.active) return;

      this.enemies.getChildren().forEach(enemy => {
        if (!enemy.active || enemy.hp <= 0) return;

        const dist = Phaser.Math.Distance.Between(proj.x, proj.y, enemy.x, enemy.y);
        if (dist < 15) {
          this.onProjectileHit(proj, enemy);
        }
      });

      if (proj.x < -50 || proj.x > 1010 || proj.y < -50 || proj.y > 690) {
        proj.destroy();
      }
    });
  }

  onProjectileHit(proj, enemy) {
    if (!proj.active) return;
    if (!enemy.active || !enemy.scene || enemy.hp <= 0) { proj.destroy(); return; }
    if (proj.isMeteor) {
      this.enemies.getChildren().forEach(e => {
        if (!e.active || e.hp <= 0) return;
        const dist = Phaser.Math.Distance.Between(proj.x, proj.y, e.x, e.y);
        if (dist < proj.splashRadius) {
          e.takeDamage(proj.damage);
        }
      });
      const particles = this.add.particles(proj.x, proj.y, 'particle-spark', {
        speed: { min: 50, max: 120 },
        scale: { start: 1.5, end: 0 },
        lifespan: 300,
        quantity: 12,
        tint: [0xff6644, 0xffaa44],
      });
      this.time.delayedCall(400, () => particles.destroy());
    } else {
      enemy.takeDamage(proj.damage);

      if (proj.isFrost) {
        enemy.applySlow(proj.slowFactor, proj.slowDuration);
      }

      const spark = this.add.particles(proj.x, proj.y, 'particle-spark', {
        speed: { min: 20, max: 60 },
        scale: { start: 1, end: 0 },
        lifespan: 200,
        quantity: 4,
      });
      this.time.delayedCall(300, () => spark.destroy());
    }

    proj.destroy();
  }
}

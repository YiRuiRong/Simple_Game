import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    this.generateTowerTextures();
    this.generateEnemyTextures();
    this.generateProjectileTextures();
    this.generateMapTextures();
    this.generateParticleTextures();
    this.generateLevelSelectTextures();
    this.scene.start('Title');
  }

  // --- Tower Textures (5 types × 2 levels) ---
  generateTowerTextures() {
    const towerDefs = [
      { key: 'tower-star',      color: 0xffdd44, accent: 0xfff8b0 },
      { key: 'tower-frost',     color: 0x44ccff, accent: 0xb0eeff },
      { key: 'tower-meteor',    color: 0xff6644, accent: 0xffaa88 },
      { key: 'tower-heal',      color: 0xff66aa, accent: 0xffbbdd },
      { key: 'tower-blackhole', color: 0x9944ff, accent: 0xcc99ff },
    ];

    towerDefs.forEach(({ key, color, accent }) => {
      // Level 1 (size 32)
      this.makeTowerTexture(key, color, accent, 32);
      // Level 2 (size 40, brighter)
      this.makeTowerTexture(`${key}-up`, accent, 0xffffff, 40);
    });
  }

  makeTowerTexture(key, bodyColor, topColor, size) {
    const g = this.add.graphics();
    const half = size / 2;

    // Base circle
    g.fillStyle(bodyColor, 1);
    g.fillCircle(half, half, half - 2);

    // Inner highlight
    g.fillStyle(topColor, 0.6);
    g.fillCircle(half - 4, half - 4, half / 3);

    // Small dome on top
    g.fillStyle(topColor, 0.8);
    g.fillCircle(half, half - half / 3, half / 4);

    g.generateTexture(key, size, size);
    g.destroy();
  }

  // --- Enemy Textures ---
  generateEnemyTextures() {
    this.makeOctopusTexture('enemy-octopus', 0xff88aa, 28);
    this.makeCaterpillarTexture('enemy-caterpillar', 0x88ff44, 28);
    this.makeRobotTexture('enemy-robot', 0x8888cc, 30);
    this.makeJellyfishTexture('enemy-jellyfish', 0x88ddff, 28);
    this.makeBossTexture('enemy-boss', 0xff4488, 48);
  }

  makeOctopusTexture(key, color, size) {
    const g = this.add.graphics();
    const h = size / 2;
    // Body
    g.fillStyle(color, 1);
    g.fillCircle(h, h - 2, h - 4);
    // Tentacles (3 bumps at bottom)
    for (let i = -1; i <= 1; i++) {
      g.fillCircle(h + i * 6, size - 4, 4);
    }
    // Eyes
    g.fillStyle(0xffffff, 1);
    g.fillCircle(h - 4, h - 4, 4);
    g.fillCircle(h + 4, h - 4, 4);
    g.fillStyle(0x222222, 1);
    g.fillCircle(h - 3, h - 3, 2);
    g.fillCircle(h + 5, h - 3, 2);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  makeCaterpillarTexture(key, color, size) {
    const g = this.add.graphics();
    const h = size / 2;
    // Body segments
    g.fillStyle(color, 1);
    g.fillCircle(6, h, 5);
    g.fillCircle(14, h - 1, 6);
    g.fillCircle(22, h, 5);
    // Head (brighter)
    g.fillStyle(0xaaff66, 1);
    g.fillCircle(14, h - 1, 6);
    // Eyes
    g.fillStyle(0xffffff, 1);
    g.fillCircle(12, h - 3, 3);
    g.fillCircle(17, h - 3, 3);
    g.fillStyle(0x222222, 1);
    g.fillCircle(12, h - 2, 1.5);
    g.fillCircle(17, h - 2, 1.5);
    // Antennae
    g.lineStyle(1.5, color, 1);
    g.lineBetween(10, h - 7, 8, h - 12);
    g.lineBetween(18, h - 7, 20, h - 12);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  makeRobotTexture(key, color, size) {
    const g = this.add.graphics();
    const h = size / 2;
    // Body (rounded rect approximation)
    g.fillStyle(color, 1);
    g.fillRoundedRect(4, 6, size - 8, size - 8, 4);
    // Visor
    g.fillStyle(0x44ffaa, 0.8);
    g.fillRoundedRect(7, 9, size - 14, 8, 2);
    // Eyes on visor
    g.fillStyle(0xffffff, 1);
    g.fillCircle(h - 3, 13, 2.5);
    g.fillCircle(h + 3, 13, 2.5);
    // Antenna
    g.lineStyle(2, color, 1);
    g.lineBetween(h, 6, h, 1);
    g.fillStyle(0xff4444, 1);
    g.fillCircle(h, 1, 2);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  makeJellyfishTexture(key, color, size) {
    const g = this.add.graphics();
    const h = size / 2;
    // Dome
    g.fillStyle(color, 0.6);
    g.fillCircle(h, h - 2, h - 4);
    // Trailing tentacles
    g.lineStyle(1.5, color, 0.4);
    for (let i = -2; i <= 2; i++) {
      const x = h + i * 4;
      g.lineBetween(x, h + 2, x + i, size - 1);
    }
    // Eyes
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(h - 4, h - 3, 3);
    g.fillCircle(h + 4, h - 3, 3);
    g.fillStyle(0x4444aa, 0.9);
    g.fillCircle(h - 3, h - 2, 1.5);
    g.fillCircle(h + 5, h - 2, 1.5);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  makeBossTexture(key, color, size) {
    const g = this.add.graphics();
    const h = size / 2;
    // Large body
    g.fillStyle(color, 1);
    g.fillCircle(h, h, h - 4);
    // Crown bumps
    g.fillStyle(0xffdd44, 1);
    g.fillTriangle(h - 10, 6, h - 6, -4, h - 2, 6);
    g.fillTriangle(h - 2, 4, h + 2, -6, h + 6, 4);
    g.fillTriangle(h + 6, 6, h + 10, -4, h + 14, 6);
    // Giant eye
    g.fillStyle(0xffffff, 1);
    g.fillCircle(h, h, h / 2);
    g.fillStyle(0xff2244, 1);
    g.fillCircle(h, h, h / 4);
    g.fillStyle(0x222222, 1);
    g.fillCircle(h, h, h / 8);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  // --- Projectile Textures ---
  generateProjectileTextures() {
    // Star bolt
    let g = this.add.graphics();
    g.fillStyle(0xffdd44, 1);
    g.fillCircle(4, 4, 4);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(3, 3, 2);
    g.generateTexture('proj-star', 8, 8);
    g.destroy();

    // Ice shard
    g = this.add.graphics();
    g.fillStyle(0x88ddff, 0.9);
    g.fillTriangle(4, 0, 0, 8, 8, 8);
    g.generateTexture('proj-ice', 8, 8);
    g.destroy();

    // Meteor
    g = this.add.graphics();
    g.fillStyle(0xff6644, 1);
    g.fillCircle(6, 6, 6);
    g.fillStyle(0xffaa44, 0.7);
    g.fillCircle(4, 4, 3);
    g.generateTexture('proj-meteor', 12, 12);
    g.destroy();

    // Gravity orb
    g = this.add.graphics();
    g.fillStyle(0x9944ff, 0.7);
    g.fillCircle(5, 5, 5);
    g.fillStyle(0xcc88ff, 0.5);
    g.fillCircle(3, 3, 2);
    g.generateTexture('proj-gravity', 10, 10);
    g.destroy();
  }

  // --- Map Textures ---
  generateMapTextures() {
    const cellSize = 40;

    // Path tile
    let g = this.add.graphics();
    g.fillStyle(0x1a1a4e, 1);
    g.fillRoundedRect(1, 1, cellSize - 2, cellSize - 2, 3);
    g.lineStyle(1, 0x2a2a6e, 0.5);
    g.strokeRoundedRect(1, 1, cellSize - 2, cellSize - 2, 3);
    g.generateTexture('tile-path', cellSize, cellSize);
    g.destroy();

    // Empty cell (placeable)
    g = this.add.graphics();
    g.fillStyle(0x0d0d3a, 1);
    g.fillRoundedRect(1, 1, cellSize - 2, cellSize - 2, 3);
    g.lineStyle(1, 0x222266, 0.3);
    g.strokeRoundedRect(1, 1, cellSize - 2, cellSize - 2, 3);
    g.generateTexture('tile-empty', cellSize, cellSize);
    g.destroy();

    // Planet
    g = this.add.graphics();
    g.fillStyle(0x44aaff, 1);
    g.fillCircle(20, 20, 18);
    g.fillStyle(0x66ccff, 0.6);
    g.fillCircle(14, 14, 8);
    g.fillStyle(0x88eeff, 0.4);
    g.fillCircle(10, 10, 4);
    g.generateTexture('planet', cellSize, cellSize);
    g.destroy();

    // Cell highlight (placement preview)
    g = this.add.graphics();
    g.fillStyle(0x44ff44, 0.3);
    g.fillRoundedRect(1, 1, cellSize - 2, cellSize - 2, 3);
    g.lineStyle(2, 0x44ff44, 0.6);
    g.strokeRoundedRect(1, 1, cellSize - 2, cellSize - 2, 3);
    g.generateTexture('tile-highlight', cellSize, cellSize);
    g.destroy();

    // Cell invalid (can't place)
    g = this.add.graphics();
    g.fillStyle(0xff4444, 0.3);
    g.fillRoundedRect(1, 1, cellSize - 2, cellSize - 2, 3);
    g.lineStyle(2, 0xff4444, 0.6);
    g.strokeRoundedRect(1, 1, cellSize - 2, cellSize - 2, 3);
    g.generateTexture('tile-invalid', cellSize, cellSize);
    g.destroy();
  }

  // --- Particle Textures ---
  generateParticleTextures() {
    // Pop/poof particle
    let g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(3, 3, 3);
    g.generateTexture('particle-pop', 6, 6);
    g.destroy();

    // Hit spark
    g = this.add.graphics();
    g.fillStyle(0xffff88, 1);
    g.fillCircle(2, 2, 2);
    g.generateTexture('particle-spark', 4, 4);
    g.destroy();

    // Star particle (for coin effects)
    g = this.add.graphics();
    g.fillStyle(0xffdd44, 1);
    g.fillCircle(4, 4, 3);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(3, 3, 1.5);
    g.generateTexture('particle-star', 8, 8);
    g.destroy();
  }

  // --- Level Select Textures ---
  generateLevelSelectTextures() {
    // Level button background (unlocked)
    let g = this.add.graphics();
    g.fillStyle(0x222266, 1);
    g.fillRoundedRect(0, 0, 120, 80, 8);
    g.lineStyle(2, 0x4444aa, 0.8);
    g.strokeRoundedRect(0, 0, 120, 80, 8);
    g.generateTexture('level-btn', 120, 80);
    g.destroy();

    // Level button background (locked)
    g = this.add.graphics();
    g.fillStyle(0x111133, 1);
    g.fillRoundedRect(0, 0, 120, 80, 8);
    g.lineStyle(2, 0x222244, 0.5);
    g.strokeRoundedRect(0, 0, 120, 80, 8);
    g.generateTexture('level-btn-locked', 120, 80);
    g.destroy();

    // Lock icon
    g = this.add.graphics();
    g.fillStyle(0x666688, 1);
    g.fillRoundedRect(6, 12, 12, 10, 2);
    g.lineStyle(2, 0x666688, 1);
    g.strokeCircle(12, 9, 6);
    g.generateTexture('icon-lock', 24, 24);
    g.destroy();
  }
}

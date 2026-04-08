import Phaser from 'phaser';

export class Tower extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, config.key);
    scene.add.existing(this);

    this.config = { ...config };
    this.level = 1;
    this.damage = config.damage || 0;
    this.range = config.range || 0;
    this.fireRate = config.fireRate || 1000;
    this.lastFired = 0;
    this.towerType = config.towerType;

    // Range circle (debug/visual, hidden by default)
    this.rangeCircle = scene.add.circle(x, y, this.range, 0xffffff, 0.05).setVisible(false);
  }

  upgrade() {
    if (this.level >= 2) return false;
    this.level = 2;
    this.damage *= 2;
    this.setTexture(this.config.upKey);
    this.setScale(1.25);

    // Flash effect
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.5, to: 1 },
      duration: 300,
      yoyo: true,
    });

    return true;
  }

  isMaxLevel() {
    return this.level >= 2;
  }

  getUpgradeCost() {
    return Math.floor(this.config.cost * 1.5);
  }

  findTarget(enemies) {
    let closest = null;
    let closestDist = this.range;

    enemies.getChildren().forEach(enemy => {
      if (!enemy.active || enemy.hp <= 0) return;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      if (dist < closestDist) {
        closestDist = dist;
        closest = enemy;
      }
    });

    return closest;
  }

  canFire(time) {
    return time - this.lastFired >= this.fireRate;
  }

  fire(time, target) {
    this.lastFired = time;
    return this.createProjectile(target);
  }

  createProjectile(target) {
    const projKey = this.config.projectile;
    if (!projKey) return null;

    const proj = this.scene.physics.add.sprite(this.x, this.y, projKey);
    proj.damage = this.damage;
    proj.towerConfig = this.config;
    proj.targetEnemy = target;

    // Add to the scene's projectiles group so collision detection works
    if (this.scene.projectiles) {
      this.scene.projectiles.add(proj);
    }

    const speed = 300;
    this.scene.physics.moveToObject(proj, target, speed);

    // Auto-destroy after 2 seconds (safety net)
    this.scene.time.delayedCall(2000, () => {
      if (proj.active) proj.destroy();
    });

    return proj;
  }

  update(time, enemies) {
    // Override in subclasses for special behavior
    if (this.range === 0) return; // Heal tower has no targeting

    const target = this.findTarget(enemies);
    if (target && this.canFire(time)) {
      this.fire(time, target);
    }
  }

  showRange(visible) {
    this.rangeCircle.setVisible(visible);
  }

  destroy() {
    if (this.rangeCircle) this.rangeCircle.destroy();
    super.destroy();
  }
}

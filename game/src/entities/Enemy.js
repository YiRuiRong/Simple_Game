import Phaser from 'phaser';

export class Enemy extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, config, path) {
    super(scene, x, y, config.key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.config = config;
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.speed = config.speed;
    this.basSpeed = config.speed;
    this.damage = config.damage || 1;
    this.reward = config.reward || 10;
    this.immuneSlow = config.immuneSlow || false;
    this.shield = config.shield || 0;
    this.enemyType = config.type;

    // Path following
    this.pathPoints = path;
    this.pathIndex = 0;
    this.moveToNext();

    // Health bar
    this.hpBarBg = scene.add.rectangle(x, y - 16, 24, 4, 0x333333).setOrigin(0.5);
    this.hpBar = scene.add.rectangle(x, y - 16, 24, 4, 0x44ff44).setOrigin(0.5);

    // Slow effect tracking
    this.slowTimer = null;
  }

  moveToNext() {
    if (!this.active || !this.scene) return;
    if (this.pathIndex >= this.pathPoints.length) {
      this.reachEnd();
      return;
    }

    const target = this.pathPoints[this.pathIndex];
    const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
    const duration = (dist / this.speed) * 1000;

    this.moveTween = this.scene.tweens.add({
      targets: this,
      x: target.x,
      y: target.y,
      duration,
      ease: 'Linear',
      onComplete: () => {
        this.pathIndex++;
        this.moveToNext();
      },
    });
  }

  reachEnd() {
    this.scene.events.emit('enemy-reached-end', this);
    this.removeSelf();
  }

  takeDamage(amount) {
    // Shield absorbs damage first
    if (this.shield > 0) {
      const absorbed = Math.min(this.shield, amount);
      this.shield -= absorbed;
      amount -= absorbed;
      if (amount <= 0) return;
    }

    this.hp -= amount;
    this.updateHealthBar();

    // Flash white on hit
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (this.active) this.clearTint();
    });

    if (this.hp <= 0) {
      this.die();
    }
  }

  applySlow(factor, duration) {
    if (this.immuneSlow || !this.active || !this.scene) return;
    this.speed = this.basSpeed * factor;

    // Restart current movement with new speed
    if (this.moveTween) this.moveTween.stop();
    this.moveToNext();

    if (this.slowTimer) this.slowTimer.remove();
    this.slowTimer = this.scene.time.delayedCall(duration, () => {
      if (!this.active || !this.scene) return;
      this.speed = this.basSpeed;
      if (this.moveTween) this.moveTween.stop();
      this.moveToNext();
    });
  }

  die() {
    this.scene.events.emit('enemy-killed', this);
    // Pop particle effect
    const particles = this.scene.add.particles(this.x, this.y, 'particle-pop', {
      speed: { min: 30, max: 80 },
      scale: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 8,
      tint: [0xff88aa, 0xffdd44, 0x88ffaa],
    });
    this.scene.time.delayedCall(500, () => particles.destroy());

    this.removeSelf();
  }

  removeSelf() {
    if (this.moveTween) this.moveTween.stop();
    if (this.slowTimer) this.slowTimer.remove();
    if (this.hpBar) this.hpBar.destroy();
    if (this.hpBarBg) this.hpBarBg.destroy();
    this.destroy();
  }

  updateHealthBar() {
    const ratio = Math.max(0, this.hp / this.maxHp);
    this.hpBar.width = 24 * ratio;
    // Color: green -> yellow -> red
    if (ratio > 0.5) {
      this.hpBar.fillColor = 0x44ff44;
    } else if (ratio > 0.25) {
      this.hpBar.fillColor = 0xffdd44;
    } else {
      this.hpBar.fillColor = 0xff4444;
    }
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    // Keep health bar following enemy
    if (this.hpBarBg && this.hpBar) {
      this.hpBarBg.setPosition(this.x, this.y - 16);
      this.hpBar.setPosition(this.x, this.y - 16);
    }
  }
}

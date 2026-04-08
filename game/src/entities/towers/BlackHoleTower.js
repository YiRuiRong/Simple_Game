import Phaser from 'phaser';
import { Tower } from '../Tower.js';
import { TOWER_CONFIG } from '../../config/towers.js';

export class BlackHoleTower extends Tower {
  constructor(scene, x, y) {
    super(scene, x, y, { ...TOWER_CONFIG.blackhole, towerType: 'blackhole' });
    this.lastPulled = 0;
  }

  update(time, enemies) {
    if (time - this.lastPulled >= this.fireRate) {
      this.lastPulled = time;

      // Pull all enemies in range: stop their tween, apply slow, and damage
      enemies.getChildren().forEach(enemy => {
        if (!enemy.active || enemy.hp <= 0) return;
        const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
        if (dist < this.range) {
          // Pause enemy movement briefly for pull effect
          if (enemy.moveTween && enemy.moveTween.isPlaying()) {
            enemy.moveTween.pause();
            this.scene.time.delayedCall(500, () => {
              if (enemy.active && enemy.moveTween) enemy.moveTween.resume();
            });
          }
          // Damage
          enemy.takeDamage(this.damage);
        }
      });

      // Visual pulse
      this.scene.tweens.add({
        targets: this,
        angle: { from: 0, to: 360 },
        duration: 600,
      });
    }
  }
}

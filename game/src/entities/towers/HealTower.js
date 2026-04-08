import { Tower } from '../Tower.js';
import { TOWER_CONFIG } from '../../config/towers.js';

export class HealTower extends Tower {
  constructor(scene, x, y) {
    super(scene, x, y, { ...TOWER_CONFIG.heal, towerType: 'heal' });
    this.lastHealed = 0;
  }

  update(time) {
    if (time - this.lastHealed >= this.fireRate) {
      this.lastHealed = time;
      this.scene.events.emit('heal-planet', this.config.healAmount * this.level);

      // Visual pulse
      this.scene.tweens.add({
        targets: this,
        scaleX: this.level === 2 ? 1.5 : 1.2,
        scaleY: this.level === 2 ? 1.5 : 1.2,
        duration: 200,
        yoyo: true,
      });
    }
  }
}

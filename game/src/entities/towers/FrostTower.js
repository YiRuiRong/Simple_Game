import { Tower } from '../Tower.js';
import { TOWER_CONFIG } from '../../config/towers.js';

export class FrostTower extends Tower {
  constructor(scene, x, y) {
    super(scene, x, y, { ...TOWER_CONFIG.frost, towerType: 'frost' });
  }

  fire(time, target) {
    this.lastFired = time;
    const proj = this.createProjectile(target);
    if (proj) {
      proj.isFrost = true;
      proj.slowFactor = this.config.slowFactor;
      proj.slowDuration = this.config.slowDuration;
    }
    return proj;
  }
}

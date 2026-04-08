import { Tower } from '../Tower.js';
import { TOWER_CONFIG } from '../../config/towers.js';

export class MeteorTower extends Tower {
  constructor(scene, x, y) {
    super(scene, x, y, { ...TOWER_CONFIG.meteor, towerType: 'meteor' });
  }

  fire(time, target) {
    this.lastFired = time;
    const proj = this.createProjectile(target);
    if (proj) {
      proj.isMeteor = true;
      proj.splashRadius = this.config.splashRadius;
    }
    return proj;
  }
}

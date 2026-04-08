import { Tower } from '../Tower.js';
import { TOWER_CONFIG } from '../../config/towers.js';

export class StarTower extends Tower {
  constructor(scene, x, y) {
    super(scene, x, y, { ...TOWER_CONFIG.star, towerType: 'star' });
  }
}

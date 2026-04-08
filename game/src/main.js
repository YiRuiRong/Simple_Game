import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { LevelSelectScene } from './scenes/LevelSelectScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

const config = {
  type: Phaser.CANVAS,
  width: 960,
  height: 640,
  parent: 'game-container',
  backgroundColor: '#0a0a2e',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [BootScene, TitleScene, LevelSelectScene, GameScene, GameOverScene],
};

new Phaser.Game(config);

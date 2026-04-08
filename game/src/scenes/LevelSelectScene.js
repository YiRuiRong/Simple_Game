import Phaser from 'phaser';
import { LEVELS } from '../config/levels.js';
import { ProgressManager } from '../systems/ProgressManager.js';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelect');
  }

  create() {
    this.createStarfield();

    this.add.text(480, 50, '- Select Level -', {
      fontSize: '36px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ffdd44', stroke: '#ff8844', strokeThickness: 3,
    }).setOrigin(0.5);

    this.createLevelGrid();
    this.createBackButton();
  }

  createStarfield() {
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, 960);
      const y = Phaser.Math.Between(0, 640);
      const size = Phaser.Math.FloatBetween(0.5, 1.5);
      this.add.circle(x, y, size, 0xffffff, Phaser.Math.FloatBetween(0.2, 0.7));
    }
  }

  createLevelGrid() {
    const cols = 5;
    const btnW = 120;
    const btnH = 80;
    const gapX = 30;
    const gapY = 30;
    const startX = 480 - ((cols - 1) * (btnW + gapX)) / 2;
    const startY = 130;

    const unlockedLevel = ProgressManager.getUnlockedLevel();

    LEVELS.forEach((level, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (btnW + gapX);
      const y = startY + row * (btnH + gapY + 30);
      const isUnlocked = level.id <= unlockedLevel;

      // Button background
      const btn = this.add.image(x, y, isUnlocked ? 'level-btn' : 'level-btn-locked')
        .setOrigin(0.5);

      if (isUnlocked) {
        btn.setInteractive({ useHandCursor: true });

        // Level number
        this.add.text(x, y - 18, `${level.id}`, {
          fontSize: '24px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffffff',
        }).setOrigin(0.5);

        // Level name
        this.add.text(x, y + 5, level.name, {
          fontSize: '10px', fontFamily: 'Arial', color: '#aaaacc',
        }).setOrigin(0.5);

        // Stars
        const stars = ProgressManager.getStars(level.id);
        const starStr = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        this.add.text(x, y + 22, starStr, {
          fontSize: '14px', fontFamily: 'Arial',
          color: stars > 0 ? '#ffdd44' : '#444466',
        }).setOrigin(0.5);

        // Hover effect
        btn.on('pointerover', () => btn.setTint(0x6666cc));
        btn.on('pointerout', () => btn.clearTint());
        btn.on('pointerdown', () => {
          this.scene.start('Game', { levelId: level.id });
        });
      } else {
        // Lock icon
        this.add.image(x, y - 5, 'icon-lock').setScale(1.5).setAlpha(0.6);
        this.add.text(x, y + 20, 'LOCKED', {
          fontSize: '10px', fontFamily: 'Arial', color: '#444466',
        }).setOrigin(0.5);
      }
    });
  }

  createBackButton() {
    const btn = this.add.text(480, 590, '[ BACK TO TITLE ]', {
      fontSize: '18px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#8888aa', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#ccccee'));
    btn.on('pointerout', () => btn.setColor('#8888aa'));
    btn.on('pointerdown', () => this.scene.start('Title'));
  }
}

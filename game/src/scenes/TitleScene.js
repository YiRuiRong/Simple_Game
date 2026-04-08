import Phaser from 'phaser';
import { TOWER_CONFIG } from '../config/towers.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    this.selectedTowerKey = null;
    this.towerButtons = [];

    this.createStarfield();
    this.createTitle();
    this.createStartButton();
    this.createTowerGuide();
    this.createFloatingEnemies();
  }

  createStarfield() {
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, 960);
      const y = Phaser.Math.Between(0, 640);
      const size = Phaser.Math.FloatBetween(0.5, 2);
      const alpha = Phaser.Math.FloatBetween(0.3, 1);
      const star = this.add.circle(x, y, size, 0xffffff, alpha);
      this.tweens.add({
        targets: star,
        alpha: { from: alpha, to: alpha * 0.3 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  createTitle() {
    this.add.text(480, 80, 'Cute Space', {
      fontSize: '50px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#ffdd44',
      stroke: '#ff8844',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(480, 140, 'Tower Defense', {
      fontSize: '42px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#44ccff',
      stroke: '#2266aa',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(480, 185, 'Protect your little planet!', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaacc',
    }).setOrigin(0.5);
  }

  createStartButton() {
    const btn = this.add.text(480, 230, '[ START ]', {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#44ff88',
      stroke: '#228844',
      strokeThickness: 2,
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: btn,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    btn.on('pointerover', () => btn.setColor('#88ffbb'));
    btn.on('pointerout', () => btn.setColor('#44ff88'));
    btn.on('pointerdown', () => this.scene.start('LevelSelect'));
  }

  // --- Tower Guide ---
  createTowerGuide() {
    // Section title
    this.add.text(480, 295, '- Tower Guide -', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#ffdd44',
    }).setOrigin(0.5);

    // Tower icon buttons
    const types = Object.keys(TOWER_CONFIG);
    const startX = 480 - (types.length - 1) * 90 / 2;

    types.forEach((type, i) => {
      const cfg = TOWER_CONFIG[type];
      const x = startX + i * 90;
      const y = 355;

      // Icon
      const icon = this.add.image(x, y, cfg.key).setScale(1.1).setInteractive({ useHandCursor: true });

      // Name
      const name = this.add.text(x, y + 24, cfg.name, {
        fontSize: '11px', fontFamily: 'Arial', color: '#ccccee',
      }).setOrigin(0.5);

      // Cost
      const cost = this.add.text(x, y + 38, `${cfg.cost}`, {
        fontSize: '12px', fontFamily: 'Arial', fontStyle: 'bold', color: '#ffdd44',
      }).setOrigin(0.5);

      // Brief description
      const desc = this.add.text(x, y + 52, cfg.description, {
        fontSize: '10px', fontFamily: 'Arial', color: '#8888aa',
      }).setOrigin(0.5);

      // Click handler
      icon.on('pointerdown', () => this.selectTower(type));
      icon.on('pointerover', () => {
        if (this.selectedTowerKey !== type) icon.setScale(1.3);
      });
      icon.on('pointerout', () => {
        if (this.selectedTowerKey !== type) icon.setScale(1.1);
      });

      this.towerButtons.push({ icon, name, cost, desc, type });
    });

    // Detail panel background
    this.detailBg = this.add.rectangle(480, 470, 500, 90, 0x000000, 0.4)
      .setStrokeStyle(1, 0x333366, 0.6);

    // Detail panel text - default prompt
    this.detailTitle = this.add.text(480, 440, 'Click a tower to see details', {
      fontSize: '16px', fontFamily: 'Arial', fontStyle: 'bold', color: '#8888bb',
    }).setOrigin(0.5);

    this.detailStats = this.add.text(480, 462, '', {
      fontSize: '13px', fontFamily: 'Arial', color: '#aaaacc',
    }).setOrigin(0.5);

    this.detailSpecial = this.add.text(480, 485, '', {
      fontSize: '12px', fontFamily: 'Arial', color: '#ffdd44',
    }).setOrigin(0.5);
  }

  selectTower(type) {
    this.selectedTowerKey = type;
    const cfg = TOWER_CONFIG[type];

    // Update highlight states
    this.towerButtons.forEach(b => {
      if (b.type === type) {
        b.icon.setScale(1.4);
        b.icon.setAlpha(1);
      } else {
        b.icon.setScale(1.1);
        b.icon.setAlpha(0.5);
      }
    });

    // Update detail panel
    this.detailTitle.setText(cfg.name);
    this.detailTitle.setColor('#ffffff');

    const atkSpeed = (1000 / cfg.fireRate).toFixed(1);
    if (cfg.range > 0) {
      this.detailStats.setText(`DMG: ${cfg.damage || 0}    Range: ${cfg.range}    ATK Speed: ${atkSpeed}/s`);
    } else {
      this.detailStats.setText(`Heal: ${cfg.healAmount} HP    Interval: ${(cfg.fireRate / 1000).toFixed(1)}s`);
    }

    this.detailSpecial.setText(cfg.detailText || '');
  }

  createFloatingEnemies() {
    const enemyKeys = ['enemy-octopus', 'enemy-caterpillar', 'enemy-robot', 'enemy-jellyfish', 'enemy-boss'];
    const positions = [
      { x: 120, y: 570 }, { x: 300, y: 590 }, { x: 500, y: 580 },
      { x: 680, y: 595 }, { x: 840, y: 575 },
    ];

    positions.forEach((pos, i) => {
      const sprite = this.add.image(pos.x, pos.y, enemyKeys[i]).setScale(1.3).setAlpha(0.5);
      this.tweens.add({
        targets: sprite,
        y: pos.y - 10,
        duration: Phaser.Math.Between(1500, 2500),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 200,
      });
    });
  }
}

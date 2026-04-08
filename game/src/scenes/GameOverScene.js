import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data) {
    const victory = data.victory || false;
    const wave = data.wave || 0;
    const stars = data.stars || 0;
    const levelId = data.levelId || 1;

    // Starfield
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, 960);
      const y = Phaser.Math.Between(0, 640);
      this.add.circle(x, y, Phaser.Math.FloatBetween(0.5, 1.5), 0xffffff, Phaser.Math.FloatBetween(0.3, 0.8));
    }

    if (victory) {
      this.add.text(480, 160, 'VICTORY!', {
        fontSize: '64px', fontFamily: 'Arial', fontStyle: 'bold',
        color: '#ffdd44', stroke: '#ff8844', strokeThickness: 6,
      }).setOrigin(0.5);

      this.add.text(480, 230, `Level ${levelId} cleared!`, {
        fontSize: '24px', fontFamily: 'Arial', color: '#88ffaa',
      }).setOrigin(0.5);

      // Star display
      const starStr = '★'.repeat(stars) + '☆'.repeat(3 - stars);
      this.add.text(480, 290, starStr, {
        fontSize: '48px', fontFamily: 'Arial',
        color: '#ffdd44', stroke: '#aa8800', strokeThickness: 3,
      }).setOrigin(0.5);

      // Star description
      const desc = stars === 3 ? 'Perfect! Full HP!' : stars === 2 ? 'Great job!' : 'Planet survived!';
      this.add.text(480, 340, desc, {
        fontSize: '18px', fontFamily: 'Arial', color: '#aaaacc',
      }).setOrigin(0.5);
    } else {
      this.add.text(480, 180, 'DEFEAT', {
        fontSize: '64px', fontFamily: 'Arial', fontStyle: 'bold',
        color: '#ff4444', stroke: '#880000', strokeThickness: 6,
      }).setOrigin(0.5);

      this.add.text(480, 260, `Level ${levelId} - Fell on wave ${wave}`, {
        fontSize: '24px', fontFamily: 'Arial', color: '#ffaaaa',
      }).setOrigin(0.5);
    }

    // Retry button
    const retryBtn = this.add.text(380, 420, '[ RETRY ]', {
      fontSize: '24px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#ff8844', stroke: '#884422', strokeThickness: 2,
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    retryBtn.on('pointerover', () => retryBtn.setColor('#ffaa66'));
    retryBtn.on('pointerout', () => retryBtn.setColor('#ff8844'));
    retryBtn.on('pointerdown', () => this.scene.start('Game', { levelId }));

    // Level select button
    const selectBtn = this.add.text(580, 420, '[ LEVELS ]', {
      fontSize: '24px', fontFamily: 'Arial', fontStyle: 'bold',
      color: '#44ff88', stroke: '#228844', strokeThickness: 2,
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    selectBtn.on('pointerover', () => selectBtn.setColor('#88ffbb'));
    selectBtn.on('pointerout', () => selectBtn.setColor('#44ff88'));
    selectBtn.on('pointerdown', () => this.scene.start('LevelSelect'));
  }
}

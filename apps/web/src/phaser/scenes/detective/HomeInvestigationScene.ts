// apps/web/src/phaser/scenes/detective/HomeInvestigationScene.ts
import Phaser from 'phaser';

export class HomeInvestigationScene extends Phaser.Scene {
  constructor() {
    super('HomeInvestigation');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1B1A3A, 0x1B1A3A, 0x0D0D1A, 0x0D0D1A, 1);
    bg.fillRect(0, 0, W, H);

    // Title text
    this.add.text(W / 2, H / 2 - 60, '🏡 Sunita\'s Home', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '28px',
      color: '#8B5CF6',
    }).setOrigin(0.5);

    // Brief text
    this.add.text(W / 2, H / 2, 'Sunita\'s Home investigation is locked.\nIdentify Greenfield School problems first to unlock this scene!', {
      fontFamily: "'Nunito', sans-serif",
      fontSize: '15px',
      color: '#A8B2D8',
      align: 'center',
    }).setOrigin(0.5);

    // Go Back Button
    const backBtnBg = this.add.graphics();
    backBtnBg.fillStyle(0xFF6B35, 1);
    backBtnBg.fillRoundedRect(W / 2 - 100, H / 2 + 80, 200, 40, 10);
    
    const backBtnText = this.add.text(W / 2, H / 2 + 100, 'RETURN TO HQ', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '14px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    const hitArea = new Phaser.Geom.Rectangle(W / 2 - 100, H / 2 + 80, 200, 40);
    backBtnText.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    
    backBtnText.on('pointerover', () => this.input.setDefaultCursor('pointer'));
    backBtnText.on('pointerout', () => this.input.setDefaultCursor('default'));
    backBtnText.on('pointerdown', () => {
      this.input.setDefaultCursor('default');
      this.scene.start('DetectiveHQ');
    });
  }
}

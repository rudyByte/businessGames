// apps/web/src/phaser/scenes/detective/DetectiveHQScene.ts
import Phaser from 'phaser';

export class DetectiveHQScene extends Phaser.Scene {
  constructor() {
    super('DetectiveHQ');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x111122, 0x111122, 0x1a1a3a, 0x1a1a3a, 1);
    bg.fillRect(0, 0, W, H);

    // Decorative board border
    const board = this.add.graphics();
    board.fillStyle(0x16213E, 0.9);
    board.fillRoundedRect(W / 2 - 250, H / 2 - 180, 500, 360, 16);
    board.lineStyle(2, 0x4ECDC4, 0.8);
    board.strokeRoundedRect(W / 2 - 250, H / 2 - 180, 500, 360, 16);

    // Title
    this.add.text(W / 2, H / 2 - 140, '💼 DETECTIVE HQ', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '26px',
      color: '#FFE66D',
    }).setOrigin(0.5);

    // Briefing text
    const text = `Aryan, we have reports of business problems at Greenfield School!\n\nRecess ends too quickly, and student complaints are rising. We need you on the ground to investigate, find clues, and identify opportunities.\n\nReady to hunt for problems?`;
    this.add.text(W / 2, H / 2 - 70, text, {
      fontFamily: "'Nunito', sans-serif",
      fontSize: '15px',
      color: '#A8B2D8',
      align: 'center',
      wordWrap: { width: 420 },
    }).setOrigin(0.5, 0);

    // Go Button
    const goBtnBg = this.add.graphics();
    goBtnBg.fillStyle(0xFF6B35, 1);
    goBtnBg.fillRoundedRect(W / 2 - 100, H / 2 + 100, 200, 44, 10);
    
    const goBtnText = this.add.text(W / 2, H / 2 + 122, 'START INVESTIGATION', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '14px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    // Make interactive
    const hitArea = new Phaser.Geom.Rectangle(W / 2 - 100, H / 2 + 100, 200, 44);
    goBtnText.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    
    goBtnText.on('pointerover', () => {
      this.input.setDefaultCursor('pointer');
      goBtnBg.clear();
      goBtnBg.fillStyle(0xFF8C42, 1);
      goBtnBg.fillRoundedRect(W / 2 - 100, H / 2 + 100, 200, 44, 10);
    });

    goBtnText.on('pointerout', () => {
      this.input.setDefaultCursor('default');
      goBtnBg.clear();
      goBtnBg.fillStyle(0xFF6B35, 1);
      goBtnBg.fillRoundedRect(W / 2 - 100, H / 2 + 100, 200, 44, 10);
    });

    goBtnText.on('pointerdown', () => {
      this.input.setDefaultCursor('default');
      this.scene.start('SchoolInvestigation');
    });
  }
}

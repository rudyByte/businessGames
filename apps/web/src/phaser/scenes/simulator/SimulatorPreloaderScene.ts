// apps/web/src/phaser/scenes/simulator/SimulatorPreloaderScene.ts
import Phaser from 'phaser';

export class SimulatorPreloaderScene extends Phaser.Scene {
  constructor() {
    super('SimulatorPreloader');
  }

  preload() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0D0D1A, 1);
    bg.fillRect(0, 0, W, H);

    // Title
    this.add.text(W / 2, H / 2 - 80, 'STARTING SIMULATOR...', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '28px',
      color: '#FF6B35',
    }).setOrigin(0.5);

    // Loading bar outline
    const outline = this.add.graphics();
    outline.lineStyle(2, 0xFF6B35, 0.5);
    outline.strokeRoundedRect(W / 2 - 150, H / 2 - 15, 300, 30, 8);

    // Loading bar fill
    const progress = this.add.graphics();

    this.load.on('progress', (value: number) => {
      progress.clear();
      progress.fillStyle(0x4ECDC4, 1);
      progress.fillRoundedRect(W / 2 - 146, H / 2 - 11, 292 * value, 22, 6);
    });

    this.load.on('complete', () => {
      progress.destroy();
      outline.destroy();
    });

    // Audio
    this.load.audio('cash-register', '/sounds/coin.mp3');
  }

  create() {
    this.generateCharacterSprites();
    this.scene.start('StartupName');
  }

  private generateCharacterSprites() {
    // Generate simple customer textures
    const colors = [0xFF6B35, 0x4ECDC4, 0xFFE66D, 0x8B5CF6, 0x10B981];
    colors.forEach((c, idx) => {
      const graphics = this.make.graphics({ x: 0, y: 0 }, false);
      graphics.fillStyle(0x000000, 0.2);
      graphics.fillEllipse(16, 44, 12, 3); // shadow

      graphics.fillStyle(c, 1); // shirt
      graphics.fillRect(8, 20, 16, 20); // body

      graphics.fillStyle(0xFFD3B6, 1); // skin
      graphics.fillCircle(16, 12, 7);

      graphics.generateTexture(`customer_${idx}`, 32, 48);
      graphics.destroy();
    });
  }
}

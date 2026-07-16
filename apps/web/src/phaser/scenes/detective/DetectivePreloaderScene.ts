// apps/web/src/phaser/scenes/detective/DetectivePreloaderScene.ts
import Phaser from 'phaser';

export class DetectivePreloaderScene extends Phaser.Scene {
  constructor() {
    super('DetectivePreloader');
  }

  preload() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0D0D1A, 1);
    bg.fillRect(0, 0, W, H);

    // Title
    this.add.text(W / 2, H / 2 - 80, 'PREPARING INVESTIGATION...', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '28px',
      color: '#4ECDC4',
    }).setOrigin(0.5);

    // Loading bar outline
    const outline = this.add.graphics();
    outline.lineStyle(2, 0x4ECDC4, 0.5);
    outline.strokeRoundedRect(W / 2 - 150, H / 2 - 15, 300, 30, 8);

    // Loading bar fill
    const progress = this.add.graphics();

    this.load.on('progress', (value: number) => {
      progress.clear();
      progress.fillStyle(0xFF6B35, 1);
      progress.fillRoundedRect(W / 2 - 146, H / 2 - 11, 292 * value, 22, 6);
    });

    this.load.on('complete', () => {
      progress.destroy();
      outline.destroy();
    });

    // Sound preloading (we use fallback graphics for images, so we only load actual audio if they exist)
    // In local development, we fallback if file is missing.
    this.load.audio('clue-found', '/sounds/success.mp3');
  }

  create() {
    this.generateCharacterSprites();
    this.generateEnvironmentTextures();
    this.scene.start('DetectiveHQ');
  }

  private generateCharacterSprites() {
    // Generate 'kabir' spritesheet programmatically
    const createFrame = (color: number, angle: number) => {
      const graphics = this.make.graphics({ x: 0, y: 0 }, false);
      graphics.fillStyle(0x000000, 0.3);
      graphics.fillEllipse(24, 58, 16, 4); // shadow

      graphics.fillStyle(0xFF6B35, 1); // shirt
      graphics.fillRect(16, 26, 16, 20); // body

      graphics.fillStyle(0x222222, 1); // pants
      graphics.fillRect(16, 46, 16, 10);

      // head
      graphics.fillStyle(0xFFD3B6, 1);
      graphics.fillCircle(24, 16, 10);

      // cap
      graphics.fillStyle(color, 1);
      graphics.fillRect(12, 4, 24, 6);
      graphics.fillRect(16, 0, 16, 6);

      // eyes/face rotation or details
      graphics.fillStyle(0x111111, 1);
      graphics.fillRect(20 + angle, 12, 3, 3);
      graphics.fillRect(26 + angle, 12, 3, 3);

      return graphics;
    };

    // Kabir frames: 0 (idle), 1 (walk L), 2 (walk R)
    const f0 = createFrame(0x4ECDC4, 0);
    const f1 = createFrame(0x4ECDC4, -2);
    const f2 = createFrame(0x4ECDC4, 2);

    f0.generateTexture('kabir_idle', 48, 64);
    f1.generateTexture('kabir_walk_l', 48, 64);
    f2.generateTexture('kabir_walk_r', 48, 64);

    f0.destroy();
    f1.destroy();
    f2.destroy();

    // NPC 1 (Teacher)
    const npc1 = this.make.graphics({ x: 0, y: 0 }, false);
    npc1.fillStyle(0x8B5CF6, 1);
    npc1.fillRect(16, 26, 16, 30);
    npc1.fillStyle(0xFFD3B6, 1);
    npc1.fillCircle(24, 16, 10);
    npc1.generateTexture('npc_teacher', 48, 64);
    npc1.destroy();

    // NPC 2 (Student)
    const npc2 = this.make.graphics({ x: 0, y: 0 }, false);
    npc2.fillStyle(0x10B981, 1);
    npc2.fillRect(16, 26, 16, 30);
    npc2.fillStyle(0xFFD3B6, 1);
    npc2.fillCircle(24, 16, 10);
    npc2.generateTexture('npc_student', 48, 64);
    npc2.destroy();

    // NPC 3 (Vendor)
    const npc3 = this.make.graphics({ x: 0, y: 0 }, false);
    npc3.fillStyle(0xF59E0B, 1);
    npc3.fillRect(16, 22, 16, 34);
    npc3.fillStyle(0xFFD3B6, 1);
    npc3.fillCircle(24, 14, 9);
    npc3.generateTexture('npc_vendor', 48, 64);
    npc3.destroy();
  }

  private generateEnvironmentTextures() {
    // Generate particle texture
    const p = this.make.graphics({ x: 0, y: 0 }, false);
    p.fillStyle(0xFFFFFF, 1);
    p.fillCircle(4, 4, 4);
    p.generateTexture('particle', 8, 8);
    p.destroy();
  }
}

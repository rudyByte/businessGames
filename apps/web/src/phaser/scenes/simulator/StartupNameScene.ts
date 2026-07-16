// apps/web/src/phaser/scenes/simulator/StartupNameScene.ts
import Phaser from 'phaser';
import { EventBridge, PHASER_EVENTS } from '../../EventBridge';

export class StartupNameScene extends Phaser.Scene {
  private finalizedName = '';
  private selectedIndustry = 'food';
  private chosenColor = '#4ECDC4';

  constructor() {
    super('StartupName');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0D0D1A, 0x0D0D1A, 0x1A1A2E, 0x1A1A2E, 1);
    bg.fillRect(0, 0, W, H);

    // Title
    this.add.text(W / 2, 40, '🎨 CREATE YOUR BRAND', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '28px',
      color: '#FF6B35',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(W / 2, 80, 'Choose a name for your new Business Startup!', {
      fontFamily: "'Nunito', sans-serif",
      fontSize: '15px',
      color: '#A8B2D8',
    }).setOrigin(0.5);

    // Simple interactive options to select name parts (action + noun + go)
    const options = [
      { text: 'Speedy Tiffin Go', name: 'Speedy Tiffin Go' },
      { text: 'Smart Byte Express', name: 'Smart Byte Express' },
      { text: 'Fresh Pack India', name: 'Fresh Pack India' },
      { text: 'Super Route Now', name: 'Super Route Now' },
    ];

    options.forEach((opt, idx) => {
      const cy = H / 2 - 60 + idx * 60;
      
      const btnBg = this.add.graphics();
      btnBg.fillStyle(0x16213E, 0.9);
      btnBg.fillRoundedRect(W / 2 - 150, cy - 22, 300, 44, 10);
      btnBg.lineStyle(1, 0x4ECDC4, 0.4);
      btnBg.strokeRoundedRect(W / 2 - 150, cy - 22, 300, 44, 10);

      const btnText = this.add.text(W / 2, cy, opt.text, {
        fontFamily: "'Fredoka One', cursive",
        fontSize: '15px',
        color: '#FFFFFF',
      }).setOrigin(0.5);

      const hitArea = new Phaser.Geom.Rectangle(W / 2 - 150, cy - 22, 300, 44);
      btnText.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

      btnText.on('pointerover', () => {
        this.input.setDefaultCursor('pointer');
        btnBg.clear();
        btnBg.fillStyle(0x1E2A4A, 0.9);
        btnBg.fillRoundedRect(W / 2 - 150, cy - 22, 300, 44, 10);
        btnBg.lineStyle(2, 0xFF6B35, 0.8);
        btnBg.strokeRoundedRect(W / 2 - 150, cy - 22, 300, 44, 10);
      });

      btnText.on('pointerout', () => {
        this.input.setDefaultCursor('default');
        btnBg.clear();
        btnBg.fillStyle(0x16213E, 0.9);
        btnBg.fillRoundedRect(W / 2 - 150, cy - 22, 300, 44, 10);
        btnBg.lineStyle(1, 0x4ECDC4, 0.4);
        btnBg.strokeRoundedRect(W / 2 - 150, cy - 22, 300, 44, 10);
      });

      btnText.on('pointerdown', () => {
        this.finalizedName = opt.name;
        this.handleBrandReveal();
      });
    });
  }

  private handleBrandReveal() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Clear old screen elements
    this.children.removeAll();

    // Large brand reveal display
    this.add.text(W / 2, H / 2 - 100, '✨ YOUR BRAND IS BORN! ✨', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '32px',
      color: '#FFE66D',
    }).setOrigin(0.5);

    const nameText = this.add.text(W / 2, H / 2 - 20, this.finalizedName.toUpperCase(), {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '44px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: nameText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Confetti/particles
    const particles = this.add.particles(W / 2, H / 2, 'particle', {
      speed: { min: 80, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      lifespan: 1200,
      quantity: 50,
    });
    this.time.delayedCall(1200, () => particles.destroy());

    // Next step button
    const nextBtnBg = this.add.graphics();
    nextBtnBg.fillStyle(0xFF6B35, 1);
    nextBtnBg.fillRoundedRect(W / 2 - 100, H / 2 + 100, 200, 44, 10);
    
    const nextBtnText = this.add.text(W / 2, H / 2 + 122, 'ENTER SIMULATOR HQ', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '14px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    const hit = new Phaser.Geom.Rectangle(W / 2 - 100, H / 2 + 100, 200, 44);
    nextBtnText.setInteractive(hit, Phaser.Geom.Rectangle.Contains);

    nextBtnText.on('pointerover', () => this.input.setDefaultCursor('pointer'));
    nextBtnText.on('pointerout', () => this.input.setDefaultCursor('default'));
    nextBtnText.on('pointerdown', () => {
      this.input.setDefaultCursor('default');
      
      // Save name to localStorage/Store state
      localStorage.setItem('campusedge_startup_name', this.finalizedName);
      
      // Award XP
      EventBridge.emit(PHASER_EVENTS.XP_EARNED, { amount: 200 });

      // Start HQ
      this.scene.start('SimulatorHQ');
    });
  }
}

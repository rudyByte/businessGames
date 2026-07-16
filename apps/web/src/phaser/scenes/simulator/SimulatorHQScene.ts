// apps/web/src/phaser/scenes/simulator/SimulatorHQScene.ts
import Phaser from 'phaser';

export class SimulatorHQScene extends Phaser.Scene {
  private currentWeek = 1;
  private currentCash = 50000;
  private startupName = 'Speedy Tiffin';

  private priceSliderVal = 50;
  private marketingSliderVal = 1000;

  constructor() {
    super('SimulatorHQ');
  }

  init() {
    const name = localStorage.getItem('campusedge_startup_name');
    if (name) this.startupName = name;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0D0D1A, 0x0D0D1A, 0x1A1A2E, 0x1A1A2E, 1);
    bg.fillRect(0, 0, W, H);

    // Board panel
    const board = this.add.graphics();
    board.fillStyle(0x16213E, 0.95);
    board.fillRoundedRect(50, 50, W - 100, H - 100, 16);
    board.lineStyle(2, 0xFF6B35, 0.8);
    board.strokeRoundedRect(50, 50, W - 100, H - 100, 16);

    // Title / HUD
    this.add.text(W / 2, 80, `💼 ${this.startupName.toUpperCase()} HQ`, {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '26px',
      color: '#FFE66D',
    }).setOrigin(0.5);

    // Week indicator
    this.add.text(W / 2, 120, `WEEK ${this.currentWeek} OF 12`, {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '14px',
      color: '#4ECDC4',
    }).setOrigin(0.5);

    // Cash sign
    this.add.text(100, 100, `💰 Cash: ₹${this.currentCash.toLocaleString()}`, {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '16px',
      color: '#FFE66D',
    });

    // STRATEGY BOARD SECTION
    this.add.text(150, 180, '📈 STRATEGY BOARD', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '18px',
      color: '#FFFFFF',
    });

    // Price Slider UI
    this.add.text(150, 240, 'Price per unit: ₹', {
      fontFamily: "'Nunito', sans-serif",
      fontSize: '14px',
      color: '#A8B2D8',
    });
    const priceText = this.add.text(280, 240, `${this.priceSliderVal}`, {
      fontFamily: "'Orbitron', monospace",
      fontSize: '14px',
      color: '#FFE66D',
    });

    // Marketing Slider UI
    this.add.text(150, 320, 'Marketing budget: ₹', {
      fontFamily: "'Nunito', sans-serif",
      fontSize: '14px',
      color: '#A8B2D8',
    });
    const marketingText = this.add.text(320, 320, `${this.marketingSliderVal}`, {
      fontFamily: "'Orbitron', monospace",
      fontSize: '14px',
      color: '#FFE66D',
    });

    // Simple interaction to increase/decrease price
    this.createValueSelector(350, 240, () => {
      this.priceSliderVal = Math.max(10, this.priceSliderVal - 5);
      priceText.setText(`${this.priceSliderVal}`);
    }, () => {
      this.priceSliderVal = Math.min(200, this.priceSliderVal + 5);
      priceText.setText(`${this.priceSliderVal}`);
    });

    // Simple selector for marketing
    this.createValueSelector(380, 320, () => {
      this.marketingSliderVal = Math.max(0, this.marketingSliderVal - 500);
      marketingText.setText(`${this.marketingSliderVal}`);
    }, () => {
      this.marketingSliderVal = Math.min(10000, this.marketingSliderVal + 500);
      marketingText.setText(`${this.marketingSliderVal}`);
    });

    // START THE DAY BUTTON
    const startBtnBg = this.add.graphics();
    startBtnBg.fillStyle(0x06D6A0, 1);
    startBtnBg.fillRoundedRect(W / 2 - 120, H - 120, 240, 48, 12);
    
    const startBtnText = this.add.text(W / 2, H - 96, 'START WEEK BUSINESS ▶️', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '14px',
      color: '#0D0D1A',
    }).setOrigin(0.5);

    const hit = new Phaser.Geom.Rectangle(W / 2 - 120, H - 120, 240, 48);
    startBtnText.setInteractive(hit, Phaser.Geom.Rectangle.Contains);

    startBtnText.on('pointerover', () => this.input.setDefaultCursor('pointer'));
    startBtnText.on('pointerout', () => this.input.setDefaultCursor('default'));
    
    startBtnText.on('pointerdown', () => {
      this.input.setDefaultCursor('default');
      // Save strategy values
      localStorage.setItem('campusedge_price', this.priceSliderVal.toString());
      localStorage.setItem('campusedge_marketing', this.marketingSliderVal.toString());
      this.scene.start('BusinessDay');
    });
  }

  private createValueSelector(x: number, y: number, onDec: () => void, onInc: () => void) {
    // Dec button (-)
    const decText = this.add.text(x, y, '[-]', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '18px',
      color: '#4ECDC4',
    }).setOrigin(0.5);

    decText.setInteractive();
    decText.on('pointerover', () => this.input.setDefaultCursor('pointer'));
    decText.on('pointerout', () => this.input.setDefaultCursor('default'));
    decText.on('pointerdown', onDec);

    // Inc button (+)
    const incText = this.add.text(x + 50, y, '[+]', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '18px',
      color: '#4ECDC4',
    }).setOrigin(0.5);

    incText.setInteractive();
    incText.on('pointerover', () => this.input.setDefaultCursor('pointer'));
    incText.on('pointerout', () => this.input.setDefaultCursor('default'));
    incText.on('pointerdown', onInc);
  }
}

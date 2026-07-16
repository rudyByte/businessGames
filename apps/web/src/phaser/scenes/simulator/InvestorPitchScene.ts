// apps/web/src/phaser/scenes/simulator/InvestorPitchScene.ts
import Phaser from 'phaser';
import { EventBridge, PHASER_EVENTS } from '../../EventBridge';

export class InvestorPitchScene extends Phaser.Scene {
  private finalOffer = 250000;
  private grade = 'A';

  constructor() {
    super('InvestorPitch');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Boardroom bg
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f0c1b, 0x0f0c1b, 0x1d1b33, 0x1d1b33, 1);
    bg.fillRect(0, 0, W, H);

    // Spotlight graphic
    const spotlight = this.add.graphics();
    spotlight.fillStyle(0xFFFFFF, 0.08);
    spotlight.fillTriangle(W / 2, 0, W / 2 - 150, H, W / 2 + 150, H);

    // Title
    this.add.text(W / 2, 60, '🦈 THE INVESTOR BOARDROOM', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '28px',
      color: '#FFE66D',
    }).setOrigin(0.5);

    // Slide: Pitch Showcase
    this.add.text(W / 2, 140, 'YOUR STARTUP SUMMARY PITCH', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '16px',
      color: '#4ECDC4',
    }).setOrigin(0.5);

    // Details box
    const card = this.add.graphics();
    card.fillStyle(0x16213E, 0.9);
    card.fillRoundedRect(W / 2 - 200, 180, 400, 220, 12);
    card.lineStyle(1, 0x4ECDC4, 0.5);
    card.strokeRoundedRect(W / 2 - 200, 180, 400, 220, 12);

    this.add.text(W / 2, 220, 'Pitch Slides:', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '14px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    const pitchDetails = [
      '✓ Problem: Canteen queues and hunger solved',
      '✓ Solution: Digital booking mobile concept',
      '✓ Growth: 100+ weekly organic customers served',
      '✓ Finance: Stable cost structure & profit margin',
    ];

    pitchDetails.forEach((text, i) => {
      this.add.text(W / 2 - 160, 260 + i * 30, text, {
        fontFamily: "'Nunito', sans-serif",
        fontSize: '13px',
        color: '#A8B2D8',
      });
    });

    // Pitch evaluation grade
    this.add.text(W / 2, H - 180, 'FINAL RATING: A GRADE 🏆', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '20px',
      color: '#FFE66D',
    }).setOrigin(0.5);

    // Offer text
    this.add.text(W / 2, H - 150, `Offer: ₹${this.finalOffer.toLocaleString()} Seed Investment!`, {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '15px',
      color: '#06D6A0',
    }).setOrigin(0.5);

    // Finish Button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xFF6B35, 1);
    btnBg.fillRoundedRect(W / 2 - 100, H - 100, 200, 44, 10);
    
    const btnText = this.add.text(W / 2, H - 78, 'FINISH & SHARE 🚀', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '14px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    const hit = new Phaser.Geom.Rectangle(W / 2 - 100, H - 100, 200, 44);
    btnText.setInteractive(hit, Phaser.Geom.Rectangle.Contains);

    btnText.on('pointerover', () => this.input.setDefaultCursor('pointer'));
    btnText.on('pointerout', () => this.input.setDefaultCursor('default'));
    btnText.on('pointerdown', () => {
      this.input.setDefaultCursor('default');
      
      // Award XP
      EventBridge.emit(PHASER_EVENTS.XP_EARNED, { amount: 500 });
      EventBridge.emit(PHASER_EVENTS.SCENE_COMPLETE, {
        scene: 'investor_pitch',
        grade: this.grade,
        offer: this.finalOffer,
      });
    });
  }
}

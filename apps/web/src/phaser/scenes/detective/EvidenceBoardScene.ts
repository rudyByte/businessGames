// apps/web/src/phaser/scenes/detective/EvidenceBoardScene.ts
import Phaser from 'phaser';
import { EventBridge, PHASER_EVENTS } from '../../EventBridge';

interface EvidenceCard {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  impact: number; // 1-5
  urgency: number; // 1-5
  feasibility: number; // 1-5
  x: number;
  y: number;
}

export class EvidenceBoardScene extends Phaser.Scene {
  private cards: EvidenceCard[] = [
    { id: 'canteen', emoji: '🍱', title: 'Canteen Queues', desc: 'Long waits, hungry students, wasted food.', impact: 5, urgency: 5, feasibility: 4, x: 180, y: 150 },
    { id: 'cooler', emoji: '💧', title: 'Broken Cooler', desc: 'Students are thirsty in extreme heat.', impact: 4, urgency: 5, feasibility: 3, x: 180, y: 320 },
    { id: 'notice', emoji: '📋', title: 'Notice Board', desc: 'Boring layout, students miss announcements.', impact: 3, urgency: 3, feasibility: 5, x: 180, y: 490 },
  ];

  private dragTargets: Map<string, Phaser.GameObjects.Container> = new Map();
  private placements: Record<string, string> = {}; // cardId -> 'big' | 'medium' | 'small'

  constructor() {
    super('EvidenceBoard');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Wood/cork board background
    const bg = this.add.graphics();
    bg.fillStyle(0x8B6914, 1);
    bg.fillRect(0, 0, W, H);

    // Cork panel
    bg.fillStyle(0xA0885A, 1);
    bg.fillRoundedRect(40, 40, W - 80, H - 80, 16);
    bg.lineStyle(4, 0x5C4033, 1);
    bg.strokeRoundedRect(40, 40, W - 80, H - 80, 16);

    // Columns on the right side
    this.createColumns(W, H);

    // Title
    this.add.text(W / 2, 25, '🕵️ OPPORTUNITY EVIDENCE BOARD', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '22px',
      color: '#0D0D1A',
    }).setOrigin(0.5);

    // Render Draggable Cards
    this.createCards();

    // Submit button
    const submitBtn = this.add.container(W - 160, H - 70);
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xFF6B35, 1);
    btnBg.fillRoundedRect(-100, -22, 200, 44, 10);
    
    const btnText = this.add.text(0, 0, 'ANALYZE & SUBMIT', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '14px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    submitBtn.add([btnBg, btnText]);

    const hit = new Phaser.Geom.Rectangle(-100, -22, 200, 44);
    btnText.setInteractive(hit, Phaser.Geom.Rectangle.Contains);
    
    btnText.on('pointerover', () => this.input.setDefaultCursor('pointer'));
    btnText.on('pointerout', () => this.input.setDefaultCursor('default'));
    btnText.on('pointerdown', () => this.handleSubmit());

    // Drag-and-drop setup
    this.setupDragEvents();
  }

  private createColumns(W: number, H: number) {
    const colWidth = 240;
    const colHeight = H - 240;
    const startX = W - colWidth * 3 - 60;
    const startY = 100;

    const columnTypes = [
      { key: 'big', label: '🔴 BIG PROBLEM', color: 0xEF476F },
      { key: 'medium', label: '🟡 MEDIUM PROBLEM', color: 0xFFE66D },
      { key: 'small', label: '🟢 SMALL PROBLEM', color: 0x06D6A0 },
    ];

    columnTypes.forEach((col, i) => {
      const cx = startX + i * (colWidth + 20);

      // Label background
      const labelBg = this.add.graphics();
      labelBg.fillStyle(col.color, 1);
      labelBg.fillRoundedRect(cx, startY, colWidth, 40, 8);

      this.add.text(cx + colWidth / 2, startY + 20, col.label, {
        fontFamily: "'Fredoka One', cursive",
        fontSize: '13px',
        color: '#0D0D1A',
      }).setOrigin(0.5);

      // Drop Zone
      const zoneBg = this.add.graphics();
      zoneBg.fillStyle(0x0D0D1A, 0.15);
      zoneBg.fillRoundedRect(cx, startY + 50, colWidth, colHeight, 10);
      zoneBg.lineStyle(2, col.color, 0.4);
      zoneBg.strokeRoundedRect(cx, startY + 50, colWidth, colHeight, 10);
    });
  }

  private createCards() {
    this.cards.forEach(card => {
      const container = this.add.container(card.x, card.y);
      const cw = 200;
      const ch = 130;

      // Manila folder color card
      const cbg = this.add.graphics();
      cbg.fillStyle(0xFFFFFF, 0.95);
      cbg.fillRoundedRect(-cw / 2, -ch / 2, cw, ch, 8);
      cbg.lineStyle(1, 0x5C4033, 0.2);
      cbg.strokeRoundedRect(-cw / 2, -ch / 2, cw, ch, 8);

      // Emoji/Title
      const cIcon = this.add.text(-cw / 2 + 15, -ch / 2 + 15, card.emoji, { fontSize: '20px' });
      const cTitle = this.add.text(-cw / 2 + 45, -ch / 2 + 17, card.title, {
        fontFamily: "'Fredoka One', cursive",
        fontSize: '12px',
        color: '#1A1A2E',
      });

      // Description text
      const cDesc = this.add.text(-cw / 2 + 15, -ch / 2 + 50, card.desc, {
        fontFamily: "'Nunito', sans-serif",
        fontSize: '10px',
        color: '#6B7A9B',
        wordWrap: { width: cw - 30 },
      });

      // Slight rotation
      container.setAngle(Phaser.Math.Between(-3, 3));
      container.add([cbg, cIcon, cTitle, cDesc]);

      // Interactive drag
      container.setInteractive(new Phaser.Geom.Rectangle(-cw / 2, -ch / 2, cw, ch), Phaser.Geom.Rectangle.Contains);
      this.input.setDraggable(container);

      // Keep ID reference
      container.setData('id', card.id);
      this.dragTargets.set(card.id, container);
    });
  }

  private setupDragEvents() {
    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container) => {
      gameObject.setScale(1.05);
      gameObject.setDepth(100);
      this.sound.play('clue-found', { volume: 0.2 });
    });

    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container, dragX: number, dragY: number) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container) => {
      gameObject.setScale(1);
      gameObject.setDepth(0);

      // Evaluate snaps to columns
      const W = this.scale.width;
      const H = this.scale.height;
      const colWidth = 240;
      const startX = W - colWidth * 3 - 60;
      const startY = 100;

      const cardId = gameObject.getData('id');
      let snapped = false;

      for (let i = 0; i < 3; i++) {
        const cx = startX + i * (colWidth + 20);
        const colCenter = cx + colWidth / 2;

        if (Math.abs(gameObject.x - colCenter) < 140 && gameObject.y > startY && gameObject.y < H - 100) {
          const colKeys = ['big', 'medium', 'small'];
          this.placements[cardId] = colKeys[i];
          
          // Snap position
          this.tweens.add({
            targets: gameObject,
            x: colCenter,
            angle: 0,
            duration: 100,
            ease: 'Quad.easeOut',
          });
          snapped = true;
          break;
        }
      }

      if (!snapped) {
        delete this.placements[cardId];
      }
    });
  }

  private handleSubmit() {
    // Basic completion check
    const answeredCount = Object.keys(this.placements).length;
    if (answeredCount < this.cards.length) {
      alert('Drag all evidence cards into a priority column before submitting!');
      return;
    }

    // Award XP and complete
    EventBridge.emit(PHASER_EVENTS.XP_EARNED, { amount: 150 });
    EventBridge.emit(PHASER_EVENTS.SCENE_COMPLETE, {
      scene: 'evidence_board',
      placements: this.placements,
    });
  }
}

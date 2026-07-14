// apps/web/src/phaser/scenes/detective/SchoolInvestigationScene.ts
import Phaser from 'phaser';
import { EventBridge, PHASER_EVENTS, REACT_EVENTS } from '../../EventBridge';

interface Clue {
  id: string;
  x: number;
  y: number;
  label: string;
  description: string;
  type: 'visual' | 'npc' | 'object';
  xp: number;
  problemLink: string;
  discovered: boolean;
}

export class SchoolInvestigationScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
  };
  private groundY = 560;
  private sceneWidth = 3000;

  private clues: Clue[] = [
    { id: 'canteen_queue', x: 1100, y: 560 - 60, label: '🍱 Canteen Queue', description: 'Recess ends before half the students get served hot food. Long queues!', type: 'visual', xp: 30, problemLink: 'canteen_queue', discovered: false },
    { id: 'water_cooler', x: 2650, y: 560 - 60, label: '💧 Water Cooler', description: 'The water cooler is completely empty and dry during the hot summer.', type: 'object', xp: 30, problemLink: 'water_cooler', discovered: false },
    { id: 'notice_board', x: 320, y: 560 - 100, label: '📋 Notice Board', description: 'Paper notices are cluttered and boring. Students do not read them.', type: 'object', xp: 25, problemLink: 'notice_board', discovered: false },
    { id: 'parking_pickup', x: 150, y: 560 - 40, label: '🚗 School Gate Parking', description: 'Chaotic vehicle layouts. Traffic jam during pickup hours.', type: 'visual', xp: 25, problemLink: 'parking_pickup', discovered: false },
    { id: 'library_books', x: 2200, y: 560 - 80, label: '📚 Library chaos', description: 'Finding a book takes 20 minutes because items are unorganized.', type: 'object', xp: 30, problemLink: 'lost_found', discovered: false },
    { id: 'lost_found', x: 750, y: 560 - 60, label: '📦 Lost & Found Box', description: 'Overflowing box. Nobody knows how to retrieve lost water bottles or books.', type: 'object', xp: 25, problemLink: 'lost_found', discovered: false },
  ];

  private npcDefinitions = [
    { key: 'npc_teacher', x: 650, name: 'Ms. Krishnamurthy', greeting: 'Oh! A young detective? How exciting!' },
    { key: 'npc_student', x: 1150, name: 'Riya (Class 8B)', greeting: 'Yaar, the canteen runs out of food every single day!' },
    { key: 'npc_vendor', x: 1050, name: 'Canteen Uncle', greeting: 'So much waste! Half my food stays unsold...' },
  ];

  private markers: Map<string, Phaser.GameObjects.Container> = new Map();
  private nearbyNPC: any = null;
  private interactionPrompt!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;

  private lastClueTime = 0;
  private comboCount = 0;
  private timeElapsed = 0;
  private timerEvent!: Phaser.Time.TimerEvent;

  constructor() {
    super('SchoolInvestigation');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Reset states
    this.clues.forEach(c => c.discovered = false);
    this.nearbyNPC = null;
    this.lastClueTime = 0;
    this.comboCount = 0;
    this.timeElapsed = 0;

    // Create World Layers
    this.createBackgroundLayers(H);
    this.createSchoolBuildings();
    this.createGround(W, H);
    this.createHotspots();
    this.createNPCs();
    this.createPlayer();
    this.setupControls();
    this.createHUD(W);

    // EventBridge Listeners
    EventBridge.on(REACT_EVENTS.RESUME_GAME, this.handleResumeGame, this);

    // Camera
    this.cameras.main.setBounds(0, 0, this.sceneWidth, H);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Scene timer
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.timeElapsed++,
    });
  }

  private handleResumeGame() {
    this.scene.resume();
  }

  private createBackgroundLayers(H: number) {
    // Sky
    const sky = this.add.graphics().setScrollFactor(0);
    sky.fillGradientStyle(0x0D0D1A, 0x0D0D1A, 0x1A1A2E, 0x1A1A2E, 1);
    sky.fillRect(0, 0, this.scale.width, H);

    // Distant hills/skyline (parallax)
    const skyline = this.add.graphics().setScrollFactor(0.2);
    skyline.fillStyle(0x0A0F2C, 0.5);
    for (let x = 0; x < this.sceneWidth; x += 300) {
      skyline.fillRect(x, H - 280, 240, 180);
    }
  }

  private createSchoolBuildings() {
    // Greenfield School main building
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1E2A38, 1);
    graphics.fillRect(400, 200, 500, 360);

    // Roof
    graphics.fillStyle(0xFF6B35, 1);
    graphics.fillRect(380, 180, 540, 20);

    // Windows
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        graphics.fillStyle(0xFFE66D, 0.8);
        graphics.fillRect(430 + col * 115, 230 + row * 90, 48, 56);
      }
    }

    // Sign
    this.add.rectangle(650, 510, 240, 44, 0x4ECDC4);
    this.add.text(650, 510, 'GREENFIELD SCHOOL', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '15px',
      color: '#0D0D1A',
    }).setOrigin(0.5);
  }

  private createGround(W: number, H: number) {
    const ground = this.add.graphics();
    ground.fillStyle(0x0D2818, 1);
    ground.fillRect(0, this.groundY, this.sceneWidth, H - this.groundY);

    // Grass border
    ground.fillStyle(0x1A4A2E, 1);
    ground.fillRect(0, this.groundY, this.sceneWidth, 8);
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(200, this.groundY - 32, 'kabir_idle');
    this.player.setCollideWorldBounds(true);
    this.player.setScale(1.2);
  }

  private setupControls() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D,E') as any;
  }

  private createHotspots() {
    this.clues.forEach(clue => {
      // Glow marker
      const markerBg = this.add.graphics();
      markerBg.fillStyle(0x4ECDC4, 0.4);
      markerBg.fillCircle(0, 0, 22);

      const markerInner = this.add.graphics();
      markerInner.fillStyle(0x4ECDC4, 1);
      markerInner.fillCircle(0, 0, 14);

      const markerText = this.add.text(0, -1, '?', {
        fontFamily: "'Fredoka One', cursive",
        fontSize: '16px',
        color: '#FFFFFF',
      }).setOrigin(0.5);

      const container = this.add.container(clue.x, clue.y, [markerBg, markerInner, markerText]);

      this.tweens.add({
        targets: container,
        y: clue.y - 12,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.tweens.add({
        targets: markerBg,
        alpha: 0.1,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 1200,
        repeat: -1,
      });

      // Interactive
      container.setInteractive(new Phaser.Geom.Circle(0, 0, 24), Phaser.Geom.Circle.Contains);
      container.on('pointerover', () => this.input.setDefaultCursor('pointer'));
      container.on('pointerout', () => this.input.setDefaultCursor('default'));
      container.on('pointerdown', () => this.discoverClue(clue));

      this.markers.set(clue.id, container);
    });
  }

  private createNPCs() {
    this.npcDefinitions.forEach(npc => {
      const sprite = this.add.sprite(npc.x, this.groundY - 32, npc.key).setScale(1.2);
      
      // Name tag
      this.add.text(npc.x, this.groundY - 80, npc.name, {
        fontFamily: "'Fredoka One', cursive",
        fontSize: '11px',
        color: '#4ECDC4',
        backgroundColor: '#16213E',
        padding: { x: 6, y: 3 },
      }).setOrigin(0.5);

      // Bubble
      const bubble = this.add.text(npc.x, this.groundY - 110, '💬', { fontSize: '20px' }).setOrigin(0.5);
      this.tweens.add({
        targets: bubble,
        y: this.groundY - 118,
        duration: 1400,
        yoyo: true,
        repeat: -1,
      });
    });
  }

  private createHUD(W: number) {
    // Interaction Prompt
    this.interactionPrompt = this.add.text(W / 2, this.groundY - 150, '', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '16px',
      color: '#FFE66D',
      backgroundColor: '#16213E',
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setScrollFactor(0).setVisible(false);

    // Objective HUD
    const hudBg = this.add.graphics().setScrollFactor(0);
    hudBg.fillStyle(0x0D0D1A, 0.85);
    hudBg.fillRoundedRect(W / 2 - 180, 16, 360, 48, 10);
    hudBg.lineStyle(1, 0x4ECDC4, 0.4);
    hudBg.strokeRoundedRect(W / 2 - 180, 16, 360, 48, 10);

    this.objectiveText = this.add.text(W / 2, 32, '🔍 Clues Found: 0/6', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '14px',
      color: '#FFFFFF',
    }).setOrigin(0.5).setScrollFactor(0);

    this.progressBar = this.add.graphics().setScrollFactor(0);
    this.updateHUD();
  }

  private updateHUD() {
    const found = this.clues.filter(c => c.discovered).length;
    if (this.objectiveText) {
      this.objectiveText.setText(`🔍 Clues Found: ${found}/6`);
    }

    if (this.progressBar) {
      this.progressBar.clear();
      this.progressBar.fillStyle(0x4ECDC4, 1);
      if (found > 0) {
        this.progressBar.fillRoundedRect(this.scale.width / 2 - 160, 48, 320 * (found / 6), 6, 3);
      }
    }
  }

  private discoverClue(clue: Clue) {
    if (clue.discovered) return;
    clue.discovered = true;

    // Remove marker
    const marker = this.markers.get(clue.id);
    if (marker) marker.destroy();

    // Sound
    this.sound.play('clue-found');

    // Particle burst
    this.createClueParticleBurst(clue.x, clue.y);

    // Combo logic
    const now = Date.now();
    const timeSinceLast = now - this.lastClueTime;
    if (timeSinceLast < 15000) {
      this.comboCount++;
      if (this.comboCount >= 2) this.showComboText(this.comboCount);
    } else {
      this.comboCount = 1;
    }
    this.lastClueTime = now;

    // Update HUD
    this.updateHUD();

    // Focus camera
    this.cameras.main.zoomTo(1.2, 200, 'Sine.easeInOut', true);
    this.time.delayedCall(400, () => {
      this.cameras.main.zoomTo(1, 200);
    });

    // Notify React
    EventBridge.emit(PHASER_EVENTS.OPEN_MODAL, {
      type: 'clue_discovered',
      clue: clue,
    });

    // Award XP
    const earnedXP = clue.xp * this.comboCount;
    EventBridge.emit(PHASER_EVENTS.XP_EARNED, { amount: earnedXP });

    this.scene.pause();

    // Check complete
    const found = this.clues.filter(c => c.discovered).length;
    if (found === 6) {
      this.triggerSceneComplete();
    }
  }

  private showComboText(count: number) {
    const colors = ['', '', '#4ECDC4', '#FFE66D', '#FF6B35'];
    const labels = ['', '', 'COMBO x2!', 'HOT STREAK x3!', '🔥 ON FIRE x4!'];
    
    const text = this.add.text(this.player.x, this.player.y - 80, labels[Math.min(count, 4)], {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '24px',
      color: colors[Math.min(count, 4)],
      stroke: '#0D0D1A',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: this.player.y - 140,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 1200,
      onComplete: () => text.destroy(),
    });
  }

  private createClueParticleBurst(x: number, y: number) {
    const emitter = this.add.particles(x, y, 'particle', {
      speed: { min: 60, max: 180 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      lifespan: 800,
      quantity: 20,
    });
    this.time.delayedCall(800, () => emitter.destroy());
  }

  private triggerSceneComplete() {
    this.timerEvent.destroy();
    
    this.time.delayedCall(1000, () => {
      EventBridge.emit(PHASER_EVENTS.SCENE_COMPLETE, {
        scene: 'school',
        cluesFound: 6,
        timeElapsed: this.timeElapsed,
      });
    });
  }

  update() {
    const speed = 250;
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;

    if (left) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(true);
      this.player.setTexture('kabir_walk_l');
    } else if (right) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false);
      this.player.setTexture('kabir_walk_r');
    } else {
      this.player.setVelocityX(0);
      this.player.setTexture('kabir_idle');
    }

    // Proximity checks for NPCs
    let currentNearbyNPC: any = null;
    this.npcDefinitions.forEach(npc => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, this.groundY - 32);
      if (dist < 80) {
        currentNearbyNPC = npc;
      }
    });

    if (currentNearbyNPC) {
      this.nearbyNPC = currentNearbyNPC;
      this.interactionPrompt.setText(`Press E to talk to ${currentNearbyNPC.name}`).setVisible(true);

      if (Phaser.Input.Keyboard.JustDown(this.wasd.E)) {
        this.scene.pause();
        EventBridge.emit(PHASER_EVENTS.OPEN_MODAL, {
          type: 'npc_dialogue',
          npc: currentNearbyNPC,
        });
      }
    } else {
      this.nearbyNPC = null;
      this.interactionPrompt.setVisible(false);
    }
  }

  shutdown() {
    EventBridge.off(REACT_EVENTS.RESUME_GAME, this.handleResumeGame, this);
  }
}

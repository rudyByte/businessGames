// apps/web/src/phaser/scenes/WorldMapScene.ts
import Phaser from 'phaser';
import { EventBridge, PHASER_EVENTS } from '../EventBridge';
import { GAME_THEME } from '../../styles/gameTheme';

interface ZoneConfig {
  id: string;
  x: number;
  label: string;
  sublabel: string;
  locked: boolean;
  stars: number; // 0–3
  color: number;
  glowColor: number;
  icon: string; // emoji label
}

interface PlayerData {
  name: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  unlockedZones: string[];
  starsEarned: Record<string, number>;
}

export class WorldMapScene extends Phaser.Scene {
  private playerData: PlayerData | null = null;
  private playerSprite!: Phaser.GameObjects.Container;
  private playerX = 200;
  private zones: Map<string, Phaser.GameObjects.Container> = new Map();
  private stars: Phaser.GameObjects.Graphics[] = [];
  private chestContainer!: Phaser.GameObjects.Container;
  private chestAvailable = true;
  private isMoving = false;

  constructor() {
    super({ key: 'WorldMapScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.createBackground(W, H);
    this.createGround(W, H);
    this.createPath(W, H);
    this.createZones(H);
    this.createPlayer(H);
    this.createDailyChest(W, H);
    this.createFloatingClouds(W, H);
    this.createBottomNav(W, H);
    this.createHUD(W);

    // Listen for player data from React
    EventBridge.on(PHASER_EVENTS.ZONE_CLICKED, () => {});
    this.events.on('player_data', (data: PlayerData) => {
      this.playerData = data;
      this.updateHUD();
      this.updateZoneLocks();
    });

    this.cameras.main.setBounds(0, 0, Math.max(W, 1600), H);
    this.cameras.main.setZoom(1);

    // Idle timer for player wave
    this.time.addEvent({
      delay: 5000,
      loop: true,
      callback: this.playerIdleAnimation,
      callbackScope: this,
    });
  }

  private createBackground(W: number, H: number) {
    // Deep sky gradient using rectangle graphics
    const sky = this.add.graphics();
    sky.fillGradientStyle(
      GAME_THEME.phaser.skyTop,
      GAME_THEME.phaser.skyTop,
      GAME_THEME.phaser.skyMid,
      GAME_THEME.phaser.skyMid,
      1
    );
    sky.fillRect(0, 0, Math.max(W, 1600), H * 0.75);

    // Moon
    const moon = this.add.graphics();
    moon.fillStyle(0xF5F0E8, 1);
    moon.fillCircle(1480, 80, 45);
    // Moon glow
    const moonGlow = this.add.graphics();
    moonGlow.fillStyle(0xF5F0E8, 0.08);
    moonGlow.fillCircle(1480, 80, 80);

    // Procedural stars
    for (let i = 0; i < 180; i++) {
      const x = Phaser.Math.Between(0, Math.max(W, 1600));
      const y = Phaser.Math.Between(0, H * 0.55);
      const r = Phaser.Math.FloatBetween(0.5, 2.5);
      const star = this.add.graphics();
      star.fillStyle(0xF5F0E8, Phaser.Math.FloatBetween(0.3, 1));
      star.fillCircle(x, y, r);
      this.stars.push(star);

      // Random twinkle
      this.tweens.add({
        targets: star,
        alpha: { from: Phaser.Math.FloatBetween(0.3, 0.7), to: 1 },
        duration: Phaser.Math.Between(1000, 4000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000),
      });
    }

    // City skyline silhouette (parallax)
    const skylineGroup = this.add.group();
    const cityHeights = [60, 90, 45, 110, 70, 85, 50, 100, 65, 80, 95, 55, 75, 100, 60];
    let cityX = 0;
    const groundY = H * 0.75;
    cityHeights.forEach((h, i) => {
      const w = Phaser.Math.Between(60, 120);
      const building = this.add.graphics();
      building.fillStyle(0x0A0F2C, 1);
      building.fillRect(cityX + i * 2, groundY - h, w, h);
      // Random lit windows
      if (Math.random() > 0.4) {
        building.fillStyle(0xFFE66D, 0.4);
        building.fillRect(cityX + i * 2 + 10, groundY - h + 15, 8, 8);
        building.fillRect(cityX + i * 2 + 25, groundY - h + 30, 8, 8);
      }
      cityX += w + Phaser.Math.Between(5, 20);
      skylineGroup.add(building);
    });
    // Subtle parallax on scroll
    this.cameras.main.on('followupdate', () => {
      skylineGroup.getChildren().forEach((b) => {
        (b as Phaser.GameObjects.Graphics).setScrollFactor(0.1);
      });
    });
    skylineGroup.getChildren().forEach((b) => {
      (b as Phaser.GameObjects.Graphics).setScrollFactor(0.1);
    });
  }

  private createGround(W: number, H: number) {
    const groundY = H * 0.75;
    const totalW = Math.max(W, 1600);

    // Dark green ground
    const ground = this.add.graphics();
    ground.fillStyle(GAME_THEME.phaser.ground, 1);
    ground.fillRect(0, groundY, totalW, H - groundY);

    // Lighter grass strip at top of ground
    ground.fillStyle(GAME_THEME.phaser.grassLight, 1);
    ground.fillRect(0, groundY, totalW, 12);

    // Grass tuft details
    for (let gx = 30; gx < totalW; gx += 40) {
      ground.fillStyle(0x1E5C30, 1);
      ground.fillTriangle(gx, groundY, gx + 8, groundY - 10, gx + 16, groundY);
    }
  }

  private createPath(W: number, H: number) {
    const groundY = H * 0.75;
    const totalW = Math.max(W, 1600);
    const pathY = groundY + 20;
    const path = this.add.graphics();

    // Dashed yellow road
    path.lineStyle(4, 0xFFE66D, 0.6);
    for (let px = 0; px < totalW; px += 50) {
      path.beginPath();
      path.moveTo(px, pathY);
      path.lineTo(px + 30, pathY);
      path.strokePath();
    }
  }

  private createZones(H: number) {
    const groundY = H * 0.75;
    const ZONES: ZoneConfig[] = [
      {
        id: 'problem-hunt',
        x: 200,
        label: 'PROBLEM HUNT HQ',
        sublabel: 'Chapters 1–6',
        locked: false,
        stars: 0,
        color: GAME_THEME.phaser.teal,
        glowColor: 0x4ECDC4,
        icon: '🔍',
      },
      {
        id: 'startup-wars',
        x: 550,
        label: 'STARTUP GALAXY',
        sublabel: 'Chapters 7–10',
        locked: true,
        stars: 0,
        color: GAME_THEME.phaser.orange,
        glowColor: 0xFF6B35,
        icon: '🚀',
      },
      {
        id: 'arcade',
        x: 900,
        label: 'MINI GAME ARCADE',
        sublabel: '3 Mini Games',
        locked: true,
        stars: 0,
        color: 0xF59E0B,
        glowColor: 0xF59E0B,
        icon: '🎮',
      },
      {
        id: 'showcase',
        x: 1250,
        label: 'GRAND SHOWCASE',
        sublabel: 'Capstone',
        locked: true,
        stars: 0,
        color: 0x8B5CF6,
        glowColor: 0x8B5CF6,
        icon: '🏆',
      },
    ];

    ZONES.forEach((zone) => {
      const container = this.createZoneBuilding(zone, groundY);
      this.zones.set(zone.id, container);
    });
  }

  private createZoneBuilding(zone: ZoneConfig, groundY: number): Phaser.GameObjects.Container {
    const container = this.add.container(zone.x, groundY);
    const bw = 140;
    const bh = 160;

    // Building body
    const body = this.add.graphics();
    body.fillStyle(zone.locked ? 0x1A1A2E : 0x16213E, 1);
    body.fillRoundedRect(-bw / 2, -bh, bw, bh, 8);
    body.lineStyle(2, zone.locked ? 0x333355 : zone.color, zone.locked ? 0.3 : 0.8);
    body.strokeRoundedRect(-bw / 2, -bh, bw, bh, 8);

    // Windows grid
    const winColors = [0xFFE66D, 0x4ECDC4, 0xFF6B35];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const lit = Math.random() > 0.3;
        const win = this.add.graphics();
        win.fillStyle(lit ? Phaser.Math.RND.pick(winColors) : 0x0D0D1A, lit ? 0.7 : 0.5);
        win.fillRect(-50 + col * 36, -bh + 20 + row * 40, 22, 18);
        container.add(win);

        if (lit) {
          this.tweens.add({
            targets: win,
            alpha: { from: 0.7, to: 0.2 },
            duration: Phaser.Math.Between(2000, 5000),
            yoyo: true,
            repeat: -1,
            delay: Phaser.Math.Between(0, 2000),
          });
        }
      }
    }

    // Icon circle above building
    const iconBg = this.add.graphics();
    iconBg.fillStyle(zone.color, zone.locked ? 0.2 : 0.9);
    iconBg.fillCircle(0, -bh - 35, 28);
    iconBg.setName('iconBg');
    if (!zone.locked) {
      iconBg.lineStyle(2, zone.glowColor, 1);
      iconBg.strokeCircle(0, -bh - 35, 30);
    }

    const iconText = this.add.text(0, -bh - 48, zone.icon, {
      fontSize: '22px',
    }).setOrigin(0.5);

    // Zone label
    const label = this.add.text(0, -bh - 78, zone.label, {
      fontSize: '11px',
      fontFamily: "'Fredoka One', cursive",
      color: zone.locked ? '#6B7A9B' : '#FFFFFF',
      stroke: '#0D0D1A',
      strokeThickness: 3,
    }).setOrigin(0.5);
    label.setName('zoneLabel');

    const sublabel = this.add.text(0, -bh - 62, zone.sublabel, {
      fontSize: '9px',
      fontFamily: "'Nunito', sans-serif",
      color: zone.locked ? '#444466' : '#A8B2D8',
    }).setOrigin(0.5);
    sublabel.setName('zoneSublabel');

    // Stars row (simple circles instead of fillStar which isn't on Graphics)
    for (let s = 0; s < 3; s++) {
      const starG = this.add.graphics();
      starG.fillStyle(s < zone.stars ? 0xFFE66D : 0x333355, 1);
      starG.fillCircle(-28 + s * 28, -bh - 10, 5);
      container.add(starG);
    }

    // Lock overlay
    if (zone.locked) {
      const lockOverlay = this.add.graphics();
      lockOverlay.fillStyle(0x000000, 0.5);
      lockOverlay.fillRoundedRect(-bw / 2, -bh, bw, bh, 8);
      lockOverlay.setName('lockOverlay');

      const lockIcon = this.add.text(0, -bh / 2, '🔒', {
        fontSize: '28px',
      }).setOrigin(0.5);
      lockIcon.setName('lockIcon');

      const lockedBadge = this.add.text(0, -bh / 2 + 24, 'LOCKED', {
        fontSize: '10px',
        fontFamily: "'Fredoka One', cursive",
        color: '#6B7A9B',
      }).setOrigin(0.5);
      lockedBadge.setName('lockedBadge');

      container.add([lockOverlay, lockIcon, lockedBadge]);
    }

    container.add([body, iconBg, iconText, label, sublabel]);

    // Gentle float animation (unlocked zones only)
    if (!zone.locked) {
      this.tweens.add({
        targets: container,
        y: { from: container.y, to: container.y - 6 },
        duration: 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Glow pulse on icon
      this.tweens.add({
        targets: iconBg,
        alpha: { from: 0.9, to: 0.5 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
      });

      // Click handler
      container.setInteractive(
        new Phaser.Geom.Rectangle(-bw / 2, -bh - 100, bw, bh + 100),
        Phaser.Geom.Rectangle.Contains
      );
      container.on('pointerover', () => {
        this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 150 });
        this.input.setDefaultCursor('pointer');
      });
      container.on('pointerout', () => {
        this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 150 });
        this.input.setDefaultCursor('default');
      });
      container.on('pointerdown', () => {
        this.handleZoneClick(zone.id, zone.x);
      });
    }

    return container;
  }

  private handleZoneClick(zoneId: string, zoneX: number) {
    if (this.isMoving) return;
    this.movePlayerToZone(zoneX, () => {
      EventBridge.emit(PHASER_EVENTS.ZONE_CLICKED, { zone: zoneId });
    });
  }

  private movePlayerToZone(targetX: number, onComplete?: () => void) {
    this.isMoving = true;
    this.tweens.add({
      targets: this.playerSprite,
      x: targetX,
      duration: Math.abs(targetX - this.playerX) * 2,
      ease: 'Quad.easeInOut',
      onComplete: () => {
        this.playerX = targetX;
        this.isMoving = false;
        onComplete?.();
      },
    });
  }

  private createPlayer(H: number) {
    const groundY = H * 0.75;
    this.playerSprite = this.add.container(200, groundY - 8);

    // Body (circle)
    const body = this.add.graphics();
    body.fillStyle(GAME_THEME.phaser.orange, 1);
    body.fillCircle(0, -24, 16);

    // Head glow
    const glow = this.add.graphics();
    glow.fillStyle(GAME_THEME.phaser.orange, 0.25);
    glow.fillCircle(0, -24, 24);

    // Cap
    const cap = this.add.graphics();
    cap.fillStyle(GAME_THEME.phaser.teal, 1);
    cap.fillRect(-12, -38, 24, 8);
    cap.fillRect(-6, -46, 12, 8);

    // Shadow under feet
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillEllipse(0, 0, 32, 8);

    // Name label (will be updated when player data loads)
    const nameLabel = this.add.text(0, -54, '...', {
      fontSize: '10px',
      fontFamily: "'Nunito', sans-serif",
      color: '#FFFFFF',
      stroke: '#0D0D1A',
      strokeThickness: 3,
      backgroundColor: 'rgba(13,13,26,0.7)',
      padding: { x: 5, y: 2 },
    }).setOrigin(0.5);
    nameLabel.setName('nameLabel');

    this.playerSprite.add([shadow, glow, body, cap, nameLabel]);

    // Idle bob
    this.tweens.add({
      targets: this.playerSprite,
      y: { from: groundY - 8, to: groundY - 14 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private playerIdleAnimation() {
    if (this.isMoving || !this.playerSprite) return;
    // Subtle wave: rotate the container briefly
    this.tweens.add({
      targets: this.playerSprite,
      angle: { from: -5, to: 5 },
      duration: 300,
      yoyo: true,
      repeat: 2,
    });
  }

  private createDailyChest(W: number, H: number) {
    const groundY = H * 0.75;
    this.chestContainer = this.add.container(1100, groundY - 10);

    const bg = this.add.graphics();
    bg.fillStyle(GAME_THEME.phaser.gold, 0.2);
    bg.fillRoundedRect(-30, -48, 60, 48, 8);
    bg.lineStyle(2, GAME_THEME.phaser.gold, 0.8);
    bg.strokeRoundedRect(-30, -48, 60, 48, 8);

    const chestIcon = this.add.text(0, -30, '🎁', {
      fontSize: '24px',
    }).setOrigin(0.5);

    const label = this.add.text(0, -52, 'DAILY\nCHEST', {
      fontSize: '8px',
      fontFamily: "'Fredoka One', cursive",
      color: '#FFE66D',
      align: 'center',
    }).setOrigin(0.5);

    this.chestContainer.add([bg, chestIcon, label]);

    // Float animation
    this.tweens.add({
      targets: this.chestContainer,
      y: { from: groundY - 10, to: groundY - 18 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Glow pulse
    this.tweens.add({
      targets: bg,
      alpha: { from: 1, to: 0.5 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Clickable
    this.chestContainer.setInteractive(
      new Phaser.Geom.Rectangle(-30, -60, 60, 60),
      Phaser.Geom.Rectangle.Contains
    );
    this.chestContainer.on('pointerdown', () => {
      if (this.chestAvailable) {
        EventBridge.emit(PHASER_EVENTS.CHEST_OPENED, { type: 'daily' });
        this.chestAvailable = false;
      }
    });
    this.chestContainer.on('pointerover', () => {
      this.input.setDefaultCursor('pointer');
      this.tweens.add({ targets: this.chestContainer, scaleX: 1.1, scaleY: 1.1, duration: 100 });
    });
    this.chestContainer.on('pointerout', () => {
      this.input.setDefaultCursor('default');
      this.tweens.add({ targets: this.chestContainer, scaleX: 1, scaleY: 1, duration: 100 });
    });
  }

  private createFloatingClouds(W: number, H: number) {
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(100, Math.max(W, 1500));
      const y = Phaser.Math.Between(40, H * 0.3);
      const cloud = this.add.graphics();
      cloud.fillStyle(0xFFFFFF, 0.07);
      cloud.fillCircle(0, 0, 30);
      cloud.fillCircle(20, -10, 22);
      cloud.fillCircle(-20, -5, 18);
      cloud.setPosition(x, y).setScrollFactor(0.15);

      this.tweens.add({
        targets: cloud,
        x: cloud.x + Phaser.Math.Between(60, 120),
        duration: Phaser.Math.Between(25000, 45000),
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private createHUD(W: number) {
    // HUD sits in screen-space (scrollFactor 0)
    // Stats bar at top
    const hudBg = this.add.graphics().setScrollFactor(0);
    hudBg.fillStyle(0x000000, 0.6);
    hudBg.fillRect(0, 0, W, 52);

    // XP bar
    const xpTrack = this.add.graphics().setScrollFactor(0);
    xpTrack.fillStyle(0xFFFFFF, 0.1);
    xpTrack.fillRoundedRect(W / 2 - 120, 30, 240, 10, 5);
    xpTrack.setName('xpTrack');

    const xpFill = this.add.graphics().setScrollFactor(0).setName('xpFill');
    xpFill.fillStyle(GAME_THEME.phaser.teal, 1);
    xpFill.fillRoundedRect(W / 2 - 120, 30, 0, 10, 5);

    // Level badge
    const levelBg = this.add.graphics().setScrollFactor(0);
    levelBg.fillStyle(GAME_THEME.phaser.orange, 1);
    levelBg.fillCircle(W / 2 - 135, 35, 16);

    const levelText = this.add.text(W / 2 - 135, 35, 'Lv.1', {
      fontSize: '10px',
      fontFamily: "'Orbitron', monospace",
      color: '#FFFFFF',
    }).setOrigin(0.5).setScrollFactor(0).setName('levelText');

    // Coin counter
    const coinText = this.add.text(W - 16, 10, '💰 0', {
      fontSize: '14px',
      fontFamily: "'Fredoka One', cursive",
      color: '#FFE66D',
    }).setOrigin(1, 0).setScrollFactor(0).setName('coinText');

    // Streak
    const streakText = this.add.text(16, 10, '🔥 0', {
      fontSize: '14px',
      fontFamily: "'Fredoka One', cursive",
      color: '#FF6B35',
    }).setOrigin(0).setScrollFactor(0).setName('streakText');

    // Player name
    const nameHUD = this.add.text(W / 2, 14, 'Loading...', {
      fontSize: '14px',
      fontFamily: "'Fredoka One', cursive",
      color: '#FFFFFF',
    }).setOrigin(0.5, 0).setScrollFactor(0).setName('nameHUD');
  }

  private createBottomNav(W: number, H: number) {
    const navH = 64;
    const navY = H - navH;

    const navBg = this.add.graphics().setScrollFactor(0);
    navBg.fillStyle(0x0D0D1A, 0.95);
    navBg.fillRect(0, navY, W, navH);
    navBg.lineStyle(1, GAME_THEME.phaser.teal, 0.3);
    navBg.lineBetween(0, navY, W, navY);

    const navItems = [
      { icon: '🗺️', label: 'MAP', event: 'nav:map', active: true },
      { icon: '⚔️', label: 'QUESTS', event: 'nav:challenges' },
      { icon: '🏆', label: 'RANKS', event: 'nav:leaderboard' },
      { icon: '🎒', label: 'ITEMS', event: 'nav:inventory' },
      { icon: '👤', label: 'ME', event: 'nav:profile' },
    ];

    navItems.forEach((item, i) => {
      const slotW = W / navItems.length;
      const cx = slotW * i + slotW / 2;
      const cy = navY + navH / 2;

      if (item.active) {
        const activeBg = this.add.graphics().setScrollFactor(0);
        activeBg.fillStyle(GAME_THEME.phaser.teal, 0.15);
        activeBg.fillRoundedRect(cx - slotW / 2 + 6, navY + 4, slotW - 12, navH - 8, 10);
      }

      const iconT = this.add.text(cx, cy - 10, item.icon, {
        fontSize: '20px',
      }).setOrigin(0.5).setScrollFactor(0);

      const labelT = this.add.text(cx, cy + 14, item.label, {
        fontSize: '9px',
        fontFamily: "'Fredoka One', cursive",
        color: item.active ? '#4ECDC4' : '#6B7A9B',
      }).setOrigin(0.5).setScrollFactor(0);

      iconT.setInteractive();
      iconT.on('pointerdown', () => {
        EventBridge.emit(item.event, {});
      });
      iconT.on('pointerover', () => { this.input.setDefaultCursor('pointer'); });
      iconT.on('pointerout', () => { this.input.setDefaultCursor('default'); });
    });
  }

  private updateHUD() {
    if (!this.playerData) return;
    const nameHUD = this.children.getByName('nameHUD') as Phaser.GameObjects.Text;
    const levelText = this.children.getByName('levelText') as Phaser.GameObjects.Text;
    const coinText = this.children.getByName('coinText') as Phaser.GameObjects.Text;
    const streakText = this.children.getByName('streakText') as Phaser.GameObjects.Text;
    const xpFill = this.children.getByName('xpFill') as Phaser.GameObjects.Graphics;

    if (nameHUD) nameHUD.setText(this.playerData.name);
    if (levelText) levelText.setText(`Lv.${this.playerData.level}`);
    if (coinText) coinText.setText(`💰 ${this.playerData.coins.toLocaleString()}`);
    if (streakText) streakText.setText(`🔥 ${this.playerData.streak}`);

    // Update player name label
    const playerNameLabel = this.playerSprite.getByName('nameLabel') as Phaser.GameObjects.Text;
    if (playerNameLabel) playerNameLabel.setText(this.playerData.name.split(' ')[0]);

    // Animate XP bar fill (simple left to right)
    const XP_PER_LEVEL = 250;
    const pct = Math.min((this.playerData.xp % XP_PER_LEVEL) / XP_PER_LEVEL, 1);
    if (xpFill) {
      const W = this.scale.width;
      xpFill.clear();
      this.tweens.add({
        targets: { w: 0 },
        w: 240 * pct,
        duration: 1200,
        ease: 'Cubic.easeOut',
        onUpdate: (tween: Phaser.Tweens.Tween) => {
          xpFill.clear();
          xpFill.fillStyle(GAME_THEME.phaser.teal, 1);
          const fillW = (tween.targets[0] as { w: number }).w;
          if (fillW > 0) {
            xpFill.fillRoundedRect(W / 2 - 120, 30, fillW, 10, 5);
          }
        },
      });
    }
  }

  private updateZoneLocks() {
    if (!this.playerData) return;
    this.playerData.unlockedZones.forEach((zoneId) => {
      const container = this.zones.get(zoneId);
      if (container) {
        // Destroy lock elements
        const lockOverlay = container.getByName('lockOverlay');
        const lockIcon = container.getByName('lockIcon');
        const lockedBadge = container.getByName('lockedBadge');

        if (lockOverlay) lockOverlay.destroy();
        if (lockIcon) lockIcon.destroy();
        if (lockedBadge) lockedBadge.destroy();

        // Update text colors to active styles
        const label = container.getByName('zoneLabel') as Phaser.GameObjects.Text;
        const sublabel = container.getByName('zoneSublabel') as Phaser.GameObjects.Text;
        if (label) label.setColor('#FFFFFF');
        if (sublabel) sublabel.setColor('#A8B2D8');

        // Restore iconBg opacity and add stroke
        const iconBg = container.getByName('iconBg') as Phaser.GameObjects.Graphics;
        if (iconBg) {
          iconBg.clear();
          // Find the original zone config for color
          let zoneColor: number = GAME_THEME.phaser.teal;
          let glowColor: number = 0x4ECDC4;
          if (zoneId === 'startup-wars') { zoneColor = GAME_THEME.phaser.orange; glowColor = 0xFF6B35; }
          else if (zoneId === 'arcade') { zoneColor = 0xF59E0B; glowColor = 0xF59E0B; }
          else if (zoneId === 'showcase') { zoneColor = 0x8B5CF6; glowColor = 0x8B5CF6; }

          iconBg.fillStyle(zoneColor, 0.9);
          iconBg.fillCircle(0, -160 - 35, 28);
          iconBg.lineStyle(2, glowColor, 1);
          iconBg.strokeCircle(0, -160 - 35, 30);
        }

        // Enable hover and click interactions if they don't exist yet
        if (!container.input) {
          const bw = 140;
          const bh = 160;

          // Gentle float animation
          this.tweens.add({
            targets: container,
            y: { from: container.y, to: container.y - 6 },
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });

          // Glow pulse on icon
          if (iconBg) {
            this.tweens.add({
              targets: iconBg,
              alpha: { from: 0.9, to: 0.5 },
              duration: 1500,
              yoyo: true,
              repeat: -1,
            });
          }

          container.setInteractive(
            new Phaser.Geom.Rectangle(-bw / 2, -bh - 100, bw, bh + 100),
            Phaser.Geom.Rectangle.Contains
          );
          
          container.on('pointerover', () => {
            this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 150 });
            this.input.setDefaultCursor('pointer');
          });
          container.on('pointerout', () => {
            this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 150 });
            this.input.setDefaultCursor('default');
          });
          container.on('pointerdown', () => {
            let targetX = 200;
            if (zoneId === 'startup-wars') targetX = 550;
            if (zoneId === 'arcade') targetX = 900;
            if (zoneId === 'showcase') targetX = 1250;
            this.handleZoneClick(zoneId, targetX);
          });
        }
      }
    });
  }

  update() {
    // Keep player in bounds
    if (this.playerSprite) {
      this.playerSprite.x = Phaser.Math.Clamp(this.playerSprite.x, 60, Math.max(this.scale.width, 1600) - 60);
    }
  }
}

// apps/web/src/phaser/scenes/simulator/BusinessDayScene.ts
import Phaser from 'phaser';
import { EventBridge, PHASER_EVENTS } from '../../EventBridge';

interface CustomerConfig {
  x: number;
  y: number;
  type: string;
  spriteKey: string;
  speed: number;
}

export class BusinessDayScene extends Phaser.Scene {
  private spawnTimer!: Phaser.Time.TimerEvent;
  private durationTimer!: Phaser.Time.TimerEvent;
  private timeRemaining = 30;

  private totalCustomers = 0;
  private customersServed = 0;
  private revenue = 0;

  private price = 50;
  private marketing = 1000;

  private storeX = 150;
  private groundY = 560;

  constructor() {
    super('BusinessDay');
  }

  init() {
    this.price = parseInt(localStorage.getItem('campusedge_price') || '50');
    this.marketing = parseInt(localStorage.getItem('campusedge_marketing') || '1000');

    this.timeRemaining = 30;
    this.customersServed = 0;
    this.revenue = 0;
    this.totalCustomers = 0;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background sky and street
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0D0D1A, 0x0D0D1A, 0x1A1A2E, 0x1A1A2E, 1);
    bg.fillRect(0, 0, W, H);

    // Ground
    bg.fillStyle(0x333344, 1);
    bg.fillRect(0, this.groundY, W, H - this.groundY);

    // Sidewalk border
    bg.fillStyle(0x555566, 1);
    bg.fillRect(0, this.groundY, W, 8);

    // Draw simple store on the left
    const store = this.add.graphics();
    store.fillStyle(0x16213E, 1);
    store.fillRect(40, this.groundY - 140, 180, 140);
    store.lineStyle(3, 0xFF6B35, 1);
    store.strokeRect(40, this.groundY - 140, 180, 140);

    // Awning
    store.fillStyle(0xFF6B35, 1);
    store.fillRect(30, this.groundY - 150, 200, 20);

    // Sign text
    this.add.text(130, this.groundY - 120, 'STORE', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '15px',
      color: '#FFE66D',
    }).setOrigin(0.5);

    // HUD overlays
    this.createHUD(W);

    // Spawning customers spread over 30 seconds
    // Higher marketing = more customers
    const expectedCustomers = 8 + Math.floor(this.marketing / 500);
    const spawnInterval = 30000 / expectedCustomers;

    this.spawnTimer = this.time.addEvent({
      delay: spawnInterval,
      loop: true,
      callback: this.spawnCustomer,
      callbackScope: this,
    });

    // 30 seconds count down
    this.durationTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.timeRemaining--;
        this.updateHUD();
        if (this.timeRemaining <= 0) {
          this.endRound();
        }
      },
    });
  }

  private createHUD(W: number) {
    // top hud
    this.add.text(40, 30, `Served: ${this.customersServed}`, {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '16px',
      color: '#FFFFFF',
    }).setName('servedText');

    this.add.text(W - 180, 30, `Revenue: ₹${this.revenue}`, {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '16px',
      color: '#FFE66D',
    }).setName('revenueText');

    this.add.text(W / 2, 30, `Ends in: ${this.timeRemaining}s`, {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '16px',
      color: '#FF6B35',
    }).setOrigin(0.5).setName('timerText');
  }

  private updateHUD() {
    const servedText = this.children.getByName('servedText') as Phaser.GameObjects.Text;
    const revenueText = this.children.getByName('revenueText') as Phaser.GameObjects.Text;
    const timerText = this.children.getByName('timerText') as Phaser.GameObjects.Text;

    if (servedText) servedText.setText(`Served: ${this.customersServed}`);
    if (revenueText) revenueText.setText(`Revenue: ₹${this.revenue}`);
    if (timerText) timerText.setText(`Ends in: ${this.timeRemaining}s`);
  }

  private spawnCustomer() {
    const idx = Phaser.Math.Between(0, 4);
    const customer = this.add.container(this.scale.width + 20, this.groundY - 24);

    const sprite = this.add.sprite(0, 0, `customer_${idx}`);
    customer.add(sprite);

    // Emote bubble
    const emote = this.add.text(0, -35, '😋', { fontSize: '14px' }).setOrigin(0.5).setVisible(false);
    customer.add(emote);

    // Walk to store
    this.tweens.add({
      targets: customer,
      x: this.storeX + 60,
      duration: 3500 + Math.random() * 1000,
      onComplete: () => {
        // Decide purchase
        const successChance = Math.max(0.2, 1 - (this.price / 120)); // higher price = less likely to buy
        const willBuy = Math.random() < successChance;

        emote.setText(willBuy ? '😊' : '😤').setVisible(true);

        this.time.delayedCall(800, () => {
          if (willBuy) {
            // Enter store & purchase
            this.sound.play('cash-register', { volume: 0.8 });
            this.customersServed++;
            this.revenue += this.price;
            this.updateHUD();

            // Coin pop animation
            this.createCoinPop(this.storeX + 60, this.groundY - 50);

            this.tweens.add({
              targets: customer,
              alpha: 0,
              duration: 400,
              onComplete: () => customer.destroy(),
            });
          } else {
            // Walk away disappointed
            this.tweens.add({
              targets: customer,
              x: this.scale.width + 40,
              duration: 3000,
              onComplete: () => customer.destroy(),
            });
          }
        });
      },
    });
  }

  private createCoinPop(x: number, y: number) {
    const coin = this.add.text(x, y, '🪙', { fontSize: '20px' }).setOrigin(0.5);
    this.tweens.add({
      targets: coin,
      y: y - 80,
      alpha: 0,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 800,
      onComplete: () => coin.destroy(),
    });
  }

  private endRound() {
    this.spawnTimer.destroy();
    this.durationTimer.destroy();

    const W = this.scale.width;
    const H = this.scale.height;

    // Day Over banner
    const banner = this.add.text(W / 2, H / 2 - 40, 'WEEK COMPLETED! 📊', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '36px',
      color: '#FFE66D',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: banner,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 400,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        // Complete event
        EventBridge.emit(PHASER_EVENTS.SCENE_COMPLETE, {
          scene: 'simulator_round',
          revenue: this.revenue,
          served: this.customersServed,
        });
      },
    });
  }
}

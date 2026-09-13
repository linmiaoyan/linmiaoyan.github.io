/**
 * 黄金狂查 (Gold Rush Pixel Tycoon) - Pure JavaScript Engine
 * Includes pixel-art sprite rendering, Web Audio Chiptune SFX,
 * LocalStorage Save/Load, and Real-Time Market Exchange Mechanics.
 */

(function () {
  'use strict';

  // Config Constants
  const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 480,
    GROUND_Y: 100,
    INITIAL_CASH: 480,
    INITIAL_STORAGE_LIMIT: 320,
    MONTH_SECONDS: 15,
    TOTAL_MONTHS: 12,
    SAVE_KEY: 'GOLD_RUSH_PIXEL_SAVE_V1'
  };

  // Web Audio Chiptune Synthesizer
  class ChiptuneAudio {
    constructor() {
      this.enabled = true;
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
    }

    playCoin() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    }

    playDig() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    }

    playSonar() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.18);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    }

    playUpgrade() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(660, now + 0.08);
      osc.frequency.setValueAtTime(880, now + 0.16);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  }

  // Pixel Game Engine Class
  class PixelGoldGame {
    constructor() {
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false; // Enable sharp pixel graphics

      this.audio = new ChiptuneAudio();

      // Game state variables
      this.cash = CONFIG.INITIAL_CASH;
      this.storageCapacity = CONFIG.INITIAL_STORAGE_LIMIT;
      this.storedGold = 0;
      this.totalMined = 0;
      this.totalRevenue = 0;
      this.totalExpenses = 0;

      this.currentMonth = 1;
      this.monthTimer = CONFIG.MONTH_SECONDS;
      this.isPaused = false;
      this.gameSpeed = 1;
      this.isGameOver = false;

      this.selectedTool = 'prospector';

      this.upgrades = {
        drillSpeed: 1.0,
        scannerRange: 1.0,
        tankExpand: 1.0
      };

      // Entities
      this.goldDeposits = [];
      this.prospectors = [];
      this.rigs = [];
      this.tanks = [];
      this.pipes = [];
      this.sonarRings = [];
      this.floatingTexts = []; // Floating profit text

      // Side Markets
      this.markets = {
        west: { name: '华西', price: 45.0, change: 0, history: [45.0], valveOpen: false, trend: 'STABLE' },
        east: { name: '华东', price: 42.0, change: 0, history: [42.0], valveOpen: false, trend: 'STABLE' }
      };

      this.activePipeOrigin = null;

      this.initUI();
      this.loadSavedGame() || this.resetGame();
      this.startLoop();
    }

    resetGame() {
      this.cash = CONFIG.INITIAL_CASH;
      this.storageCapacity = CONFIG.INITIAL_STORAGE_LIMIT;
      this.storedGold = 0;
      this.totalMined = 0;
      this.totalRevenue = 0;
      this.totalExpenses = 0;
      this.currentMonth = 1;
      this.monthTimer = CONFIG.MONTH_SECONDS;
      this.isPaused = false;
      this.isGameOver = false;

      this.upgrades = { drillSpeed: 1.0, scannerRange: 1.0, tankExpand: 1.0 };
      this.prospectors = [];
      this.rigs = [];
      this.tanks = [];
      this.pipes = [];
      this.sonarRings = [];
      this.floatingTexts = [];
      this.activePipeOrigin = null;

      this.markets.west = { name: '华西', price: 45.0, change: 0, history: [45.0], valveOpen: false, trend: 'STABLE' };
      this.markets.east = { name: '华东', price: 42.0, change: 0, history: [42.0], valveOpen: false, trend: 'STABLE' };

      this.generateGoldDeposits();
      this.updateUI();
    }

    generateGoldDeposits() {
      this.goldDeposits = [];
      const count = 14 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        const x = 60 + Math.random() * (CONFIG.CANVAS_WIDTH - 120);
        const y = CONFIG.GROUND_Y + 40 + Math.random() * (CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_Y - 80);
        const radius = 12 + Math.random() * 18;
        const amount = Math.floor(radius * 25 + Math.random() * 180);

        this.goldDeposits.push({
          x: Math.floor(x),
          y: Math.floor(y),
          radius: Math.floor(radius),
          initialAmount: amount,
          amount,
          discovered: false
        });
      }
    }

    initUI() {
      // Tool Select Buttons
      document.querySelectorAll('.tool-btn[data-tool]').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.tool-btn[data-tool]').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.selectedTool = btn.getAttribute('data-tool');
          this.activePipeOrigin = null;
          this.showToast(`Selected Tool: ${this.selectedTool.toUpperCase()}`);
        });
      });

      // Quick Add Money Button
      document.getElementById('btn-quick-add').addEventListener('click', () => {
        this.cash += 100;
        this.showToast('+100 G Funds Added');
        this.updateUI();
      });

      // Canvas Interaction
      this.canvas.addEventListener('click', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = CONFIG.CANVAS_WIDTH / rect.width;
        const scaleY = CONFIG.CANVAS_HEIGHT / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);
        this.handleCanvasClick(x, y);
      });

      // Top Action Buttons
      document.getElementById('btn-save').addEventListener('click', () => this.saveGame());

      document.getElementById('btn-pause').addEventListener('click', () => {
        this.isPaused = !this.isPaused;
        document.getElementById('btn-pause').innerHTML = this.isPaused
          ? '<i class="fa-solid fa-play"></i>'
          : '<i class="fa-solid fa-pause"></i>';
      });

      document.getElementById('btn-speed').addEventListener('click', (e) => {
        if (this.gameSpeed === 1) this.gameSpeed = 2;
        else if (this.gameSpeed === 2) this.gameSpeed = 3;
        else this.gameSpeed = 1;
        e.target.innerText = `${this.gameSpeed}x`;
      });

      document.getElementById('btn-sound').addEventListener('click', (e) => {
        this.audio.enabled = !this.audio.enabled;
        e.currentTarget.innerHTML = this.audio.enabled
          ? '<i class="fa-solid fa-volume-high"></i>'
          : '<i class="fa-solid fa-volume-xmark"></i>';
      });

      // Workflow Modal Toggle
      const workflowModal = document.getElementById('workflow-modal');
      document.getElementById('btn-workflow').addEventListener('click', () => workflowModal.classList.remove('hidden'));
      document.getElementById('btn-close-workflow').addEventListener('click', () => workflowModal.classList.add('hidden'));

      // Shop Modal Toggle
      const shopModal = document.getElementById('shop-modal');
      document.getElementById('btn-open-shop').addEventListener('click', () => shopModal.classList.remove('hidden'));
      document.getElementById('btn-close-shop').addEventListener('click', () => shopModal.classList.add('hidden'));

      // Valve Toggles
      document.getElementById('west-valve-toggle').addEventListener('change', (e) => {
        this.markets.west.valveOpen = e.target.checked;
      });
      document.getElementById('east-valve-toggle').addEventListener('change', (e) => {
        this.markets.east.valveOpen = e.target.checked;
      });

      // Boost Buttons
      document.getElementById('btn-west-boost').addEventListener('click', () => this.boostMarket('west'));
      document.getElementById('btn-east-boost').addEventListener('click', () => this.boostMarket('east'));

      // Upgrades Buying
      document.querySelectorAll('.btn-buy').forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-upgrade');
          const cost = parseInt(btn.getAttribute('data-cost'));
          this.buyUpgrade(key, cost, btn);
        });
      });

      // Settlement Restart
      document.getElementById('btn-restart').addEventListener('click', () => {
        document.getElementById('settlement-modal').classList.add('hidden');
        this.resetGame();
      });
    }

    boostMarket(key) {
      if (this.cash < 150) {
        this.showToast('Not enough Money (150G needed)');
        return;
      }
      this.audio.init();
      this.cash -= 150;
      this.totalExpenses += 150;
      this.markets[key].price += 15.0 + Math.random() * 10;
      this.markets[key].trend = 'BOOMING';
      this.audio.playUpgrade();
      this.showToast(`Market Boosted! ${this.markets[key].name} Gold Price Spiked!`);
      this.updateUI();
    }

    buyUpgrade(key, cost, btn) {
      if (this.cash < cost) {
        this.showToast('Not enough Money for research!');
        return;
      }
      this.audio.init();
      this.cash -= cost;
      this.totalExpenses += cost;
      this.audio.playUpgrade();

      if (key === 'drillSpeed') this.upgrades.drillSpeed = 1.6;
      if (key === 'scannerRange') this.upgrades.scannerRange = 1.5;
      if (key === 'tankExpand') {
        this.upgrades.tankExpand = 2.0;
        this.storageCapacity *= 2;
      }

      btn.disabled = true;
      btn.innerText = 'RESEARCHED';
      this.showToast('Upgrade Researched!');
      this.updateUI();
    }

    handleCanvasClick(x, y) {
      this.audio.init();

      if (this.selectedTool === 'prospector') {
        if (y > CONFIG.GROUND_Y) {
          this.showToast('Prospector must start on surface!');
          return;
        }
        if (this.cash < 100) {
          this.showToast('Need 100G for Prospector');
          return;
        }
        this.cash -= 100;
        this.totalExpenses += 100;
        this.audio.playDig();
        this.prospectors.push({
          x,
          y: CONFIG.GROUND_Y - 8,
          dir: Math.random() < 0.5 ? -1 : 1,
          scanRadius: 8,
          maxScanRadius: 70 * this.upgrades.scannerRange
        });
        this.showToast('Prospector deployed!');
      } else if (this.selectedTool === 'radar') {
        if (this.cash < 250) {
          this.showToast('Need 250G for Radar');
          return;
        }
        this.cash -= 250;
        this.totalExpenses += 250;
        this.audio.playSonar();
        this.sonarRings.push({ x, y, r: 8, maxR: 110 * this.upgrades.scannerRange, alpha: 1.0 });

        this.goldDeposits.forEach((dep) => {
          if (Math.hypot(dep.x - x, dep.y - y) <= 110 * this.upgrades.scannerRange) {
            dep.discovered = true;
          }
        });
        this.showToast('Radar Scan Discovered Gold!');
      } else if (this.selectedTool === 'rig') {
        if (y > CONFIG.GROUND_Y + 15) {
          this.showToast('Drill Rig must be on surface!');
          return;
        }
        if (this.cash < 300) {
          this.showToast('Need 300G for Drill Rig');
          return;
        }
        this.cash -= 300;
        this.totalExpenses += 300;
        this.audio.playDig();
        this.rigs.push({ x, y: CONFIG.GROUND_Y });
        this.showToast('Drill Rig Built! Now connect pipes underground!');
      } else if (this.selectedTool === 'pipe') {
        if (!this.activePipeOrigin) {
          const nearestRig = this.rigs.find((r) => Math.hypot(r.x - x, r.y - y) < 28);
          if (nearestRig) {
            this.activePipeOrigin = { x: nearestRig.x, y: nearestRig.y };
            this.showToast('Rig selected! Click underground to drill pipe.');
          } else {
            const nearestPipeNode = this.pipes.find((p) => Math.hypot(p.x2 - x, p.y2 - y) < 20);
            if (nearestPipeNode) {
              this.activePipeOrigin = { x: nearestPipeNode.x2, y: nearestPipeNode.y2 };
              this.showToast('Pipe node selected! Continue drilling.');
            } else {
              this.showToast('Select a Drill Rig or Pipe node first!');
            }
          }
        } else {
          if (y <= CONFIG.GROUND_Y) {
            this.showToast('Pipes must go underground!');
            return;
          }
          const dist = Math.hypot(x - this.activePipeOrigin.x, y - this.activePipeOrigin.y);
          const cost = Math.ceil((dist / 10) * 20);

          if (this.cash < cost) {
            this.showToast(`Need ${cost}G for this pipe extension!`);
            return;
          }

          this.cash -= cost;
          this.totalExpenses += cost;
          this.audio.playDig();

          let hitIndex = -1;
          this.goldDeposits.forEach((dep, idx) => {
            if (Math.hypot(dep.x - x, dep.y - y) <= dep.radius) {
              hitIndex = idx;
              dep.discovered = true;
            }
          });

          this.pipes.push({
            x1: this.activePipeOrigin.x,
            y1: this.activePipeOrigin.y,
            x2: x,
            y2: y,
            connectedIndex: hitIndex
          });

          if (hitIndex !== -1) {
            this.showToast('Pipe connected to Gold Deposit! Extraction Started!');
          } else {
            this.showToast(`Pipe segment built (-${cost}G)`);
          }

          this.activePipeOrigin = { x, y };
        }
      } else if (this.selectedTool === 'tank') {
        if (y > CONFIG.GROUND_Y + 15) {
          this.showToast('Storage Tank must be on surface!');
          return;
        }
        if (this.cash < 400) {
          this.showToast('Need 400G for Storage Tank');
          return;
        }
        this.cash -= 400;
        this.totalExpenses += 400;
        this.audio.playDig();
        this.tanks.push({ x, y: CONFIG.GROUND_Y - 20 });
        this.storageCapacity += 320 * this.upgrades.tankExpand;
        this.showToast('Storage Tank Built!');
      }

      this.updateUI();
    }

    startLoop() {
      let lastTime = performance.now();
      const loop = (time) => {
        const dt = (time - lastTime) / 1000;
        lastTime = time;

        if (!this.isPaused && !this.isGameOver) {
          this.update(dt * this.gameSpeed);
        }

        this.render();
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }

    update(dt) {
      // Month timer
      this.monthTimer -= dt;
      if (this.monthTimer <= 0) {
        this.monthTimer = CONFIG.MONTH_SECONDS;
        this.currentMonth++;
        if (this.currentMonth > CONFIG.TOTAL_MONTHS) {
          this.triggerSettlement();
          return;
        }
      }

      // Update Market Prices
      ['west', 'east'].forEach((mKey) => {
        const m = this.markets[mKey];
        const delta = (Math.random() - 0.49) * 0.9;
        m.price = Math.max(12, Math.min(100, m.price + delta));

        if (Math.random() < 0.04) {
          m.history.push(m.price);
          if (m.history.length > 20) m.history.shift();
          const prev = m.history[m.history.length - 2] || m.price;
          const diff = m.price - prev;
          m.change = diff;
          if (diff > 1.2) m.trend = 'RISING';
          else if (diff < -1.2) m.trend = 'FALLING';
          else m.trend = 'STABLE';
        }
      });

      // Prospector movement
      this.prospectors.forEach((p) => {
        p.x += p.dir * 20 * dt;
        if (p.x < 30 || p.x > CONFIG.CANVAS_WIDTH - 30) p.dir *= -1;

        p.scanRadius += 35 * dt;
        if (p.scanRadius > p.maxScanRadius) p.scanRadius = 8;

        this.goldDeposits.forEach((dep) => {
          if (!dep.discovered && Math.hypot(dep.x - p.x, dep.y - (CONFIG.GROUND_Y + 30)) < p.scanRadius) {
            dep.discovered = true;
            this.audio.playSonar();
            this.showToast('Prospector found underground Gold!');
          }
        });
      });

      // Sonar rings animation
      for (let i = this.sonarRings.length - 1; i >= 0; i--) {
        const ring = this.sonarRings[i];
        ring.r += 90 * dt;
        ring.alpha -= 0.8 * dt;
        if (ring.alpha <= 0) this.sonarRings.splice(i, 1);
      }

      // Gold Mining via Pipes
      this.pipes.forEach((pipe) => {
        if (pipe.connectedIndex !== -1) {
          const dep = this.goldDeposits[pipe.connectedIndex];
          if (dep && dep.amount > 0) {
            const extract = 10 * this.upgrades.drillSpeed * dt;
            const actual = Math.min(dep.amount, extract);

            if (this.storedGold + actual <= this.storageCapacity) {
              dep.amount -= actual;
              this.storedGold += actual;
              this.totalMined += actual;
            }
          }
        }
      });

      // Selling Gold via Valves
      let soldAmount = 0;
      if (this.markets.west.valveOpen && this.storedGold > 0) {
        const rate = Math.min(this.storedGold, 20 * dt);
        this.storedGold -= rate;
        const rev = rate * this.markets.west.price;
        this.cash += rev;
        this.totalRevenue += rev;
        soldAmount += rate;
      }

      if (this.markets.east.valveOpen && this.storedGold > 0) {
        const rate = Math.min(this.storedGold, 20 * dt);
        this.storedGold -= rate;
        const rev = rate * this.markets.east.price;
        this.cash += rev;
        this.totalRevenue += rev;
        soldAmount += rate;
      }

      if (soldAmount > 0 && Math.random() < 0.08) {
        this.audio.playCoin();
      }

      // Update Floating Texts
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y -= 20 * dt;
        ft.alpha -= 0.8 * dt;
        if (ft.alpha <= 0) this.floatingTexts.splice(i, 1);
      }

      this.updateUI();
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

      // Pixel Sky
      ctx.fillStyle = '#68a0a8';
      ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.GROUND_Y);

      // Pixel Surface Grass & Trees
      ctx.fillStyle = '#3a663b';
      ctx.fillRect(0, CONFIG.GROUND_Y - 8, CONFIG.CANVAS_WIDTH, 12);
      ctx.fillStyle = '#4f8050';
      ctx.fillRect(0, CONFIG.GROUND_Y - 8, CONFIG.CANVAS_WIDTH, 4);

      // Decorative Pixel Trees & Rocks
      this.renderPixelDecorations(ctx);

      // Underground Dirt
      ctx.fillStyle = '#4a3321';
      ctx.fillRect(0, CONFIG.GROUND_Y + 4, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_Y);
      ctx.fillStyle = '#332216';
      ctx.fillRect(0, CONFIG.GROUND_Y + 120, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_Y - 120);

      // Discovered Gold Deposits
      this.goldDeposits.forEach((dep) => {
        if (dep.discovered) {
          const ratio = dep.amount / dep.initialAmount;
          if (dep.amount > 0) {
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(dep.x, dep.y, Math.max(3, dep.radius * ratio), 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f39c12';
            ctx.fillRect(dep.x - 2, dep.y - 2, 4, 4);

            ctx.fillStyle = '#ffffff';
            ctx.font = '10px "VT323", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.floor(dep.amount)}oz`, dep.x, dep.y + dep.radius + 10);
          } else {
            ctx.fillStyle = '#7f8c8d';
            ctx.beginPath();
            ctx.arc(dep.x, dep.y, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Pipes
      ctx.lineWidth = 4;
      this.pipes.forEach((p) => {
        ctx.strokeStyle = p.connectedIndex !== -1 ? '#f1c40f' : '#2c3e50';
        ctx.beginPath();
        ctx.moveTo(p.x1, p.y1);
        ctx.lineTo(p.x2, p.y2);
        ctx.stroke();

        ctx.fillStyle = '#111';
        ctx.fillRect(p.x2 - 3, p.y2 - 3, 6, 6);
      });

      // Pipe Guideline Preview
      if (this.selectedTool === 'pipe' && this.activePipeOrigin) {
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.activePipeOrigin.x, this.activePipeOrigin.y);
        ctx.lineTo(this.activePipeOrigin.x, CONFIG.GROUND_Y + 80);
        ctx.stroke();
      }

      // Rigs
      this.rigs.forEach((r) => {
        ctx.fillStyle = '#34495e';
        ctx.fillRect(r.x - 10, r.y - 20, 20, 20);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(r.x - 4, r.y - 26, 8, 6);
      });

      // Tanks
      this.tanks.forEach((t) => {
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(t.x - 16, t.y, 32, 20);
        ctx.fillStyle = '#d35400';
        ctx.fillRect(t.x - 14, t.y + 2, 28, 4);
      });

      // Prospectors
      this.prospectors.forEach((p) => {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(p.x - 5, p.y - 10, 10, 10);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(p.x - 3, p.y - 14, 6, 4);

        // Sonar Arc
        ctx.strokeStyle = 'rgba(241, 196, 15, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y + 30, p.scanRadius, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Sonar Rings
      this.sonarRings.forEach((ring) => {
        ctx.strokeStyle = `rgba(52, 152, 219, ${ring.alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Render Charts
      this.renderMarketChart('west-chart', this.markets.west.history);
      this.renderMarketChart('east-chart', this.markets.east.history);
    }

    renderPixelDecorations(ctx) {
      // Static pixel trees & rocks positions
      const staticDecor = [
        { type: 'tree', x: 40 },
        { type: 'tree', x: 120 },
        { type: 'rock', x: 220 },
        { type: 'tree', x: 380 },
        { type: 'rock', x: 540 },
        { type: 'tree', x: 720 }
      ];

      staticDecor.forEach((item) => {
        if (item.type === 'tree') {
          ctx.fillStyle = '#27ae60';
          ctx.fillRect(item.x - 10, CONFIG.GROUND_Y - 30, 20, 20);
          ctx.fillStyle = '#7f8c8d';
          ctx.fillRect(item.x - 3, CONFIG.GROUND_Y - 10, 6, 10);
        } else {
          ctx.fillStyle = '#7f8c8d';
          ctx.fillRect(item.x - 8, CONFIG.GROUND_Y - 12, 16, 12);
        }
      });
    }

    renderMarketChart(canvasId, history) {
      const chartCanvas = document.getElementById(canvasId);
      if (!chartCanvas) return;
      const cCtx = chartCanvas.getContext('2d');
      const w = chartCanvas.width;
      const h = chartCanvas.height;

      cCtx.clearRect(0, 0, w, h);
      if (history.length < 2) return;

      const min = Math.min(...history) - 4;
      const max = Math.max(...history) + 4;
      const step = w / (history.length - 1);

      cCtx.beginPath();
      cCtx.strokeStyle = history[history.length - 1] >= history[0] ? '#2ecc71' : '#e74c3c';
      cCtx.lineWidth = 2;

      history.forEach((val, i) => {
        const x = i * step;
        const y = h - ((val - min) / (max - min)) * (h - 8) - 4;
        if (i === 0) cCtx.moveTo(x, y);
        else cCtx.lineTo(x, y);
      });
      cCtx.stroke();
    }

    updateUI() {
      document.getElementById('cash-display').innerText = `${Math.floor(this.cash)} G`;
      document.getElementById('gold-storage-display').innerText = `${Math.floor(this.storedGold)} / ${Math.floor(this.storageCapacity)} oz`;

      const daysLeft = Math.ceil((this.monthTimer / CONFIG.MONTH_SECONDS) * 30);
      document.getElementById('time-display').innerText = `M${this.currentMonth} (${daysLeft}d)`;

      // West Market
      document.getElementById('west-price').innerText = this.markets.west.price.toFixed(1);
      const wChg = document.getElementById('west-price-change');
      wChg.innerText = `${this.markets.west.change >= 0 ? '+' : ''}${this.markets.west.change.toFixed(1)}`;
      wChg.className = `price-change ${this.markets.west.change >= 0 ? 'up' : 'down'}`;
      document.getElementById('west-trend-badge').innerText = this.markets.west.trend;

      // East Market
      document.getElementById('east-price').innerText = this.markets.east.price.toFixed(1);
      const eChg = document.getElementById('east-price-change');
      eChg.innerText = `${this.markets.east.change >= 0 ? '+' : ''}${this.markets.east.change.toFixed(1)}`;
      eChg.className = `price-change ${this.markets.east.change >= 0 ? 'up' : 'down'}`;
      document.getElementById('east-trend-badge').innerText = this.markets.east.trend;
    }

    showToast(msg) {
      const toast = document.getElementById('toast-message');
      toast.innerText = msg;
      toast.classList.remove('hidden');
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => toast.classList.add('hidden'), 2200);
    }

    saveGame() {
      const state = {
        cash: this.cash,
        storageCapacity: this.storageCapacity,
        storedGold: this.storedGold,
        totalMined: this.totalMined,
        totalRevenue: this.totalRevenue,
        totalExpenses: this.totalExpenses,
        currentMonth: this.currentMonth,
        upgrades: this.upgrades,
        goldDeposits: this.goldDeposits,
        rigs: this.rigs,
        tanks: this.tanks,
        pipes: this.pipes
      };
      localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(state));
      this.showToast('Game Progress Saved!');
    }

    loadSavedGame() {
      try {
        const raw = localStorage.getItem(CONFIG.SAVE_KEY);
        if (!raw) return false;
        const state = JSON.parse(raw);
        this.cash = state.cash;
        this.storageCapacity = state.storageCapacity;
        this.storedGold = state.storedGold;
        this.totalMined = state.totalMined;
        this.totalRevenue = state.totalRevenue;
        this.totalExpenses = state.totalExpenses;
        this.currentMonth = state.currentMonth;
        this.upgrades = state.upgrades || this.upgrades;
        this.goldDeposits = state.goldDeposits || [];
        this.rigs = state.rigs || [];
        this.tanks = state.tanks || [];
        this.pipes = state.pipes || [];
        this.showToast('Saved Game Loaded!');
        return true;
      } catch (e) {
        return false;
      }
    }

    triggerSettlement() {
      this.isGameOver = true;
      const totalNet = Math.floor(this.cash + this.storedGold * 40 - this.totalExpenses);

      document.getElementById('inv-gold-amount').innerText = Math.floor(this.totalMined);
      document.getElementById('inv-gold-total').innerText = Math.floor(this.totalMined * 40);
      document.getElementById('inv-revenue').innerText = Math.floor(this.totalRevenue);
      document.getElementById('inv-expenses').innerText = Math.floor(this.totalExpenses);

      const netEl = document.getElementById('inv-total-net');
      netEl.innerText = `${totalNet} G`;

      const stampEl = document.getElementById('invoice-stamp');
      if (totalNet >= 3000) {
        stampEl.innerText = 'PASSED';
        stampEl.style.color = '#27ae60';
        stampEl.style.borderColor = '#27ae60';
      } else {
        stampEl.innerText = 'BANKRUPT';
        stampEl.style.color = '#e74c3c';
        stampEl.style.borderColor = '#e74c3c';
      }

      document.getElementById('settlement-modal').classList.remove('hidden');
    }
  }

  // Initialize
  window.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new PixelGoldGame();
  });
})();

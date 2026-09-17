/**
 * 黄金骚动 (Gold Turmoil Pixel Tycoon) - Pure JavaScript Engine
 * Authentically Modeled after Turmoil Mechanics:
 * - Base warehouse capacity is 0 oz. Mine Shafts provide intrinsic +50 oz buffer storage.
 * - Dedicated Warehouses (Silos) required for storing large gold reserves.
 * - Spill / Overflow Alert Warnings when storage is completely full.
 * - Periodic Exchange Market Closures ("休市 / CLOSED") where trucks cannot trade.
 * - Wide Market Price Divergence (e.g. West $45 vs East $12) forcing strategic holding/selling decisions.
 * - Truck Fleet Logistics: Trucks drive in, load gold up to capacity, transport to active exchanges, sell, and return.
 */

(function () {
  'use strict';

  // Config Constants
  const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 480,
    GROUND_Y: 100,
    INITIAL_CASH: 1500,
    INITIAL_STORAGE_LIMIT: 0, // 0 Base Warehouse Storage (Turmoil Authentic)
    SHAFT_STORAGE_BUFFER: 50, // +50 oz per shaft
    MONTH_SECONDS: 15,
    TOTAL_MONTHS: 12,
    SAVE_KEY: 'GOLD_TURMOIL_SAVE_V7'
  };

  // i18n Translation Dictionary
  const TRANSLATIONS = {
    zh: {
      appTitle: '黄金骚动',
      lblMoney: '资金 (MONEY)',
      lblStorage: '黄金库存 (STORAGE)',
      lblSeason: '经营期限 (SEASON)',
      marketWest: '华西交易所',
      marketEast: '华东交易所',
      valveWest: '呼叫输金卡车',
      valveEast: '呼叫输金卡车',
      boostWest: '操纵市场 (150G)',
      boostEast: '操纵市场 (150G)',
      groupProspect: '勘探工具',
      groupMining: '矿山设施',
      toolProspector: '探矿员 (100G)',
      toolRadar: '雷达 (250G)',
      toolShaft: '建造矿井 (300G)',
      toolMiner: '雇佣矿工 (150G)',
      toolTunnel: '挖掘坑道 (20G)',
      toolTank: '储金仓库 (400G)',
      btnShop: '科技研究室',
      modalShopTitle: '淘金科技研究所',
      shopTitlePickaxe: '矿工挖矿与运金加速',
      shopDescPickaxe: '矿工挥镐速度与推运速度提升 60%',
      shopTitleCart: '矿车载重扩容',
      shopDescCart: '矿工单次拉运黄金容量提升 100%',
      shopTitleWarehouse: '储金仓库像素压制',
      shopDescWarehouse: '储金上限提升 100%',
      taskTitle: '当前任务',
      taskCompleted: '所有任务已全部完成！',
      q1: '探明 2 个黄金矿脉',
      q2: '挖掘 3 条地下坑道',
      q3: '雇佣 2 名下矿矿工',
      q4: '累计采出 400 oz 黄金',
      q5: '黄金销售总额达到 1200 G'
    },
    en: {
      appTitle: 'Gold Turmoil',
      lblMoney: 'MONEY',
      lblStorage: 'GOLD STORAGE',
      lblSeason: 'SEASON TIME',
      marketWest: 'West Exchange',
      marketEast: 'East Exchange',
      valveWest: 'Call Gold Truck',
      valveEast: 'Call Gold Truck',
      boostWest: 'Boost Market (150G)',
      boostEast: 'Boost Market (150G)',
      groupProspect: 'Prospecting',
      groupMining: 'Mining Facilities',
      toolProspector: 'Prospector (100G)',
      toolRadar: 'Radar Scan (250G)',
      toolShaft: 'Mine Shaft (300G)',
      toolMiner: 'Hire Miner (150G)',
      toolTunnel: 'Dig Tunnel (20G)',
      toolTank: 'Gold Warehouse (400G)',
      btnShop: 'Tech Lab',
      modalShopTitle: 'Gold Tech Research Lab',
      shopTitlePickaxe: 'Miner Speed Boost',
      shopDescPickaxe: 'Increase mining swing and haul speed by 60%',
      shopTitleCart: 'Minecart Upgrade',
      shopDescCart: 'Double minecart gold hauling capacity',
      shopTitleWarehouse: 'Warehouse Expansion',
      shopDescWarehouse: 'Increase gold storage capacity by 100%',
      taskTitle: 'CURRENT TASK',
      taskCompleted: 'All Quests Completed!',
      q1: 'Discover 2 Gold Veins',
      q2: 'Dig 3 Underground Tunnels',
      q3: 'Hire 2 Underground Miners',
      q4: 'Mine 400 oz Gold Total',
      q5: 'Earn 1200 G Gold Revenue'
    }
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
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    }

    playPickaxe() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
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

    playQuestComplete() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      osc.frequency.setValueAtTime(1046.50, now + 0.3);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  }

  // Quests Configuration
  const QUEST_DEFINITIONS = [
    { id: 'q1', target: 2, reward: 350, type: 'discovered_count' },
    { id: 'q2', target: 3, reward: 250, type: 'tunnel_count' },
    { id: 'q3', target: 2, reward: 300, type: 'miner_count' },
    { id: 'q4', target: 400, reward: 500, type: 'mined_gold' },
    { id: 'q5', target: 1200, reward: 600, type: 'revenue' }
  ];

  // Visual Palette Presets
  const PALETTES = {
    classic: {
      sky: '#5c949d',
      grass: '#2d572e',
      grassLight: '#417343',
      topSoil: '#4a3321',
      midSoil: '#382516',
      deepSoil: '#26180e',
      goldBase: '#d4ac0d',
      goldFacet: '#f1c40f',
      goldGlow: 'rgba(241, 196, 15, 0.25)',
      minerShirt: '#e74c3c',
      minerPants: '#2c3e50',
      hardhat: '#f39c12'
    },
    cartoon: {
      sky: '#70c5ce',
      grass: '#48b84d',
      grassLight: '#62d667',
      topSoil: '#6e4a2d',
      midSoil: '#52351d',
      deepSoil: '#38210f',
      goldBase: '#ffc107',
      goldFacet: '#ffe082',
      goldGlow: 'rgba(255, 224, 130, 0.35)',
      minerShirt: '#ff5722',
      minerPants: '#1976d2',
      hardhat: '#ffeb3b'
    },
    dungeon: {
      sky: '#2c3e50',
      grass: '#1e382b',
      grassLight: '#2c523f',
      topSoil: '#2c2520',
      midSoil: '#1c1714',
      deepSoil: '#100d0b',
      goldBase: '#00e676',
      goldFacet: '#b9f6ca',
      goldGlow: 'rgba(0, 230, 118, 0.3)',
      minerShirt: '#9c27b0',
      minerPants: '#37474f',
      hardhat: '#00e676'
    }
  };

  // Main Game Engine
  class GoldTurmoilGame {
    constructor() {
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;

      this.audio = new ChiptuneAudio();

      this.currentLang = 'zh';
      this.currentTheme = 'classic';

      this.cash = CONFIG.INITIAL_CASH;
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
        minerSpeed: 1.0,
        cartCapacity: 1.0,
        tankExpand: 1.0
      };

      this.goldDeposits = [];
      this.prospectors = [];
      this.shafts = [];
      this.tunnels = [];
      this.miners = [];
      this.tanks = [];
      this.sonarRings = [];
      this.sparkleParticles = [];
      this.trucks = [];

      this.currentQuestIndex = 0;
      this.questProgress = 0;

      // Dynamic Markets with Wide Price Divergence and Periodic Closure timers
      this.markets = {
        west: { name: '华西', price: 42.0, change: 0, history: [42.0], valveOpen: false, trend: 'STABLE', closed: false, closeTimer: 0 },
        east: { name: '华东', price: 15.0, change: 0, history: [15.0], valveOpen: false, trend: 'STABLE', closed: false, closeTimer: 0 }
      };

      this.activeTunnelOrigin = null;
      this.mousePos = { x: 0, y: 0 };

      this.initUI();
      this.loadSavedGame() || this.resetGame();
      this.startLoop();
    }

    get storageCapacity() {
      // 0 Base + Shaft Storage Buffers + Warehouse Storage
      let cap = CONFIG.INITIAL_STORAGE_LIMIT;
      cap += this.shafts.length * CONFIG.SHAFT_STORAGE_BUFFER;
      this.tanks.forEach(() => {
        cap += 320 * this.upgrades.tankExpand;
      });
      return cap;
    }

    resetGame() {
      this.cash = CONFIG.INITIAL_CASH;
      this.storedGold = 0;
      this.totalMined = 0;
      this.totalRevenue = 0;
      this.totalExpenses = 0;
      this.currentMonth = 1;
      this.monthTimer = CONFIG.MONTH_SECONDS;
      this.isPaused = false;
      this.isGameOver = false;

      this.upgrades = { minerSpeed: 1.0, cartCapacity: 1.0, tankExpand: 1.0 };
      this.prospectors = [];
      this.shafts = [];
      this.tunnels = [];
      this.miners = [];
      this.tanks = [];
      this.sonarRings = [];
      this.sparkleParticles = [];
      this.trucks = [];
      this.activeTunnelOrigin = null;

      this.currentQuestIndex = 0;
      this.questProgress = 0;

      this.markets.west = { name: '华西', price: 42.0, change: 0, history: [42.0], valveOpen: false, trend: 'STABLE', closed: false, closeTimer: 0 };
      this.markets.east = { name: '华东', price: 15.0, change: 0, history: [15.0], valveOpen: false, trend: 'STABLE', closed: false, closeTimer: 0 };

      this.generateGoldDeposits();
      this.updateUI();
    }

    generateGoldDeposits() {
      this.goldDeposits = [];
      const count = 15 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        const x = 60 + Math.random() * (CONFIG.CANVAS_WIDTH - 120);
        const y = CONFIG.GROUND_Y + 45 + Math.random() * (CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_Y - 85);
        const radius = 14 + Math.random() * 18;
        const amount = Math.floor(radius * 28 + Math.random() * 200);

        this.goldDeposits.push({
          x: Math.floor(x),
          y: Math.floor(y),
          radius: Math.floor(radius),
          initialAmount: amount,
          amount,
          discovered: false,
          sparkleTimer: Math.random() * 2
        });
      }
    }

    initUI() {
      document.getElementById('btn-lang-toggle').addEventListener('click', () => {
        this.currentLang = this.currentLang === 'zh' ? 'en' : 'zh';
        this.updateLocalization();
        this.showToast(this.currentLang === 'zh' ? '已切换至中文' : 'Switched to English');
      });

      document.getElementById('select-visual-theme').addEventListener('change', (e) => {
        this.currentTheme = e.target.value;
        const container = document.getElementById('game-container');
        container.className = `pixel-panel theme-${this.currentTheme}`;
        this.showToast(`Visual Scheme: ${e.target.options[e.target.selectedIndex].text}`);
      });

      document.querySelectorAll('.tool-btn[data-tool]').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.tool-btn[data-tool]').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.selectedTool = btn.getAttribute('data-tool');
          this.activeTunnelOrigin = null;

          if (this.selectedTool === 'tunnel') {
            this.showToast(this.currentLang === 'zh' ? '【提示】第一步: 点击矿井或已有坑道节点；第二步: 点击金矿完成挖掘！' : '【Hint】Step 1: Click Shaft Node. Step 2: Click Gold Vein!');
          } else {
            this.showToast(`Tool: ${this.selectedTool.toUpperCase()}`);
          }
        });
      });

      document.getElementById('btn-quick-add').addEventListener('click', () => {
        this.cash += 100;
        this.showToast('+100 G Funds Added');
        this.updateUI();
      });

      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = CONFIG.CANVAS_WIDTH / rect.width;
        const scaleY = CONFIG.CANVAS_HEIGHT / rect.height;
        this.mousePos.x = Math.floor((e.clientX - rect.left) * scaleX);
        this.mousePos.y = Math.floor((e.clientY - rect.top) * scaleY);
      });

      this.canvas.addEventListener('click', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = CONFIG.CANVAS_WIDTH / rect.width;
        const scaleY = CONFIG.CANVAS_HEIGHT / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);
        this.handleCanvasClick(x, y);
      });

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

      const workflowModal = document.getElementById('workflow-modal');
      document.getElementById('btn-workflow').addEventListener('click', () => workflowModal.classList.remove('hidden'));
      document.getElementById('btn-close-workflow').addEventListener('click', () => workflowModal.classList.add('hidden'));

      const shopModal = document.getElementById('shop-modal');
      document.getElementById('btn-open-shop').addEventListener('click', () => shopModal.classList.remove('hidden'));
      document.getElementById('btn-close-shop').addEventListener('click', () => shopModal.classList.add('hidden'));

      document.getElementById('west-valve-toggle').addEventListener('change', (e) => {
        this.markets.west.valveOpen = e.target.checked;
        if (e.target.checked) this.spawnTruck('west');
      });
      document.getElementById('east-valve-toggle').addEventListener('change', (e) => {
        this.markets.east.valveOpen = e.target.checked;
        if (e.target.checked) this.spawnTruck('east');
      });

      document.getElementById('btn-west-boost').addEventListener('click', () => this.boostMarket('west'));
      document.getElementById('btn-east-boost').addEventListener('click', () => this.boostMarket('east'));

      document.querySelectorAll('.btn-buy').forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-upgrade');
          const cost = parseInt(btn.getAttribute('data-cost'));
          this.buyUpgrade(key, cost, btn);
        });
      });

      document.getElementById('btn-restart').addEventListener('click', () => {
        document.getElementById('settlement-modal').classList.add('hidden');
        this.resetGame();
      });

      this.updateLocalization();
    }

    spawnTruck(marketKey) {
      if (this.markets[marketKey].closed) {
        this.showToast(this.currentLang === 'zh' ? '交易所休市中！卡车无法派往此市场！' : 'Market CLOSED! Cannot dispatch truck!');
        return;
      }
      if (this.storedGold <= 0) {
        this.showToast(this.currentLang === 'zh' ? '储金库为空，暂无黄金可送！' : 'No gold in storage to haul!');
        return;
      }
      const side = marketKey === 'west' ? 'left' : 'right';
      this.trucks.push({
        side,
        x: side === 'left' ? -40 : CONFIG.CANVAS_WIDTH + 40,
        y: CONFIG.GROUND_Y - 14,
        targetX: side === 'left' ? 120 : CONFIG.CANVAS_WIDTH - 120,
        state: 'APPROACHING',
        loadProgress: 0,
        marketKey
      });
      this.showToast(this.currentLang === 'zh' ? `输金卡车开往${this.markets[marketKey].name}！` : `Gold Truck heading to ${this.markets[marketKey].name}!`);
    }

    updateLocalization() {
      const t = TRANSLATIONS[this.currentLang];
      document.getElementById('txt-app-title').innerHTML = `<i class="fa-solid fa-gem icon-gold"></i> ${t.appTitle}`;
      document.getElementById('lbl-money').innerText = t.lblMoney;
      document.getElementById('lbl-storage').innerText = t.lblStorage;
      document.getElementById('lbl-season').innerText = t.lblSeason;
      document.getElementById('txt-market-west').innerText = t.marketWest;
      document.getElementById('txt-market-east').innerText = t.marketEast;
      document.getElementById('txt-valve-west').innerText = t.valveWest;
      document.getElementById('txt-valve-east').innerText = t.valveEast;
      document.getElementById('txt-boost-west').innerText = t.boostWest;
      document.getElementById('txt-boost-east').innerText = t.boostEast;

      document.getElementById('txt-group-prospect').innerText = t.groupProspect;
      document.getElementById('txt-group-mining').innerText = t.groupMining;
      document.getElementById('txt-tool-prospector').innerText = t.toolProspector;
      document.getElementById('txt-tool-radar').innerText = t.toolRadar;
      document.getElementById('txt-tool-shaft').innerText = t.toolShaft;
      document.getElementById('txt-tool-miner').innerText = t.toolMiner;
      document.getElementById('txt-tool-tunnel').innerText = t.toolTunnel;
      document.getElementById('txt-tool-tank').innerText = t.toolTank;
      document.getElementById('txt-btn-shop').innerText = t.btnShop;
      document.getElementById('txt-modal-shop-title').innerText = t.modalShopTitle;

      document.getElementById('shop-title-pickaxe').innerText = t.shopTitlePickaxe;
      document.getElementById('shop-desc-pickaxe').innerText = t.shopDescPickaxe;
      document.getElementById('shop-title-cart').innerText = t.shopTitleCart;
      document.getElementById('shop-desc-cart').innerText = t.shopDescCart;
      document.getElementById('shop-title-warehouse').innerText = t.shopTitleWarehouse;
      document.getElementById('shop-desc-warehouse').innerText = t.shopDescWarehouse;

      document.getElementById('txt-task-title').innerText = t.taskTitle;
      this.updateUI();
    }

    boostMarket(key) {
      if (this.cash < 150) {
        this.showToast(this.currentLang === 'zh' ? '资金不足 (需要 150G)' : 'Not enough Money (150G needed)');
        return;
      }
      this.audio.init();
      this.cash -= 150;
      this.totalExpenses += 150;
      this.markets[key].price += 12.0 + Math.random() * 8;
      this.markets[key].trend = 'BOOMING';
      this.audio.playUpgrade();
      this.showToast(this.currentLang === 'zh' ? '散布利好成功！金价暴涨！' : 'Market Boosted!');
      this.updateUI();
    }

    buyUpgrade(key, cost, btn) {
      if (this.cash < cost) {
        this.showToast(this.currentLang === 'zh' ? '资金不足无法研发！' : 'Not enough Money!');
        return;
      }
      this.audio.init();
      this.cash -= cost;
      this.totalExpenses += cost;
      this.audio.playUpgrade();

      if (key === 'minerSpeed') this.upgrades.minerSpeed = 1.6;
      if (key === 'cartCapacity') this.upgrades.cartCapacity = 2.0;
      if (key === 'tankExpand') {
        this.upgrades.tankExpand = 2.0;
      }

      btn.disabled = true;
      btn.innerText = this.currentLang === 'zh' ? '已研发' : 'RESEARCHED';
      this.showToast(this.currentLang === 'zh' ? '科技研发成功！' : 'Upgrade Researched!');
      this.updateUI();
    }

    handleCanvasClick(x, y) {
      this.audio.init();

      if (this.selectedTool === 'prospector') {
        if (y > CONFIG.GROUND_Y) {
          this.showToast(this.currentLang === 'zh' ? '探矿员必须在地面出发！' : 'Prospector must start on surface!');
          return;
        }
        if (this.cash < 100) {
          this.showToast(this.currentLang === 'zh' ? '需要 100G 资金' : 'Need 100G for Prospector');
          return;
        }
        this.cash -= 100;
        this.totalExpenses += 100;
        this.audio.playPickaxe();
        this.prospectors.push({
          x,
          y: CONFIG.GROUND_Y - 8,
          dir: Math.random() < 0.5 ? -1 : 1,
          scanRadius: 8,
          maxScanRadius: 70,
          walkFrame: 0
        });
        this.showToast(this.currentLang === 'zh' ? '探矿员出发巡逻！向地下发射探测声波！' : 'Prospector deployed!');
      } else if (this.selectedTool === 'radar') {
        if (this.cash < 250) {
          this.showToast(this.currentLang === 'zh' ? '需要 250G 资金' : 'Need 250G for Radar');
          return;
        }
        this.cash -= 250;
        this.totalExpenses += 250;
        this.audio.playSonar();
        this.sonarRings.push({ x, y, r: 8, maxR: 110, alpha: 1.0 });

        this.goldDeposits.forEach((dep) => {
          if (Math.hypot(dep.x - x, dep.y - y) <= 110) {
            dep.discovered = true;
          }
        });
        this.showToast(this.currentLang === 'zh' ? '超声雷达扫出黄金！' : 'Radar Scan Discovered Gold!');
      } else if (this.selectedTool === 'shaft') {
        if (y > CONFIG.GROUND_Y + 15) {
          this.showToast(this.currentLang === 'zh' ? '采矿井入口必须建造在地面！' : 'Mine shaft must be built on surface!');
          return;
        }
        if (this.cash < 300) {
          this.showToast(this.currentLang === 'zh' ? '需要 300G 资金' : 'Need 300G for Mine Shaft');
          return;
        }
        this.cash -= 300;
        this.totalExpenses += 300;
        this.audio.playPickaxe();
        this.shafts.push({ x, y: CONFIG.GROUND_Y });
        this.showToast(this.currentLang === 'zh' ? '采矿井建成！提供 +50oz 基础储存容量！点击【挖掘坑道】连接地下金矿！' : 'Mine Shaft Built (+50oz storage)!');
      } else if (this.selectedTool === 'miner') {
        if (this.shafts.length === 0) {
          this.showToast(this.currentLang === 'zh' ? '请先建造采矿井入口！' : 'Build a Mine Shaft first!');
          return;
        }
        if (this.cash < 150) {
          this.showToast(this.currentLang === 'zh' ? '需要 150G 资金' : 'Need 150G to hire Miner');
          return;
        }
        this.cash -= 150;
        this.totalExpenses += 150;
        this.audio.playPickaxe();

        let nearestShaft = this.shafts[0];
        let minDist = Math.hypot(nearestShaft.x - x, nearestShaft.y - y);
        this.shafts.forEach((s) => {
          const d = Math.hypot(s.x - x, s.y - y);
          if (d < minDist) {
            minDist = d;
            nearestShaft = s;
          }
        });

        this.miners.push({
          x,
          y: CONFIG.GROUND_Y - 8,
          shaftX: nearestShaft.x,
          state: 'WALKING_TO_SHAFT',
          targetGoldIndex: -1,
          goldCarried: 0,
          maxCarried: 30 * this.upgrades.cartCapacity,
          digProgress: 0,
          pickAngle: 0,
          wheelAngle: 0
        });
        this.showToast(this.currentLang === 'zh' ? '矿工放置成功，前往最近矿井下矿！' : 'Miner hired and heading to nearest shaft!');
      } else if (this.selectedTool === 'tunnel') {
        if (!this.activeTunnelOrigin) {
          const nearestShaft = this.shafts.find((s) => Math.hypot(s.x - x, s.y - y) < 32);
          if (nearestShaft) {
            this.activeTunnelOrigin = { x: nearestShaft.x, y: nearestShaft.y };
            this.showToast(this.currentLang === 'zh' ? '已选中起点矿井！现在请点击地下金矿开凿坑道！' : 'Origin Shaft selected!');
          } else {
            const nearestTunnelNode = this.tunnels.find((t) => Math.hypot(t.x2 - x, t.y2 - y) < 24);
            if (nearestTunnelNode) {
              this.activeTunnelOrigin = { x: nearestTunnelNode.x2, y: nearestTunnelNode.y2 };
              this.showToast(this.currentLang === 'zh' ? '已选中坑道节点！继续延伸连接金矿！' : 'Tunnel node selected!');
            } else {
              this.showToast(this.currentLang === 'zh' ? '请先点击高亮圈中的采矿井入口或已有坑道！' : 'Click a Shaft or Tunnel origin node first!');
            }
          }
        } else {
          if (y <= CONFIG.GROUND_Y) {
            this.showToast(this.currentLang === 'zh' ? '坑道只能在地下挖掘！' : 'Tunnels must be underground!');
            return;
          }
          const dist = Math.hypot(x - this.activeTunnelOrigin.x, y - this.activeTunnelOrigin.y);
          const cost = Math.ceil((dist / 10) * 20);

          if (this.cash < cost) {
            this.showToast(this.currentLang === 'zh' ? `资金不足 (需要 ${cost}G)` : `Need ${cost}G for tunnel!`);
            return;
          }

          this.cash -= cost;
          this.totalExpenses += cost;
          this.audio.playPickaxe();

          let hitIndex = -1;
          this.goldDeposits.forEach((dep, idx) => {
            if (Math.hypot(dep.x - x, dep.y - y) <= dep.radius + 8) {
              hitIndex = idx;
              dep.discovered = true;
            }
          });

          this.tunnels.push({
            x1: this.activeTunnelOrigin.x,
            y1: this.activeTunnelOrigin.y,
            x2: x,
            y2: y,
            connectedIndex: hitIndex
          });

          if (hitIndex !== -1) {
            this.showToast(this.currentLang === 'zh' ? '坑道通往金矿！雇佣矿工开始探采金矿！' : 'Tunnel connected to Gold!');
          } else {
            this.showToast(this.currentLang === 'zh' ? `坑道已开凿 (-${cost}G)` : `Tunnel Segment Built (-${cost}G)`);
          }

          this.activeTunnelOrigin = { x, y };
        }
      } else if (this.selectedTool === 'tank') {
        if (y > CONFIG.GROUND_Y + 15) {
          this.showToast(this.currentLang === 'zh' ? '储金仓库必须建造在地面！' : 'Warehouse must be on surface!');
          return;
        }
        if (this.cash < 400) {
          this.showToast(this.currentLang === 'zh' ? '需要 400G 资金' : 'Need 400G for Warehouse');
          return;
        }
        this.cash -= 400;
        this.totalExpenses += 400;
        this.audio.playPickaxe();
        this.tanks.push({ x, y: CONFIG.GROUND_Y - 20 });
        this.showToast(this.currentLang === 'zh' ? '储金仓库建成！扩展巨大黄金容量！' : 'Warehouse Built!');
      }

      this.checkQuestProgress();
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
      this.monthTimer -= dt;
      if (this.monthTimer <= 0) {
        this.monthTimer = CONFIG.MONTH_SECONDS;
        this.currentMonth++;
        if (this.currentMonth > CONFIG.TOTAL_MONTHS) {
          this.triggerSettlement();
          return;
        }
      }

      // Update Dynamic Markets with Closure Timers & Price Divergence
      ['west', 'east'].forEach((mKey) => {
        const m = this.markets[mKey];

        // Random market closure events
        if (m.closeTimer > 0) {
          m.closeTimer -= dt;
          if (m.closeTimer <= 0) {
            m.closed = false;
            m.trend = 'STABLE';
            this.showToast(this.currentLang === 'zh' ? `${m.name}恢复开市交易！` : `${m.name} Exchange Reopened!`);
          }
        } else if (Math.random() < 0.005) {
          m.closed = true;
          m.closeTimer = 10 + Math.random() * 10;
          m.trend = 'CLOSED';
          m.valveOpen = false;
          this.showToast(this.currentLang === 'zh' ? `🚨 警告: ${m.name}暂时休市暂停交易！` : `🚨 Warning: ${m.name} Exchange CLOSED!`);
        }

        if (!m.closed) {
          // Divergent pricing logic (West high $30-55, East low $10-25)
          const targetMean = mKey === 'west' ? 42.0 : 18.0;
          const delta = (Math.random() - 0.48) * 0.8;
          m.price = Math.max(8, Math.min(65, m.price + delta + (targetMean - m.price) * 0.01));

          if (Math.random() < 0.04) {
            m.history.push(m.price);
            if (m.history.length > 20) m.history.shift();
            const prev = m.history[m.history.length - 2] || m.price;
            const diff = m.price - prev;
            m.change = diff;
            if (diff > 0.8) m.trend = 'RISING';
            else if (diff < -0.8) m.trend = 'FALLING';
            else m.trend = 'STABLE';
          }
        }
      });

      this.updateGoldTrucks(dt);

      this.prospectors.forEach((p) => {
        p.x += p.dir * 20 * dt;
        p.walkFrame = (p.walkFrame + 10 * dt) % 1;
        if (p.x < 30 || p.x > CONFIG.CANVAS_WIDTH - 30) p.dir *= -1;

        p.scanRadius += 35 * dt;
        if (p.scanRadius > p.maxScanRadius) p.scanRadius = 8;

        this.goldDeposits.forEach((dep) => {
          if (!dep.discovered && Math.hypot(dep.x - p.x, dep.y - (CONFIG.GROUND_Y + 30)) < p.scanRadius) {
            dep.discovered = true;
            this.audio.playSonar();
            this.showToast(this.currentLang === 'zh' ? '探矿员探明地下金矿！' : 'Prospector found Gold!');
            this.checkQuestProgress();
          }
        });
      });

      this.updateHumanMiners(dt);

      for (let i = this.sparkleParticles.length - 1; i >= 0; i--) {
        const sp = this.sparkleParticles[i];
        sp.alpha -= 1.2 * dt;
        if (sp.alpha <= 0) this.sparkleParticles.splice(i, 1);
      }

      this.checkQuestProgress();
      this.updateUI();
    }

    updateGoldTrucks(dt) {
      for (let i = this.trucks.length - 1; i >= 0; i--) {
        const tr = this.trucks[i];
        const moveSpeed = 80 * dt;

        if (tr.state === 'APPROACHING') {
          const dx = tr.targetX - tr.x;
          if (Math.abs(dx) > 4) {
            tr.x += Math.sign(dx) * moveSpeed;
          } else {
            tr.state = 'LOADING';
            tr.loadProgress = 0;
          }
        } else if (tr.state === 'LOADING') {
          tr.loadProgress += dt;
          if (this.storedGold > 0) {
            const loadRate = Math.min(this.storedGold, 25 * dt);
            this.storedGold -= loadRate;
            const rev = loadRate * this.markets[tr.marketKey].price;
            this.cash += rev;
            this.totalRevenue += rev;
            if (Math.random() < 0.1) this.audio.playCoin();
          }
          if (tr.loadProgress >= 2.0 || this.storedGold <= 0) {
            tr.state = 'DEPARTING';
          }
        } else if (tr.state === 'DEPARTING') {
          const exitTarget = tr.side === 'left' ? -60 : CONFIG.CANVAS_WIDTH + 60;
          const dx = exitTarget - tr.x;
          if (Math.abs(dx) > 6) {
            tr.x += Math.sign(dx) * moveSpeed;
          } else {
            this.trucks.splice(i, 1);
          }
        }
      }
    }

    // Find path of waypoints along shafts and tunnels to target position/gold
    buildTunnelPathForMiner(miner, targetGold) {
      // Build network graph
      const nodes = [];
      const getNodeIndex = (x, y) => {
        const found = nodes.findIndex((n) => Math.hypot(n.x - x, n.y - y) < 8);
        if (found !== -1) return found;
        nodes.push({ x, y, neighbors: [] });
        return nodes.length - 1;
      };

      // Add shaft nodes: Top (s.x, GROUND_Y - 8) -> Bottom (s.x, GROUND_Y + 30)
      let shaftTopIdx = -1;
      let shaftBotIdx = -1;
      this.shafts.forEach((s) => {
        const top = getNodeIndex(s.x, CONFIG.GROUND_Y - 8);
        const bot = getNodeIndex(s.x, CONFIG.GROUND_Y + 30);
        nodes[top].neighbors.push({ nodeIdx: bot, dist: 38 });
        nodes[bot].neighbors.push({ nodeIdx: top, dist: 38 });

        if (Math.abs(s.x - miner.shaftX) < 10) {
          shaftTopIdx = top;
          shaftBotIdx = bot;
        }
      });

      // Add tunnel edges
      this.tunnels.forEach((t) => {
        const n1 = getNodeIndex(t.x1, t.y1);
        const n2 = getNodeIndex(t.x2, t.y2);
        const dist = Math.hypot(t.x1 - t.x2, t.y1 - t.y2);
        nodes[n1].neighbors.push({ nodeIdx: n2, dist });
        nodes[n2].neighbors.push({ nodeIdx: n1, dist });
      });

      // Find current start node nearest to miner
      let startIdx = 0;
      let minDistStart = Infinity;
      nodes.forEach((n, idx) => {
        const d = Math.hypot(n.x - miner.x, n.y - miner.y);
        if (d < minDistStart) {
          minDistStart = d;
          startIdx = idx;
        }
      });

      // Target node nearest to target gold
      let targetIdx = startIdx;
      let minDistTarget = Infinity;
      nodes.forEach((n, idx) => {
        const d = Math.hypot(n.x - targetGold.x, n.y - targetGold.y);
        if (d < minDistTarget) {
          minDistTarget = d;
          targetIdx = idx;
        }
      });

      // Dijkstra algorithm for shortest path along tunnel graph
      const dists = new Array(nodes.length).fill(Infinity);
      const prev = new Array(nodes.length).fill(-1);
      const visited = new Array(nodes.length).fill(false);

      dists[startIdx] = 0;

      for (let i = 0; i < nodes.length; i++) {
        let u = -1;
        let bestD = Infinity;
        for (let j = 0; j < nodes.length; j++) {
          if (!visited[j] && dists[j] < bestD) {
            bestD = dists[j];
            u = j;
          }
        }

        if (u === -1 || u === targetIdx) break;
        visited[u] = true;

        nodes[u].neighbors.forEach((edge) => {
          if (!visited[edge.nodeIdx]) {
            const alt = dists[u] + edge.dist;
            if (alt < dists[edge.nodeIdx]) {
              dists[edge.nodeIdx] = alt;
              prev[edge.nodeIdx] = u;
            }
          }
        });
      }

      // Reconstruct path
      const path = [];
      let curr = targetIdx;
      while (curr !== -1) {
        path.unshift({ x: nodes[curr].x, y: nodes[curr].y });
        curr = prev[curr];
      }

      // Append exact gold location if valid
      if (path.length > 0) {
        path.push({ x: targetGold.x, y: targetGold.y });
      }

      return path;
    }

    updateHumanMiners(dt) {
      const connectedGoldIndices = this.tunnels
        .filter((t) => t.connectedIndex !== -1)
        .map((t) => t.connectedIndex);

      this.miners.forEach((m) => {
        const moveSpeed = 45 * this.upgrades.minerSpeed * dt;

        if (m.state === 'WALKING_TO_SHAFT') {
          // Walk on surface towards nearest shaft x
          const dx = m.shaftX - m.x;
          if (Math.abs(dx) > 4) {
            m.x += Math.sign(dx) * moveSpeed;
            m.y = CONFIG.GROUND_Y - 8;
          } else {
            // Reached shaft top -> Fall into shaft
            m.x = m.shaftX;
            m.state = 'FALLING_INTO_SHAFT';
          }
        } else if (m.state === 'FALLING_INTO_SHAFT') {
          // Fall / descend directly down the vertical mine shaft
          const targetY = CONFIG.GROUND_Y + 30;
          if (m.y < targetY) {
            m.y += moveSpeed * 1.5; // Accelerate fall into shaft
          } else {
            m.y = targetY;
            m.state = 'IDLE';
          }
        } else if (m.state === 'IDLE') {
          const validIndex = connectedGoldIndices.find(
            (idx) => this.goldDeposits[idx] && this.goldDeposits[idx].amount > 0
          );

          if (validIndex !== undefined) {
            m.targetGoldIndex = validIndex;
            const targetGold = this.goldDeposits[validIndex];
            m.path = this.buildTunnelPathForMiner(m, targetGold);
            m.pathIndex = 0;
            m.state = 'MOVING_ALONG_TUNNEL';
          }
        } else if (m.state === 'MOVING_ALONG_TUNNEL') {
          const gold = this.goldDeposits[m.targetGoldIndex];
          if (!gold || gold.amount <= 0) {
            // Replan to haul back
            m.path = this.buildTunnelPathForMiner(m, { x: m.shaftX, y: CONFIG.GROUND_Y - 8 });
            m.pathIndex = 0;
            m.state = 'HAULING_BACK';
            return;
          }

          if (!m.path || m.pathIndex >= m.path.length) {
            m.state = 'DIGGING';
            m.digProgress = 0;
            return;
          }

          const targetWay = m.path[m.pathIndex];
          const dx = targetWay.x - m.x;
          const dy = targetWay.y - m.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 4) {
            m.x += (dx / dist) * moveSpeed;
            m.y += (dy / dist) * moveSpeed;
            m.wheelAngle += 10 * dt;
          } else {
            m.pathIndex++;
            if (m.pathIndex >= m.path.length) {
              m.state = 'DIGGING';
              m.digProgress = 0;
            }
          }
        } else if (m.state === 'DIGGING') {
          const gold = this.goldDeposits[m.targetGoldIndex];
          m.pickAngle = (m.pickAngle + 12 * dt) % (Math.PI * 2);

          if (Math.random() < 0.05) this.audio.playPickaxe();

          const digAmount = 15 * dt;
          const actualDug = Math.min(gold ? gold.amount : 0, digAmount);

          if (gold) gold.amount -= actualDug;
          m.goldCarried += actualDug;
          this.totalMined += actualDug;

          if (m.goldCarried >= m.maxCarried || !gold || gold.amount <= 0) {
            m.path = this.buildTunnelPathForMiner(m, { x: m.shaftX, y: CONFIG.GROUND_Y - 8 });
            m.pathIndex = 0;
            m.state = 'HAULING_BACK';
          }
        } else if (m.state === 'HAULING_BACK') {
          if (!m.path || m.pathIndex >= m.path.length) {
            // Arrived at shaft surface top
            m.y = CONFIG.GROUND_Y - 8;
            const spaceLeft = this.storageCapacity - this.storedGold;

            if (spaceLeft > 0) {
              const depositAmount = Math.min(spaceLeft, m.goldCarried);
              this.storedGold += depositAmount;
              m.goldCarried -= depositAmount;
            } else {
              this.showToast(this.currentLang === 'zh' ? '⚠️ 黄金库存已满！建造储金仓库以防止溢出！' : '⚠️ Storage Full! Build Warehouses!');
            }

            if (m.goldCarried <= 0) {
              m.state = 'FALLING_INTO_SHAFT'; // Fall back into shaft for next trip
            }
            return;
          }

          const targetWay = m.path[m.pathIndex];
          const dx = targetWay.x - m.x;
          const dy = targetWay.y - m.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 4) {
            m.x += (dx / dist) * moveSpeed;
            m.y += (dy / dist) * moveSpeed;
            m.wheelAngle += 10 * dt;
          } else {
            m.pathIndex++;
            if (m.pathIndex >= m.path.length) {
              // Deposit gold at shaft top
              m.y = CONFIG.GROUND_Y - 8;
              const spaceLeft = this.storageCapacity - this.storedGold;

              if (spaceLeft > 0) {
                const depositAmount = Math.min(spaceLeft, m.goldCarried);
                this.storedGold += depositAmount;
                m.goldCarried -= depositAmount;
              } else {
                this.showToast(this.currentLang === 'zh' ? '⚠️ 黄金库存已满！建造储金仓库以防止溢出！' : '⚠️ Storage Full! Build Warehouses!');
              }

              if (m.goldCarried <= 0) {
                m.state = 'FALLING_INTO_SHAFT'; // Fall back into shaft for next trip
              }
            }
          }
        }
      });
    }

    checkQuestProgress() {
      if (this.currentQuestIndex >= QUEST_DEFINITIONS.length) return;

      const q = QUEST_DEFINITIONS[this.currentQuestIndex];
      let val = 0;

      if (q.type === 'discovered_count') {
        val = this.goldDeposits.filter((d) => d.discovered).length;
      } else if (q.type === 'tunnel_count') {
        val = this.tunnels.length;
      } else if (q.type === 'miner_count') {
        val = this.miners.length;
      } else if (q.type === 'mined_gold') {
        val = Math.floor(this.totalMined);
      } else if (q.type === 'revenue') {
        val = Math.floor(this.totalRevenue);
      }

      this.questProgress = Math.min(val, q.target);

      if (val >= q.target) {
        this.audio.playQuestComplete();
        this.cash += q.reward;
        this.showToast(this.currentLang === 'zh' ? `任务完成！+${q.reward}G 奖励！` : `TASK COMPLETED! +${q.reward}G`);
        this.currentQuestIndex++;
        this.questProgress = 0;
      }
    }

    render() {
      const ctx = this.ctx;
      const palette = PALETTES[this.currentTheme] || PALETTES.classic;

      ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

      // Sky & Surface Grass
      ctx.fillStyle = palette.sky;
      ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.GROUND_Y);

      ctx.fillStyle = palette.grass;
      ctx.fillRect(0, CONFIG.GROUND_Y - 10, CONFIG.CANVAS_WIDTH, 14);
      ctx.fillStyle = palette.grassLight;
      ctx.fillRect(0, CONFIG.GROUND_Y - 10, CONFIG.CANVAS_WIDTH, 5);

      this.renderPixelDecorations(ctx);

      // Underground Strata
      const y1 = CONFIG.GROUND_Y + 4;
      const y2 = CONFIG.GROUND_Y + 130;
      const y3 = CONFIG.GROUND_Y + 260;

      ctx.fillStyle = palette.topSoil;
      ctx.fillRect(0, y1, CONFIG.CANVAS_WIDTH, y2 - y1);
      ctx.fillStyle = palette.midSoil;
      ctx.fillRect(0, y2, CONFIG.CANVAS_WIDTH, y3 - y2);
      ctx.fillStyle = palette.deepSoil;
      ctx.fillRect(0, y3, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT - y3);

      this.renderUndergroundRocks(ctx);

      // Tunnels
      this.tunnels.forEach((t) => {
        ctx.lineWidth = 14;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.moveTo(t.x1, t.y1);
        ctx.lineTo(t.x2, t.y2);
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#8e44ad';
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(t.x1, t.y1);
        ctx.lineTo(t.x2, t.y2);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Tunnel Tool Guidance
      if (this.selectedTool === 'tunnel') {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#f1c40f';
        this.shafts.forEach((s) => {
          ctx.beginPath();
          ctx.arc(s.x, s.y, 16 + Math.sin(Date.now() / 150) * 3, 0, Math.PI * 2);
          ctx.stroke();
        });

        if (this.activeTunnelOrigin) {
          ctx.strokeStyle = '#2ecc71';
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(this.activeTunnelOrigin.x, this.activeTunnelOrigin.y);
          ctx.lineTo(this.mousePos.x, this.mousePos.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Discovered Gold Nuggets
      this.goldDeposits.forEach((dep) => {
        if (dep.discovered) {
          const ratio = dep.amount / dep.initialAmount;
          if (dep.amount > 0) {
            const r = Math.max(6, dep.radius * ratio);

            ctx.fillStyle = palette.goldGlow;
            ctx.beginPath();
            ctx.arc(dep.x, dep.y, r + 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = palette.goldBase;
            ctx.beginPath();
            ctx.arc(dep.x, dep.y, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = palette.goldFacet;
            ctx.fillRect(dep.x - r * 0.5, dep.y - r * 0.5, r, r);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(dep.x - r * 0.2, dep.y - r * 0.2, r * 0.4, r * 0.4);

            ctx.fillStyle = '#ffffff';
            ctx.font = '11px "VT323", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.floor(dep.amount)}oz`, dep.x, dep.y + r + 12);
          } else {
            ctx.fillStyle = '#566573';
            ctx.beginPath();
            ctx.arc(dep.x, dep.y, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Shaft Entrances
      this.shafts.forEach((s) => {
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(s.x - 14, s.y - 24, 28, 24);

        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 3;
        ctx.strokeRect(s.x - 14, s.y - 24, 28, 24);

        ctx.fillStyle = '#d7ccc8';
        ctx.beginPath();
        ctx.arc(s.x, s.y - 12, 6, 0, Math.PI * 2);
        ctx.fill();

        // Internal Buffer Storage Label
        ctx.fillStyle = '#f1c40f';
        ctx.font = '10px "VT323", monospace';
        ctx.fillText('+50oz', s.x, s.y - 28);
      });

      // Human Miners
      this.miners.forEach((m) => {
        this.renderMinerSprite(ctx, m, palette);
      });

      // Gold Truck Vehicles
      this.trucks.forEach((tr) => {
        this.renderTruckSprite(ctx, tr);
      });

      // Warehouses
      this.tanks.forEach((t) => {
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(t.x - 16, t.y, 32, 20);
        ctx.fillStyle = '#d35400';
        ctx.fillRect(t.x - 14, t.y + 2, 28, 4);
      });

      // Prospectors
      this.prospectors.forEach((p) => {
        this.renderProspectorSprite(ctx, p, palette);
      });

      // Sonar Pulse Arc Waves
      this.prospectors.forEach((p) => {
        ctx.strokeStyle = 'rgba(241, 196, 15, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y + 10, p.scanRadius, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
      });

      // Radar Sonar Rings
      this.sonarRings.forEach((ring) => {
        ctx.strokeStyle = `rgba(52, 152, 219, ${ring.alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Sparklines
      this.renderMarketChart('west-chart', this.markets.west.history);
      this.renderMarketChart('east-chart', this.markets.east.history);
    }

    renderTruckSprite(ctx, tr) {
      ctx.save();
      ctx.translate(tr.x, tr.y);

      ctx.fillStyle = '#c0392b';
      ctx.fillRect(-18, -12, 36, 14);

      ctx.fillStyle = '#3498db';
      ctx.fillRect(tr.side === 'left' ? 6 : -16, -10, 8, 6);

      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(-12, -18, 24, 6);

      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(-10, 2, 4, 0, Math.PI * 2);
      ctx.arc(10, 2, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    renderMinerSprite(ctx, m, palette) {
      ctx.save();
      ctx.translate(m.x, m.y);

      ctx.fillStyle = palette.hardhat;
      ctx.fillRect(-6, -16, 12, 5);

      ctx.fillStyle = 'rgba(255, 241, 118, 0.35)';
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(24, -22);
      ctx.lineTo(24, -6);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffcc80';
      ctx.fillRect(-4, -11, 8, 5);
      ctx.fillStyle = '#212121';
      ctx.fillRect(2, -10, 2, 2);

      ctx.fillStyle = palette.minerShirt;
      ctx.fillRect(-5, -6, 10, 6);
      ctx.fillStyle = palette.minerPants;
      ctx.fillRect(-5, 0, 10, 6);

      ctx.fillStyle = '#3e2723';
      ctx.fillRect(-6, 6, 5, 4);
      ctx.fillRect(1, 6, 5, 4);

      if (m.state === 'DIGGING') {
        ctx.save();
        ctx.translate(3, -4);
        ctx.rotate(Math.sin(m.pickAngle) * 0.8);
        ctx.fillStyle = '#795548';
        ctx.fillRect(0, -2, 10, 2);
        ctx.fillStyle = '#e0e0e0';
        ctx.beginPath();
        ctx.arc(10, -1, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (m.goldCarried > 0) {
        ctx.fillStyle = '#37474f';
        ctx.fillRect(-12, 2, 12, 8);

        ctx.fillStyle = palette.goldFacet;
        ctx.fillRect(-10, -1, 8, 4);
        ctx.fillRect(-6, -3, 4, 3);

        ctx.save();
        ctx.translate(-10, 10);
        ctx.rotate(m.wheelAngle);
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(-2, 10);
        ctx.rotate(m.wheelAngle);
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }

    renderProspectorSprite(ctx, p, palette) {
      ctx.save();
      ctx.translate(p.x, p.y);

      ctx.fillStyle = '#5d4037';
      ctx.fillRect(-9, -12, 4, 8);

      ctx.fillStyle = '#f57f17';
      ctx.fillRect(-7, -18, 14, 4);

      ctx.fillStyle = palette.minerShirt;
      ctx.fillRect(-5, -14, 10, 8);
      ctx.fillStyle = '#37474f';
      ctx.fillRect(-5, -6, 10, 6);

      ctx.strokeStyle = '#fbc02d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(3, -8);
      ctx.lineTo(12, -4);
      ctx.stroke();

      ctx.restore();
    }

    renderPixelDecorations(ctx) {
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

    renderUndergroundRocks(ctx) {
      const rocks = [
        { x: 90, y: 140, w: 8, h: 6 },
        { x: 280, y: 190, w: 10, h: 8 },
        { x: 490, y: 160, w: 6, h: 6 },
        { x: 670, y: 220, w: 12, h: 8 },
        { x: 150, y: 310, w: 14, h: 10 },
        { x: 390, y: 380, w: 8, h: 8 },
        { x: 590, y: 350, w: 10, h: 6 }
      ];

      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      rocks.forEach((r) => {
        ctx.fillRect(r.x, r.y, r.w, r.h);
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

      // West Exchange UI & Closure Badge
      const wPriceEl = document.getElementById('west-price');
      const wBadge = document.getElementById('west-trend-badge');
      if (this.markets.west.closed) {
        wPriceEl.innerText = '休市 / CLOSED';
        wBadge.innerText = 'CLOSED';
        wBadge.style.color = '#e74c3c';
      } else {
        wPriceEl.innerText = this.markets.west.price.toFixed(1);
        wBadge.innerText = this.markets.west.trend;
        wBadge.style.color = '#2ecc71';
      }

      const wChg = document.getElementById('west-price-change');
      wChg.innerText = `${this.markets.west.change >= 0 ? '+' : ''}${this.markets.west.change.toFixed(1)}`;
      wChg.className = `price-change ${this.markets.west.change >= 0 ? 'up' : 'down'}`;

      // East Exchange UI & Closure Badge
      const ePriceEl = document.getElementById('east-price');
      const eBadge = document.getElementById('east-trend-badge');
      if (this.markets.east.closed) {
        ePriceEl.innerText = '休市 / CLOSED';
        eBadge.innerText = 'CLOSED';
        eBadge.style.color = '#e74c3c';
      } else {
        ePriceEl.innerText = this.markets.east.price.toFixed(1);
        eBadge.innerText = this.markets.east.trend;
        eBadge.style.color = '#2ecc71';
      }

      const eChg = document.getElementById('east-price-change');
      eChg.innerText = `${this.markets.east.change >= 0 ? '+' : ''}${this.markets.east.change.toFixed(1)}`;
      eChg.className = `price-change ${this.markets.east.change >= 0 ? 'up' : 'down'}`;

      const t = TRANSLATIONS[this.currentLang];
      if (this.currentQuestIndex < QUEST_DEFINITIONS.length) {
        const q = QUEST_DEFINITIONS[this.currentQuestIndex];
        document.getElementById('task-desc-text').innerText = t[q.id];
        document.getElementById('task-reward-text').innerText = `+${q.reward} G`;
        const pct = Math.floor((this.questProgress / q.target) * 100);
        document.getElementById('task-progress-fill').style.width = `${pct}%`;
        document.getElementById('task-progress-text').innerText = `${pct}%`;
      } else {
        document.getElementById('task-desc-text').innerText = t.taskCompleted;
        document.getElementById('task-reward-text').innerText = 'MAX';
        document.getElementById('task-progress-fill').style.width = '100%';
        document.getElementById('task-progress-text').innerText = '100%';
      }
    }

    showToast(msg) {
      const toast = document.getElementById('toast-message');
      toast.innerText = msg;
      toast.classList.remove('hidden');
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => toast.classList.add('hidden'), 2800);
    }

    saveGame() {
      const state = {
        cash: this.cash,
        storedGold: this.storedGold,
        totalMined: this.totalMined,
        totalRevenue: this.totalRevenue,
        totalExpenses: this.totalExpenses,
        currentMonth: this.currentMonth,
        currentQuestIndex: this.currentQuestIndex,
        currentLang: this.currentLang,
        currentTheme: this.currentTheme,
        upgrades: this.upgrades,
        goldDeposits: this.goldDeposits,
        shafts: this.shafts,
        tunnels: this.tunnels,
        miners: this.miners,
        tanks: this.tanks
      };
      localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(state));
      this.showToast(this.currentLang === 'zh' ? '游戏进度已保存！' : 'Game Saved!');
    }

    loadSavedGame() {
      try {
        const raw = localStorage.getItem(CONFIG.SAVE_KEY);
        if (!raw) return false;
        const state = JSON.parse(raw);
        this.cash = state.cash;
        this.storedGold = state.storedGold;
        this.totalMined = state.totalMined;
        this.totalRevenue = state.totalRevenue;
        this.totalExpenses = state.totalExpenses;
        this.currentMonth = state.currentMonth;
        this.currentQuestIndex = state.currentQuestIndex || 0;
        this.currentLang = state.currentLang || 'zh';
        this.currentTheme = state.currentTheme || 'classic';
        this.upgrades = state.upgrades || this.upgrades;
        this.goldDeposits = state.goldDeposits || [];
        this.shafts = state.shafts || [];
        this.tunnels = state.tunnels || [];
        this.miners = state.miners || [];
        this.tanks = state.tanks || [];

        const container = document.getElementById('game-container');
        container.className = `pixel-panel theme-${this.currentTheme}`;
        document.getElementById('select-visual-theme').value = this.currentTheme;

        this.updateLocalization();
        this.showToast(this.currentLang === 'zh' ? '已加载上次存档！' : 'Saved Game Loaded!');
        return true;
      } catch (e) {
        return false;
      }
    }

    triggerSettlement() {
      this.isGameOver = true;
      const totalNet = Math.floor(this.cash + this.storedGold * 25 - this.totalExpenses);

      document.getElementById('inv-gold-amount').innerText = Math.floor(this.totalMined);
      document.getElementById('inv-gold-total').innerText = Math.floor(this.totalMined * 25);
      document.getElementById('inv-revenue').innerText = Math.floor(this.totalRevenue);
      document.getElementById('inv-expenses').innerText = Math.floor(this.totalExpenses);

      const netEl = document.getElementById('inv-total-net');
      netEl.innerText = `${totalNet} G`;

      const stampEl = document.getElementById('invoice-stamp');
      if (totalNet >= 2500) {
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
    window.gameApp = new GoldTurmoilGame();
  });
})();

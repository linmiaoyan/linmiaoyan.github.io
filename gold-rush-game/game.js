/**
 * 黄金骚动 (Gold Turmoil Pixel Tycoon) - Pure JavaScript Engine
 * Features:
 * - Real Human Underground Miners with Pickaxes & Minecarts (authentic gold mining logic instead of oil pipes)
 * - 3 Selectable Visual Themes (Classic Pixel 8-Bit, Warm Cartoon, Dark Mining Dungeon)
 * - Full Chinese / English i18n Localization Toggle (Default Chinese)
 * - Web Audio Chiptune SFX, Dynamic Quests, LocalStorage Save/Load
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
    SAVE_KEY: 'GOLD_TURMOIL_SAVE_V3'
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
      valveWest: '开启输金卡车',
      valveEast: '开启输金卡车',
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
      valveWest: 'Gold Truck On',
      valveEast: 'Gold Truck On',
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
      minerCloth: '#e74c3c'
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
      minerCloth: '#ff5722'
    },
    dungeon: {
      sky: '#2c3e50',
      grass: '#1e382b',
      grassLight: '#2c523f',
      topSoil: '#2c2520',
      midSoil: '#1c1714',
      deepSoil: '#100d0b',
      goldBase: '#00e676', // Emerald fluorescent gold in dark dungeon
      goldFacet: '#b9f6ca',
      goldGlow: 'rgba(0, 230, 118, 0.3)',
      minerCloth: '#9c27b0'
    }
  };

  // Main Game Engine
  class GoldTurmoilGame {
    constructor() {
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;

      this.audio = new ChiptuneAudio();

      this.currentLang = 'zh'; // Default Chinese
      this.currentTheme = 'classic'; // Default Classic Pixel

      // Core Economy & Progress
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
        minerSpeed: 1.0,
        cartCapacity: 1.0,
        tankExpand: 1.0
      };

      // Entities
      this.goldDeposits = [];
      this.prospectors = [];
      this.shafts = []; // Vertical entrances
      this.tunnels = []; // Underground pathways connecting shafts to gold
      this.miners = []; // Human underground miners
      this.tanks = [];
      this.sonarRings = [];
      this.sparkleParticles = [];

      // Quests State
      this.currentQuestIndex = 0;
      this.questProgress = 0;

      // Markets
      this.markets = {
        west: { name: '华西', price: 45.0, change: 0, history: [45.0], valveOpen: false, trend: 'STABLE' },
        east: { name: '华东', price: 42.0, change: 0, history: [42.0], valveOpen: false, trend: 'STABLE' }
      };

      this.activeTunnelOrigin = null;

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

      this.upgrades = { minerSpeed: 1.0, cartCapacity: 1.0, tankExpand: 1.0 };
      this.prospectors = [];
      this.shafts = [];
      this.tunnels = [];
      this.miners = [];
      this.tanks = [];
      this.sonarRings = [];
      this.sparkleParticles = [];
      this.activeTunnelOrigin = null;

      this.currentQuestIndex = 0;
      this.questProgress = 0;

      this.markets.west = { name: '华西', price: 45.0, change: 0, history: [45.0], valveOpen: false, trend: 'STABLE' };
      this.markets.east = { name: '华东', price: 42.0, change: 0, history: [42.0], valveOpen: false, trend: 'STABLE' };

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
      // Language Toggle Button
      document.getElementById('btn-lang-toggle').addEventListener('click', () => {
        this.currentLang = this.currentLang === 'zh' ? 'en' : 'zh';
        this.updateLocalization();
        this.showToast(this.currentLang === 'zh' ? '已切换至中文' : 'Switched to English');
      });

      // Visual Theme Selector
      document.getElementById('select-visual-theme').addEventListener('change', (e) => {
        this.currentTheme = e.target.value;
        const container = document.getElementById('game-container');
        container.className = `pixel-panel theme-${this.currentTheme}`;
        this.showToast(`Visual Scheme: ${e.target.options[e.target.selectedIndex].text}`);
      });

      // Tool Select Buttons
      document.querySelectorAll('.tool-btn[data-tool]').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.tool-btn[data-tool]').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.selectedTool = btn.getAttribute('data-tool');
          this.activeTunnelOrigin = null;
          this.showToast(`Tool: ${this.selectedTool.toUpperCase()}`);
        });
      });

      document.getElementById('btn-quick-add').addEventListener('click', () => {
        this.cash += 100;
        this.showToast('+100 G Funds Added');
        this.updateUI();
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
      });
      document.getElementById('east-valve-toggle').addEventListener('change', (e) => {
        this.markets.east.valveOpen = e.target.checked;
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
      this.markets[key].price += 15.0 + Math.random() * 10;
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
        this.storageCapacity *= 2;
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
          maxScanRadius: 70
        });
        this.showToast(this.currentLang === 'zh' ? '探矿员出发巡逻！' : 'Prospector deployed!');
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
        this.showToast(this.currentLang === 'zh' ? '采矿井建成！请使用坑道连接地下金矿！' : 'Mine Shaft Built!');
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

        // Assign miner to first available shaft
        const shaft = this.shafts[0];
        this.miners.push({
          x: shaft.x,
          y: shaft.y,
          shaftX: shaft.x,
          state: 'IDLE', // IDLE, WALKING_TO_GOLD, DIGGING, HAULING_BACK
          targetGoldIndex: -1,
          goldCarried: 0,
          maxCarried: 30 * this.upgrades.cartCapacity,
          digProgress: 0,
          pickAngle: 0
        });
        this.showToast(this.currentLang === 'zh' ? '矿工下矿探金！' : 'Miner hired!');
      } else if (this.selectedTool === 'tunnel') {
        if (!this.activeTunnelOrigin) {
          const nearestShaft = this.shafts.find((s) => Math.hypot(s.x - x, s.y - y) < 28);
          if (nearestShaft) {
            this.activeTunnelOrigin = { x: nearestShaft.x, y: nearestShaft.y };
            this.showToast(this.currentLang === 'zh' ? '已选中矿井，请在地下点击挖掘坑道！' : 'Shaft selected!');
          } else {
            const nearestTunnelNode = this.tunnels.find((t) => Math.hypot(t.x2 - x, t.y2 - y) < 20);
            if (nearestTunnelNode) {
              this.activeTunnelOrigin = { x: nearestTunnelNode.x2, y: nearestTunnelNode.y2 };
              this.showToast(this.currentLang === 'zh' ? '已选中坑道节点，继续挖掘！' : 'Tunnel node selected!');
            } else {
              this.showToast(this.currentLang === 'zh' ? '请先选择矿井入口或已有坑道！' : 'Select a Shaft or Tunnel node first!');
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
            if (Math.hypot(dep.x - x, dep.y - y) <= dep.radius) {
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
            this.showToast(this.currentLang === 'zh' ? '坑道通往金矿！矿工准备采挖！' : 'Tunnel connected to Gold!');
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
        this.storageCapacity += 320 * this.upgrades.tankExpand;
        this.showToast(this.currentLang === 'zh' ? '储金仓库建成！' : 'Warehouse Built!');
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

      // Prospectors scanning
      this.prospectors.forEach((p) => {
        p.x += p.dir * 20 * dt;
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

      // Human Miners Logic (Underground Mining & Cart Hauling)
      this.updateHumanMiners(dt);

      // Sparkle particles update
      for (let i = this.sparkleParticles.length - 1; i >= 0; i--) {
        const sp = this.sparkleParticles[i];
        sp.alpha -= 1.2 * dt;
        if (sp.alpha <= 0) this.sparkleParticles.splice(i, 1);
      }

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

      this.checkQuestProgress();
      this.updateUI();
    }

    updateHumanMiners(dt) {
      // Find connected gold deposits via tunnels
      const connectedGoldIndices = this.tunnels
        .filter((t) => t.connectedIndex !== -1)
        .map((t) => t.connectedIndex);

      this.miners.forEach((m) => {
        const moveSpeed = 45 * this.upgrades.minerSpeed * dt;

        if (m.state === 'IDLE') {
          // Look for available gold vein with gold remaining
          const validIndex = connectedGoldIndices.find(
            (idx) => this.goldDeposits[idx] && this.goldDeposits[idx].amount > 0
          );

          if (validIndex !== undefined) {
            m.targetGoldIndex = validIndex;
            m.state = 'WALKING_TO_GOLD';
          }
        } else if (m.state === 'WALKING_TO_GOLD') {
          const gold = this.goldDeposits[m.targetGoldIndex];
          if (!gold || gold.amount <= 0) {
            m.state = 'HAULING_BACK';
            return;
          }

          const dx = gold.x - m.x;
          const dy = gold.y - m.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 8) {
            m.x += (dx / dist) * moveSpeed;
            m.y += (dy / dist) * moveSpeed;
          } else {
            m.state = 'DIGGING';
            m.digProgress = 0;
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
            m.state = 'HAULING_BACK';
          }
        } else if (m.state === 'HAULING_BACK') {
          // Walk back to surface shaft
          const dx = m.shaftX - m.x;
          const dy = CONFIG.GROUND_Y - m.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 8) {
            m.x += (dx / dist) * moveSpeed;
            m.y += (dy / dist) * moveSpeed;
          } else {
            // Deposit gold in storage
            const spaceLeft = this.storageCapacity - this.storedGold;
            const depositAmount = Math.min(spaceLeft, m.goldCarried);
            this.storedGold += depositAmount;
            m.goldCarried = 0;
            m.state = 'IDLE';
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

      // Draw Tunnels & Mine Pathways
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

      // Tunnel Guideline Preview
      if (this.selectedTool === 'tunnel' && this.activeTunnelOrigin) {
        ctx.strokeStyle = palette.goldFacet;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(this.activeTunnelOrigin.x, this.activeTunnelOrigin.y);
        ctx.lineTo(this.activeTunnelOrigin.x, CONFIG.GROUND_Y + 80);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Discovered Metallic Gold Nuggets
      this.goldDeposits.forEach((dep) => {
        if (dep.discovered) {
          const ratio = dep.amount / dep.initialAmount;
          if (dep.amount > 0) {
            const r = Math.max(5, dep.radius * ratio);

            ctx.fillStyle = palette.goldGlow;
            ctx.beginPath();
            ctx.arc(dep.x, dep.y, r + 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = palette.goldBase;
            ctx.beginPath();
            ctx.arc(dep.x, dep.y, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = palette.goldFacet;
            ctx.fillRect(dep.x - r * 0.4, dep.y - r * 0.4, r * 0.8, r * 0.8);

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

      // Render Shaft Entrance Towers
      this.shafts.forEach((s) => {
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(s.x - 14, s.y - 24, 28, 24);

        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 3;
        ctx.strokeRect(s.x - 14, s.y - 24, 28, 24);

        // Shaft Wheel
        ctx.fillStyle = '#d7ccc8';
        ctx.beginPath();
        ctx.arc(s.x, s.y - 12, 6, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Human Underground Miners & Minecarts
      this.miners.forEach((m) => {
        // Miner Body
        ctx.fillStyle = palette.minerCloth;
        ctx.fillRect(m.x - 5, m.y - 10, 10, 10);

        // Miner Helmet with Light Glow
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(m.x - 4, m.y - 14, 8, 4);

        ctx.fillStyle = 'rgba(255, 235, 59, 0.4)';
        ctx.beginPath();
        ctx.arc(m.x + 4, m.y - 12, 10, -Math.PI / 4, Math.PI / 4);
        ctx.fill();

        // Pickaxe when Digging
        if (m.state === 'DIGGING') {
          ctx.save();
          ctx.translate(m.x + 4, m.y - 6);
          ctx.rotate(Math.sin(m.pickAngle) * 0.6);
          ctx.fillStyle = '#bdc3c7';
          ctx.fillRect(0, -6, 8, 3);
          ctx.restore();
        }

        // Minecart with Gold Ore when Hauling Back
        if (m.goldCarried > 0) {
          ctx.fillStyle = '#424242';
          ctx.fillRect(m.x - 8, m.y + 2, 16, 8);

          ctx.fillStyle = palette.goldFacet;
          ctx.fillRect(m.x - 6, m.y, 12, 4);
        }
      });

      // Tanks / Warehouses
      this.tanks.forEach((t) => {
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(t.x - 16, t.y, 32, 20);
        ctx.fillStyle = '#d35400';
        ctx.fillRect(t.x - 14, t.y + 2, 28, 4);
      });

      // Prospectors
      this.prospectors.forEach((p) => {
        ctx.fillStyle = palette.minerCloth;
        ctx.fillRect(p.x - 5, p.y - 10, 10, 10);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(p.x - 3, p.y - 14, 6, 4);

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

      // Sparklines
      this.renderMarketChart('west-chart', this.markets.west.history);
      this.renderMarketChart('east-chart', this.markets.east.history);
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

      // Task HUD
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
        this.storageCapacity = state.storageCapacity;
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
    window.gameApp = new GoldTurmoilGame();
  });
})();

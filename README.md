# 黄金狂查 (Gold Rush Pixel Tycoon)

欢迎使用 **黄金狂查**！本项目完全基于纯前端 HTML5 / CSS3 / JavaScript 开发，无任何依赖与服务端需求，可直接免费托管于 **GitHub Pages**。

## 🌐 GitHub Pages 自动部署体验网址
在您将仓库 Code 提交/推送至 GitHub 后，GitHub Pages 部署网址将为：
**[https://linmiaoyan.github.io/gold-rush-game/index.html](https://linmiaoyan.github.io/gold-rush-game/index.html)**

---

## 🎮 游戏核心系统与架构
项目代码遵循轻量级且模块化的像素 HTML5 架构：

```
HTML 界面 (index.html)
 ├── 像素 HUD (金钱 Money / 黄金库存 Gold Storage / 赛季时间 Season Time)
 ├── 实时交易所价格仪表 (华西 / 华东双向实时市场)
 └── 操作面板 (探矿员/雷达/钻井/管道/储金罐/科技研究/存档)

Canvas 视图 (game.js)
 ├── 8-Bit 像素世界 (地形/草地/树木/碎石)
 ├── 矿脉节点 (随机深度的黄金矿点与探明状态)
 ├── 实时开采连线 (可交互管道连接与抽取)
 └── 浮动收益与声呐探索波特效

JavaScript 游戏逻辑 Engine (game.js)
 ├── 随机地图与黄金分布生成
 ├── Web Audio API 芯片音效 (8-Bit Chiptune)
 ├── 动态股票/期货交易所价格波动与市场操纵
 ├── 科技研究中心与升级
 ├── LocalStorage 存档与读档 (Floppy Disk)
 └── 结算单发票 Overlay 评估
```

---

## 🎨 独立游戏美术与音乐来源工作流 (Workflow Guide)
游戏内置了开发参考指南面板（点击顶部 `🎨` 图标查看）：
1. **像素美术 (Pixel Art)**:
   - 素材推荐: [Kenney.nl](https://kenney.nl/assets/category:2D) (CC0公有领域) & [OpenGameArt.org](https://opengameart.org/)
   - 编辑器首选: **Aseprite** / **Piskel**
2. **8-Bit 音乐与音效 (SFX)**:
   - 音效生成器: [BFXR / JSFXR](https://www.bfxr.net/)
   - 复古作曲工具: [BeepBox.co](https://www.beepbox.co/)

---

## 📁 历史项目归档 (Archive)
以前仓库中的旧项目已整体重构移至 [`/archive`](./archive) 文件夹中保存。

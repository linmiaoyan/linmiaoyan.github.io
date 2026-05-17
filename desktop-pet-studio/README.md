# 桌宠原型 Desktop Pet Studio

这是一个独立的 Electron 桌面宠物原型，放在 `desktop-pet-studio/` 下，不依赖仓库里的其他文件。

## 当前完成内容

- 已采用方案 C 作为正式卡通主图：`assets/pet-cartoon-idle.png`
- 已生成并接入动作/表情图片：`assets/actions/`
- 透明、无边框、置顶的桌宠窗口
- 默认后台常驻：控制台关闭时隐藏到系统托盘
- 控制台设置项：
  - 桌宠大小
  - 透明度
  - 抓起/拖拽开关
  - 自动活动与巡游速度
  - 松手吸附屏幕边缘
  - 闲置鼠标穿透
  - 保持置顶
  - 开机自启
  - 启动时后台隐藏/显示控制台
- 快捷动作：
  - 挥手
  - 走路
  - 抓一下
  - 休息
  - 开心
  - 委屈
  - 惊讶
  - 思考
  - 回到右下角
- 打开控制台：
  - 双击桌宠
  - 右键桌宠选择“打开设置”
  - 点击系统托盘图标或托盘菜单

## 运行

```bash
cd desktop-pet-studio
npm install
npm start
```

开发期间可以运行语法检查：

```bash
npm run check
```

## 打包架构

当前技术栈选用 Electron，并已接入 `electron-builder`，后续可以基于同一套桌宠逻辑分别输出 Windows 安装包和 macOS 安装包。

常用命令：

```bash
# 只打包成本机目录，便于快速检查产物结构
npm run pack

# Windows NSIS 安装包，产物为 .exe
npm run dist:win

# macOS DMG 安装包，产物为 .dmg
npm run dist:mac
```

说明：

- `package.json` 中的 `build.win` 已配置 NSIS 安装器，适合输出 Windows `.exe`。
- `package.json` 中的 `build.mac` 已配置 DMG，适合输出 Apple Silicon 和 Intel Mac 的 `.dmg`。
- macOS DMG 通常需要在 macOS 环境构建；Windows EXE 建议在 Windows 环境构建，跨系统构建时可能需要额外的 Wine/签名环境。
- 正式发布前建议补充平台图标：`build/icon.ico`、`build/icon.icns`、`build/icon.png`，并配置代码签名。

GitHub Actions 也已提供跨平台构建工作流：`.github/workflows/desktop-pet-build.yml`。在 GitHub 的 Actions 页面手动运行 **Build Desktop Pet Installers**，或向 `main` 推送桌宠相关改动后，会分别用 Windows runner 导出 `.exe`、macOS runner 导出 `.dmg`，并上传为可下载 artifact。

## 动作图片资源

当前动作配置集中在 `assets/actions.json`，图片文件位于 `assets/actions/`：

- `wave.png`：挥手
- `walk.png`：走路/巡游
- `sleep.png`：休息
- `caught.png`：被抓起
- `happy.png`：开心
- `sad.png`：委屈
- `surprised.png`：惊讶
- `thinking.png`：思考

桌宠窗口通过 `src/pet.js` 的 `ACTIONS` 映射按动作切换 PNG。控制台按钮会触发对应动作；拖拽桌宠时自动切换到 `caught`；自动巡游时会周期性显示 `walk`。

## 后续扩展建议

- 如果需要更丝滑的动画，可以把单张动作图升级为序列帧，例如 `wave-01.png` 到 `wave-06.png`。
- 如果要做更复杂的互动，可以继续添加喂食、摸头、提醒喝水、随机对话等状态。
- 正式发布前建议补全平台图标、签名和自动更新配置。

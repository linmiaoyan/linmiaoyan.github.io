# 桌宠原型 Desktop Pet Studio

这是一个独立的 Electron 桌面宠物原型，放在 `desktop-pet-studio/` 下，不依赖仓库里的其他文件。

## 当前完成内容

- 已根据你上传的人物图生成第一版卡通主图：`assets/pet-cartoon-idle.png`
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
  - 抓一下
  - 休息
  - 回到右下角

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

## 后续动作图接入方式

目前因为需要先确认卡通主图，`wave`、`walk`、`sleep`、`caught` 等动作先用 CSS 动效和窗口移动模拟。确认主图后，可以继续生成透明背景动作图，放到 `assets/` 下，并更新 `assets/actions.json`：

```json
{
  "id": "wave",
  "name": "挥手",
  "image": "pet-cartoon-wave.png",
  "implementedBy": "image-sequence"
}
```

然后在 `src/pet.js` 中按动作切换图片或序列帧即可。

## 卡通主图确认点

请重点确认：

1. 人物发型和五官是否接近原图。
2. 米白色冲锋衣、黑裤子、登山鞋是否保留。
3. 卡通化程度是否合适。
4. 是否需要更偏 Q 版、日漫、像素风、扁平贴纸或 3D 软萌风。

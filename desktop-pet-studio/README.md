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

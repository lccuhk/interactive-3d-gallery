# 🖼️ Interactive 3D Gallery

[![Stars](https://img.shields.io/github/stars/lccuhk/interactive-3d-gallery?style=for-the-badge)](https://github.com/lccuhk/interactive-3d-gallery/stargazers)
[![Forks](https://img.shields.io/github/forks/lccuhk/interactive-3d-gallery?style=for-the-badge)](https://github.com/lccuhk/interactive-3d-gallery/network/members)
[![Issues](https://img.shields.io/github/issues/lccuhk/interactive-3d-gallery?style=for-the-badge)](https://github.com/lccuhk/interactive-3d-gallery/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Last Commit](https://img.shields.io/github/last-commit/lccuhk/interactive-3d-gallery?style=for-the-badge)](https://github.com/lccuhk/interactive-3d-gallery/commits/main)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/zh-CN/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/zh-CN/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)

一个基于 WebGL 的交互式 3D 虚拟画廊，可以在浏览器中自由漫游、浏览和欣赏交互式 3D 作品。

## 🖼️ 当前展品

| # | 展品 | 技术 | 在线体验 |
|---|------|------|----------|
| 01 | **OSMO ACTION 4 · 3D 结构拆解** — 运动相机交互式爆炸图，16 个程序化建模组件、点选聚焦与赛博 HUD 参数面板 | Three.js / WebGL | [进入展厅](https://lccuhk.github.io/interactive-3d-gallery/projects/action4-3d-teardown/) |
| 02 | **机械手表 · 齿轮系拆解** — 机芯轮系实时啮合运转，13 个组件、四级传动链（921.6:1）、擒纵调速与轴向爆炸拆解 | Three.js / WebGL | [进入展厅](https://lccuhk.github.io/interactive-3d-gallery/projects/watch-gear-train/) |

> 展品源码位于 [`projects/`](projects/) 下各子目录，均为零外链的自包含静态站点。

## ✨ 功能特性（规划中）

- 🎨 **沉浸式 3D 展厅**：第一人称 / 轨道相机自由漫游
- 🖼️ **作品展示**：支持图片、3D 模型等多种展品格式
- 💡 **真实光照**：动态光源、阴影与环境反射
- 📱 **响应式设计**：适配桌面与移动设备
- 🕹️ **交互控制**：键盘鼠标 + 触摸手势
- 🎵 **氛围音效**：可选的环境背景音乐与脚步声

## 🚀 在线预览

项目部署完成后，可通过以下链接访问：

**https://lccuhk.github.io/interactive-3d-gallery/**

## 🛠️ 技术栈（待定）

- HTML5 / CSS3 / JavaScript (ES6+)
- WebGL / Three.js（候选）
- GitHub Pages 自动部署

## 📂 项目结构

```
interactive-3d-gallery/
├── index.html          # 画廊入口（展品目录大厅）
├── projects/           # 各个独立 3D 展品
│   ├── action4-3d-teardown/   # 展品 01：OSMO ACTION 4 结构拆解
│   └── watch-gear-train/      # 展品 02：ETA 2824-2 机芯齿轮系拆解
│       ├── index.html
│       ├── app.js
│       └── vendor/            # 内置 Three.js，零外链 CDN
├── assets/             # 画廊公共静态资源（规划中）
│   ├── images/         # 展品图片
│   └── models/         # 3D 模型
└── README.md
```

## 🏁 快速开始

```bash
# 克隆仓库
git clone https://github.com/lccuhk/interactive-3d-gallery.git
cd interactive-3d-gallery

# 使用任意静态服务器运行（例如）
python3 -m http.server 8000
```

然后在浏览器中打开 `http://localhost:8000`。

## 🗺️ 路线图（Roadmap）

### 短期（2026 Q4）
- [x] 创建项目仓库与基础配置
- [x] 展品 01：OSMO ACTION 4 · 3D 结构拆解（子页面形式入驻）
- [x] 展品 02：ETA 2824-2 机芯齿轮系拆解（真实齿数参数化复刻 + 自动陀）
- [x] 画廊入口页与展品目录卡片
- [ ] 搭建 3D 场景基础框架
- [ ] 实现展厅房间与灯光

### 中期（2027 Q1）
- [ ] 添加展品加载与展示功能
- [ ] 实现第一人称漫游控制
- [ ] 添加展品信息面板

### 长期（2027 Q2）
- [ ] 多展厅切换
- [ ] 移动端触摸支持
- [ ] 性能优化与加载动画

## 🤝 贡献

欢迎贡献！请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解开发流程和代码规范。

1. Fork 本仓库
2. 创建你的功能分支：`git checkout -b feature/amazing-feature`
3. 提交你的修改：`git commit -m 'feat: add amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

© 2026 Denis LU (lccuhk)

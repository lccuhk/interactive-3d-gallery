# OSMO ACTION 4 · 3D 结构拆解（Structure Explorer）

一个使用纯 **Three.js**、零依赖外链构建的交互式 3D 运动相机结构拆解网页，复刻赛博朋克 HUD 科技风。

## ✨ 功能特性

- **16 个精细组件**：从中框骨架、前后镂空外壳、光学镜头、主板、散热、电池到底部磁吸底座，全部程序化建模。
- **交互式爆炸图**：点击「全部拆解」或拖动滑块，将所有组件沿装配方向平滑展开。
- **智能点选与聚焦**：点击 3D 模型或左侧列表中的部件，模型会自动高亮并平滑聚焦，右侧实时展示工程规格参数。
- **纯粹的赛博 HUD 视觉**：包含悬浮标签、虚线引线、雷达刻度环、星点、扫描线、实时 FPS 和模式仪表。
- **极致性能与可移植性**：不使用任何外部 CDN（Three.js 已内置于 `vendor/` 目录），克隆即可在任何地方运行。

## 🚀 如何在本地运行

因为使用了原生 ES 模块，请不要直接双击打开 `index.html`（浏览器会拦截本地模块加载）。
在项目根目录下启动一个静态文件服务器即可：

```bash
# 如果你安装了 Python 3
python3 -m http.server 8080

# 或者使用 Node.js
npx serve .
```

然后在浏览器中打开：`http://localhost:8080`

## 🌐 一键部署到 GitHub Pages

将代码推送到你的 GitHub 仓库后：
1. 进入仓库的 **Settings** -> **Pages**
2. 在 **Build and deployment** -> **Source** 中选择 **Deploy from a branch**
3. 在 **Branch** 下选择 `main` 分支，文件夹选择 `/ (root)`，点击 **Save**
4. 等待 1-2 分钟，你的网站就会出现在 `https://<你的用户名>.github.io/<仓库名>/`

## 📁 项目结构

```text
.
├── index.html          # 主页面与 HUD 样式
├── app.js              # Three.js 场景、模型数据与交互逻辑
└── vendor/
    ├── three.module.js
    ├── OrbitControls.js
    └── RoundedBoxGeometry.js
```

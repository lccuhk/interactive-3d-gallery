# 变更日志（Changelog）

本项目的所有重要变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
并遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 变更
- 展品 02 升级为 **ETA 2824-2 真实型号参数化复刻**（原通用教学机芯）
  - 轮系改用复原真实齿数：条盒 96 → 中心 80/12 → 过轮 75/10 → 秒轮 72/10 → 擒纵 20/6，摆频闭合至 28,800 vph
  - 修正角速度递推公式（主动轮齿数 / 从动齿轴叶数，啮合对取负号）
  - 新增双向滚珠轴承自动陀、自动换向轮组 2 个部件（13 → 15 组件），规格更新为 25 钻 / 38h / 50° 升角
  - README 补充官方规格表、运动学闭合推导、数据来源与品牌免责声明

### 新增
- 展品 02：机械手表 · 齿轮系拆解，入驻 `projects/watch-gear-train/`
  - 程序化齿轮建模（梯形齿 / 擒纵轮尖齿 / 阿基米德螺线游丝），13 个机芯组件
  - 传动链单一数据源：轴距按分度圆半径计算，角速度沿链递推（啮合反向、同轴同速）
  - 轮系实时运转、摆轮擒纵同频摆动，支持暂停运转与轴向爆炸拆解
- 画廊入口页新增展品 02 卡片
- 画廊入口页 `index.html`（赛博 HUD 风格展品目录大厅，响应式卡片布局）
- 展品 01：OSMO ACTION 4 · 3D 结构拆解，入驻 `projects/action4-3d-teardown/`
  - 纯 Three.js 交互式爆炸图，16 个程序化建模组件，零外链 CDN 依赖
- README 增加「当前展品」板块并更新项目结构与路线图
- 初始化项目仓库
- 添加 README、MIT LICENSE、.gitignore
- 添加 GitHub Pages 自动部署工作流
- 添加贡献指南、行为准则等社区文件

## [0.1.0] - 2026-11-04

### 新增
- 项目创建与基础配置

[Unreleased]: https://github.com/lccuhk/interactive-3d-gallery/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/lccuhk/interactive-3d-gallery/releases/tag/v0.1.0

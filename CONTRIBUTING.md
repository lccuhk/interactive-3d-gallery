# 贡献指南

感谢你对 **Interactive 3D Gallery** 项目的关注！欢迎你的贡献。

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
  - [提交 Issue](#提交-issue)
  - [提交 Pull Request](#提交-pull-request)
- [代码规范](#代码规范)
- [代码风格指南](#代码风格指南)
- [开发环境](#开发环境)
- [贡献类型](#贡献类型)

## 行为准则

本项目遵循 [Contributor Covenant](.github/CODE_OF_CONDUCT.md) 行为准则。参与项目即表示您同意遵守其条款。

## 如何贡献

### 提交 Issue

如果您发现了 Bug 或有新功能建议，请通过 Issue 告诉我们：

1. **Bug 报告**：请包含以下信息
   - 问题描述和复现步骤
   - 预期行为与实际行为
   - 浏览器版本与操作系统
   - 截图或错误信息（如适用）

2. **功能建议**：请说明
   - 想要解决的问题
   - 建议的解决方案
   - 其他可选方案

### 提交 Pull Request

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 遵循代码规范进行开发
4. 确保代码通过检查
5. 编写清晰的提交信息
6. 提交 Pull Request 并描述你的改动

## 代码规范

- 使用 2 个空格缩进
- 使用 Prettier 格式化代码
- 遵循 HTML 语义化规范
- JavaScript 使用 ES6+ 语法
- 3D 资源文件请压缩优化后再提交

## 代码风格指南

### Git 提交规范

我们遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>
```

**提交类型：**
- `feat` - 新功能、新场景
- `fix` - Bug 修复
- `docs` - 文档更新
- `style` - 代码格式
- `refactor` - 重构
- `perf` - 性能优化
- `test` - 增加测试
- `chore` - 构建或工具变动
- `ci` - CI/CD 配置变更

**示例：**
```
feat(gallery): add first-person camera controls

- Implement pointer lock controls
- Add WASD movement and collision
- Optimize render loop for 60fps

Closes #123
```

### 命名约定

```javascript
// 变量/函数 - camelCase
let cameraPosition = { x: 0, y: 1.6, z: 5 }

function loadArtwork(url) {
  // ...
}

// 常量 - UPPER_SNAKE_CASE
const GALLERY_WIDTH = 20
const MOVE_SPEED = 3
const RENDER_FPS = 60

// 类 - PascalCase
class GalleryScene {
  constructor() {
    this._renderer = null
  }

  _setupLighting() {
    // 内部方法
  }
}
```

#### CSS 类名（BEM）
```css
.gallery-room { }              /* Block */
.gallery-room__wall { }        /* Element */
.gallery-room--lit { }         /* Modifier */

.is-active { }
.is-loading { }
```

#### 文件命名
```
index.html
main.js
galleryScene.js
assetLoader.js
main.css
gallery-room.css
```

### 注释规范

```javascript
/**
 * 加载 3D 模型资源
 * @param {string} url - 模型文件地址（.glb/.gltf）
 * @param {number} scale - 缩放比例
 * @returns {Promise<THREE.Group>} 加载完成的模型组
 */
async function loadModel(url, scale = 1) {
  // 使用 Draco 压缩减少模型加载体积
  // ...
}

// ✅ 解释为什么：使用 requestAnimationFrame 保证流畅渲染
function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}
```

### 性能优化规范

```javascript
// ✅ 缓存几何体和材质，避免重复创建
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshStandardMaterial()

// ✅ 循环中复用对象，避免每帧分配
const tempVector = new THREE.Vector3()

// ✅ 大量物体使用 InstancedMesh
const instancedMesh = new THREE.InstancedMesh(geometry, material, count)

// ✅ 纹理压缩并设置合理的 mipmap
texture.generateMipmaps = true
texture.minFilter = THREE.LinearMipmapLinearFilter
```

## 开发环境

```bash
# 克隆仓库
git clone https://github.com/lccuhk/interactive-3d-gallery.git
cd interactive-3d-gallery

# 使用静态服务器运行
python3 -m http.server 8000

# 代码格式化
npx prettier --write .
```

## 贡献类型

- 🐛 **Bug 修复**：修复现有功能的问题
- ✨ **新功能**：新的展厅、交互或展品
- 🎨 **3D 资源**：优化模型、贴图、灯光效果
- 📚 **文档**：改进文档和示例
- ⚡ **性能**：渲染与加载性能优化

## 问题？

如有任何问题，欢迎提交 [Issue](https://github.com/lccuhk/interactive-3d-gallery/issues)。

# GitHub Desktop 本地开发与打包指南

## 环境要求

- **Node.js** >= 16（推荐 18 LTS）
- **Yarn** 1.x（项目使用 Yarn v1，不是 v2/v3）
- **Python**（node-gyp 依赖，macOS 自带）
- **Xcode Command Line Tools**（macOS 编译原生模块需要）

```bash
xcode-select --install
```

## 安装依赖

```bash
cd desktop
yarn
```

依赖安装完成后会自动执行 `postinstall` 脚本——编译原生模块和复制资源文件。如果失败，检查 Python 和 Xcode CLT 是否就绪。

## 本地开发

```bash
yarn start
```

流程：webpack 编译渲染进程 → 启动 Electron → 打开窗口。**首次启动前必须先编译一次**（见下文「首次运行」）。

修改 src/ 下的代码后，webpack-dev-server 自动重新编译，刷新 Electron 窗口即可（`Cmd+R`）。

### 首次运行

新克隆的仓库，`out/` 目录不存在，需要先全量编译一次：

```bash
yarn build:dev
```

之后日常开发只需 `yarn start`。

### 开发模式说明

- webpack dev server 运行在 `http://localhost:3000`
- 主进程通过 `ts-node` 实时编译 TypeScript，修改 `app/src/main-process/` 下的文件需要重启 Electron（`Ctrl+C` 终止后重新 `yarn start`）
- **DevTools 不会自动打开**，需要时按 `Cmd+Option+I`（macOS）或 `F12`（Windows/Linux）
- Dev 模式下自动安装 React Developer Tools 和 axe DevTools 扩展

### 清除缓存

如果遇到奇怪的问题（修改不生效、编译报错等），清除缓存后重试：

```bash
rm -rf out/ dist/ node_modules/ app/node_modules/
yarn
```

窗口位置/大小缓存在：

```bash
rm ~/Library/Application\ Support/GitHub\ Desktop-dev/window-state.json
```

## 打包构建

### 开发构建（含 source map、未压缩）

```bash
yarn build:dev
```

输出在 `out/` 目录。

### 生产构建（压缩、优化）

```bash
yarn build:prod
```

### 打包为可分发安装包

```bash
yarn package
```

输出在 `out/` 下，macOS 为 `.dmg` / `.zip`，Windows 为 `.exe` 安装程序。

## 项目结构

```
desktop/
├── app/
│   ├── src/
│   │   ├── main-process/     # Electron 主进程
│   │   ├── ui/               # React 渲染进程组件
│   │   ├── lib/              # 共享工具库
│   │   └── models/           # 数据模型
│   └── styles/               # SCSS 样式
├── script/                   # 构建和开发脚本
└── package.json              # 根 package（工作空间协调）
```

## 本 fork 的自定义修改

- **仓库列表常驻侧边栏**（原为弹出下拉）：`app/src/ui/app.tsx` 中的 `renderApp()` 改为双栏布局
- **默认窗口尺寸 1440×900**（原 960×660）：`app/src/main-process/app-window.ts`
- **DevTools 不自动打开**：`app/src/main-process/app-window.ts` 移除了自动打开逻辑

## 常见问题

### `Couldn't launch the app. You probably need to build it first.`

`out/` 目录不存在，先执行 `yarn build:dev`。

### 编译报错 `Cannot find module 'electron'`

```bash
yarn
# 或
yarn postinstall
```

### 窗口大小没有变化

删掉窗口状态缓存文件后重启：

```bash
rm ~/Library/Application\ Support/GitHub\ Desktop-dev/window-state.json
yarn start
```

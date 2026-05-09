# 文章预览功能 Spec

## Why
编辑器目前只有纯文本输入区域，编辑 Markdown 内容时看不到最终渲染效果，也无法预览生成的静态站点效果，写作体验不完整。

## What Changes

### 1. 编辑器内 Markdown 实时预览
- 编辑器从单栏文本输入改为左右分栏布局（编辑区 + 预览区）
- 左侧 Markdown 编辑，右侧实时渲染 HTML 预览
- 支持切换为纯编辑模式（隐藏预览区）
- 使用 `marked` + `DOMPurify` 前端渲染 Markdown

### 2. 文章生成预览
- 新增 Tauri command `preview_article`，使用 Rust 生成器将单篇文章渲染为完整 HTML
- 返回 HTML 字符串，前端在模态框或新页面中展示

### 3. 站点生成预览
- 编辑器工具栏新增"预览站点"按钮（Globe 图标）
- 点击后调用 `preview_site` Tauri 命令，生成完整静态站点（所有已发布文章 + style.css + index.html 目录列表）
- 使用嵌入式 HTTP 服务器（std::net::TcpListener，仅标准库）在本地随机端口提供站点服务
- 通过 `window.open()` 在系统默认浏览器中打开预览 URL
- 支持停止已有预览并启动新预览（通过全局静态 Mutex 管理服务器生命周期）
- 服务器使用 `AtomicBool` 作为停止信号，线程安全

## Impact
- Affected specs: 编辑器页面、静态生成器
- Affected code:
  - `src/pages/Editor/index.tsx` — 分栏布局、Markdown 渲染、预览按钮
  - `src/components/editor/` — 新增 MarkdownPreview 组件
  - `src-tauri/src/commands/article.rs` — 新增 `preview_article` 命令
  - `src-tauri/src/commands/deploy.rs` — 新增 `preview_site` 命令
  - `src-tauri/src/generator/mod.rs` — 扩展支持单篇文章生成 + 完整站点生成
  - `src-tauri/src/server.rs` — 新增嵌入式 HTTP 静态文件服务器
  - `src/api.ts` — 新增 previewArticle + previewSite API
  - `src-tauri/src/lib.rs` — 注册新命令
  - `package.json` — 新增 marked + DOMPurify 依赖

## ADDED Requirements

### Requirement: 编辑器 Markdown 实时预览
The system SHALL provide real-time Markdown preview in the editor.

#### Scenario: 编辑文章时实时预览
- **WHEN** 用户在编辑器中输入 Markdown 内容
- **THEN** 右侧预览区实时渲染为格式化 HTML

#### Scenario: 切换编辑模式
- **WHEN** 用户点击预览切换按钮
- **THEN** 预览区显示/隐藏，编辑器在分栏和全宽模式间切换

### Requirement: 文章生成预览
The system SHALL allow previewing a single article as rendered static HTML.

#### Scenario: 预览单篇文章
- **WHEN** 用户在编辑器中点击"预览"按钮
- **THEN** 调用 `preview_article` 命令生成完整 HTML，在模态框中展示

### Requirement: 站点预览
The system SHALL allow previewing the full generated static site.

#### Scenario: 预览完整站点
- **WHEN** 用户点击"预览站点"按钮
- **THEN** 系统获取所有已发布文章，调用生成器生成完整静态站点到临时目录（包含 index.html 目录列表、style.css、各文章 HTML）
- **AND** 启动嵌入式 HTTP 服务器在随机端口提供服务
- **AND** 在系统默认浏览器中打开预览 URL

#### Scenario: 无已发布文章
- **WHEN** 没有已发布的文章时点击预览站点
- **THEN** 仍然生成包含站点标题的 index.html（显示"暂无文章"提示）

#### Scenario: 服务器已在运行
- **WHEN** 预览服务器已在运行中，用户再次点击预览
- **THEN** 停止旧服务器，重新生成站点并启动新服务器

# BlogForge 项目初始化 Spec

## Why
BlogForge 是一个跨平台桌面博客管理软件，目前项目仅有文档，需要从零构建完整的桌面应用。项目需要按照 PRD、技术设计、数据库设计、UI/UX 规范和开发规范文档，完成一个功能完整的博客管理系统。

## What Changes
- 初始化 Tauri 2.x + React 18 + TypeScript 项目骨架
- 实现 Rust 后端：数据库操作、Tauri Commands、静态网站生成器、图床服务、部署服务
- 实现 React 前端：仪表盘、文章管理、编辑器、图片管理、设置、预览、发布页面
- 实现 SQLite 数据库：12 张表的完整 schema 和迁移
- 实现核心功能：文章 CRUD、版本管理、标签/分类、Markdown 编辑器、图片上传、静态网站生成、SEO 文件生成、部署发布
- 实现 UI/UX：遵循设计规范的三栏式布局、亮色/暗色主题、响应式设计
- 遵循开发规范：命名规范、代码风格、测试规范、安全规范

## Impact
- Affected specs: 无（全新项目）
- Affected code: 整个项目从零构建

## ADDED Requirements

### Requirement: 项目骨架初始化
系统 SHALL 使用 Tauri 2.x + React 18 + TypeScript + Vite 作为基础项目骨架，配置 Tailwind CSS、Zustand、i18next、React Router 等核心依赖。

#### Scenario: 项目创建成功
- **WHEN** 执行项目初始化
- **THEN** 生成符合开发规范文档中定义的目录结构，包括 src/（前端）和 src-tauri/（后端）

### Requirement: SQLite 数据库初始化
系统 SHALL 创建包含 12 张表的完整 SQLite 数据库，支持版本迁移和自动备份。

#### Scenario: 数据库初始化成功
- **WHEN** 应用首次启动
- **THEN** 自动创建 blogforge.db 文件，包含完整的表结构和索引

### Requirement: 文章管理功能
系统 SHALL 支持文章的创建、编辑、删除、搜索、筛选、排序，以及草稿/已发布/回收站状态管理。

#### Scenario: 创建并发布文章
- **WHEN** 用户创建新文章，填写标题、内容、标签、分类后点击发布
- **THEN** 文章状态变为 published，published_at 记录发布时间

### Requirement: 版本管理功能
系统 SHALL 自动保存文章历史版本，支持版本对比和一键回滚。

#### Scenario: 回滚历史版本
- **WHEN** 用户选择某个历史版本并点击回滚
- **THEN** 当前文章内容被替换为历史版本内容

### Requirement: Markdown 编辑器
系统 SHALL 提供分屏 Markdown 编辑体验，支持代码高亮、数学公式、Mermaid 图表、图片拖拽/粘贴上传。

#### Scenario: 实时预览
- **WHEN** 用户在左侧编辑 Markdown 内容
- **THEN** 右侧实时显示渲染后的 HTML，延迟 ≤ 200ms

### Requirement: 图床管理
系统 SHALL 支持 GitHub、阿里云 OSS、腾讯云 COS、Cloudflare R2、自定义图床的配置和图片上传。

#### Scenario: 上传图片到图床
- **WHEN** 用户在编辑器中粘贴或拖拽图片
- **THEN** 图片自动上传到默认图床，并在编辑器中插入 Markdown 图片语法

### Requirement: 静态网站生成
系统 SHALL 通过 Rust 模块生成完整的静态网站，包括首页、文章页、标签页、分类页、归档页、自定义页面，以及 sitemap.xml、RSS feed、robots.txt。

#### Scenario: 生成静态网站
- **WHEN** 用户触发网站生成
- **THEN** 在指定输出目录生成完整的静态网站文件

### Requirement: 部署发布
系统 SHALL 支持本地导出、Git 部署、FTP/SFTP 上传等部署方式，并提供部署日志记录。

#### Scenario: Git 部署
- **WHEN** 用户配置 Git 仓库信息并触发部署
- **THEN** 静态文件自动 commit 并 push 到远程仓库

### Requirement: 站点配置
系统 SHALL 支持站点基本信息的配置，包括名称、描述、作者、URL、导航菜单、社交链接、SEO 设置、评论配置、统计代码等。

#### Scenario: 保存站点配置
- **WHEN** 用户在设置页面修改站点配置并保存
- **THEN** 配置持久化到 site_config 表，下次启动恢复

### Requirement: 主题切换
系统 SHALL 支持亮色/暗色主题切换，遵循 UI/UX 设计规范文档中定义的色彩系统。

#### Scenario: 切换到暗色主题
- **WHEN** 用户在设置中选择暗色主题
- **THEN** 界面立即切换到暗色主题色彩方案

### Requirement: 国际化
系统 SHALL 支持简体中文和 English 两种语言，前端使用 i18next 实现。

#### Scenario: 语言切换
- **WHEN** 用户在设置中切换语言
- **THEN** 界面文字即时切换为目标语言

### Requirement: 仪表盘页面
系统 SHALL 提供仪表盘页面，展示站点概览（文章总数、已发布数、草稿数）、最近文章列表和快捷操作入口。

#### Scenario: 查看仪表盘
- **WHEN** 用户打开应用
- **THEN** 默认显示仪表盘页面，展示统计数据

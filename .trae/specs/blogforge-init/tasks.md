# Tasks

- [ ] Task 1: 初始化 Tauri 2.x + React 项目骨架
  - [ ] 使用 create-tauri-app 创建基础项目（React + TypeScript + Vite）
  - [ ] 安装前端依赖：react-router-dom, zustand, i18next + react-i18next, tailwindcss + postcss, lucide-react
  - [ ] 配置 Tailwind CSS（包括亮色/暗色主题色彩变量，严格按 UI/UX 设计规范文档）
  - [ ] 配置 i18next（zh-CN 和 en-US 翻译文件骨架）
  - [ ] 创建基础目录结构：src/components/{common,layout,editor}, src/pages/{Dashboard,Articles,Editor,Settings}, src/hooks, src/stores, src/services, src/types, src/utils, src/i18n, src/styles
  - [ ] 创建 src-tauri/src 目录结构：commands, models, services, database, generator, imagebed, deploy, utils

- [ ] Task 2: Rust 后端核心实现
  - [ ] 配置 Cargo.toml 依赖：rusqlite, serde, serde_json, tera, tokio, thiserror, chrono, uuid
  - [ ] 实现数据库模块 database/mod.rs：初始化连接、创建表、索引、迁移框架、备份功能（严格按数据库设计文档的 12 张表）
  - [ ] 实现数据模型 models/：Article, Tag, Category, ArticleVersion, Image, ImagebedConfig, SiteConfig, DeployConfig, DeployLog, CustomPage
  - [ ] 实现文章管理服务 services/article.rs：CRUD、搜索、筛选、状态管理、版本管理、导入导出
  - [ ] 实现 Tauri Commands commands/article.rs：映射所有文章管理 API（按技术设计文档 API 列表）
  - [ ] 实现图床服务适配器 imagebed/mod.rs：Trait 定义 + GitHub/Aliyun/Tencent/R2/Custom 适配器骨架
  - [ ] 实现图片管理 commands/image.rs：上传、删除、列表、图床配置管理等 API
  - [ ] 实现静态网站生成器 generator/：Markdown 解析、模板渲染（Tera）、页面生成（首页/文章/标签/分类/归档/自定义页面）、SEO 文件（sitemap/RSS/robots.txt）
  - [ ] 实现部署服务 deploy/：本地导出、Git 部署（git2）、FTP/SFTP 上传骨架
  - [ ] 实现 commands/deploy.rs：部署相关 API
  - [ ] 实现站点配置 commands/config.rs：站点设置、主题、自定义页面
  - [ ] 实现 lib.rs 模块注册和错误类型定义

- [ ] Task 3: 前端通用组件实现
  - [ ] 实现基础组件 common/：Button, Input, Textarea, Select, Modal, Toast, Card, Table, Dropdown, Badge, Loading（严格按 UI/UX 设计规范）
  - [ ] 实现布局组件 layout/：Sidebar（240px 宽，可折叠至 64px），Header
  - [ ] 实现主题系统：ThemeProvider + useTheme Hook，亮色/暗色切换

- [ ] Task 4: 前端状态管理与服务层
  - [ ] 实现 stores/：articleStore, imageStore, configStore, deployStore, appStore（Zustand）
  - [ ] 实现 services/：封装 Tauri invoke 调用，统一错误处理

- [ ] Task 5: 前端页面实现 - 仪表盘与布局
  - [ ] 实现 App.tsx 路由配置和整体布局（三栏式）
  - [ ] 实现 Dashboard 页面：统计卡片（文章总数/已发布/草稿/访问量）、最近文章列表、快捷操作按钮

- [ ] Task 6: 前端页面实现 - 文章管理
  - [ ] 实现 Articles 列表页：搜索框、筛选器（全部/已发布/草稿/回收站）、文章卡片列表、排序切换、批量操作栏
  - [ ] 实现 Editor 编辑页：顶部工具栏（保存/发布/预览/设置）、标题输入、分屏 Markdown 编辑+预览、侧边栏（标签/分类/SEO/封面）、底部状态栏（字数/保存状态/版本历史）

- [ ] Task 7: 前端页面实现 - 图片管理
  - [ ] 实现图片管理页面：图片库列表、上传按钮（拖拽/粘贴/选择）、图床配置表单、上传进度

- [ ] Task 8: 前端页面实现 - 设置与部署
  - [ ] 实现 Settings 页面：左侧分类导航（站点/主题/图床/部署/通用）、右侧表单（站点信息/SEO/导航/社交/评论/统计）、底部保存按钮
  - [ ] 实现部署/预览页面：生成预览、部署配置表单、部署日志列表、一键发布按钮

- [ ] Task 9: 前端国际化翻译
  - [ ] 完善 i18n/zh-CN.json：所有页面和组件的简体中文翻译
  - [ ] 完善 i18n/en-US.json：所有页面和组件的英文翻译

- [ ] Task 10: 测试与验证
  - [ ] Rust 后端单元测试：数据库操作、文章 CRUD、标签/分类 CRUD、版本管理、静态生成器
  - [ ] 前端组件测试：基础组件渲染、文章列表、编辑器交互
  - [ ] 端到端验证：构建检查（npm run build + cargo build）、应用启动验证

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1
- Task 4 depends on Task 1
- Task 5 depends on Tasks 3, 4
- Task 6 depends on Tasks 3, 4
- Task 7 depends on Tasks 3, 4
- Task 8 depends on Tasks 3, 4
- Task 9 depends on Tasks 5, 6, 7, 8
- Task 10 depends on Tasks 2, 9

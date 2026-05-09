# BlogForge 技术设计文档

**版本**: 1.0.0  
**日期**: 2026-05-08

---

## 1. 技术架构概述

### 1.1 架构设计原则

- **模块化**：各功能模块高内聚低耦合，便于独立开发和测试
- **可扩展**：预留插件接口，支持后期功能扩展
- **高性能**：关键路径优化，确保流畅的用户体验
- **安全性**：敏感数据加密存储，网络传输安全
- **跨平台**：一套代码，三端运行

### 1.2 技术栈选型

| 层级 | 技术选型 | 选型理由 |
|-----|---------|---------|
| 桌面框架 | Tauri 2.x | 体积小、性能好、安全性高、原生支持 Rust |
| 前端框架 | React 18 + TypeScript | 生态成熟、类型安全、组件化开发 |
| 状态管理 | Zustand | 轻量级、API 简洁、TypeScript 友好 |
| UI 组件库 | Ant Design / shadcn/ui | 组件丰富、设计规范、可定制性强 |
| 样式方案 | Tailwind CSS | 原子化 CSS、开发效率高、体积可控 |
| Markdown 编辑器 | Milkdown / Bytemd | 插件化架构、可扩展性强 |
| 代码高亮 | Shiki / Prism | 语法高亮、主题丰富 |
| 数学公式 | KaTeX | 渲染速度快、LaTeX 语法支持 |
| 图表渲染 | Mermaid | 流程图、时序图等多种图表支持 |
| 后端语言 | Rust | 高性能、内存安全、与 Tauri 原生集成 |
| 数据库 | SQLite + rusqlite | 轻量级、零配置、嵌入式数据库 |
| 静态生成 | 自研 Rust 模块 | 完全可控、高性能、定制化 |
| 模板引擎 | Tera / Handlebars | Rust 模板引擎、性能优秀 |

### 1.3 系统架构图

系统采用分层架构设计，从上到下分为：表示层、业务逻辑层、数据访问层、基础设施层。

**架构层次说明：**

1. **表示层（Frontend）**：React 组件、状态管理、路由控制
2. **业务逻辑层（Tauri Commands）**：文章管理、发布流程、图床服务
3. **数据访问层（DAL）**：SQLite 操作、文件系统操作
4. **基础设施层**：本地存储、网络请求、加密服务

---

## 2. 项目结构

### 2.1 目录结构

```
blogforge/
├── src-tauri/           # Tauri 后端（Rust）
│   ├── src/
│   │   ├── commands/    # Tauri 命令（API 端点）
│   │   │   ├── article.rs
│   │   │   ├── image.rs
│   │   │   ├── deploy.rs
│   │   │   └── mod.rs
│   │   ├── models/      # 数据模型
│   │   ├── services/    # 业务服务
│   │   ├── database/    # 数据库操作
│   │   ├── generator/   # 静态网站生成器
│   │   ├── imagebed/    # 图床服务
│   │   ├── deploy/      # 部署服务
│   │   └── utils/       # 工具函数
│   ├── Cargo.toml
│   └── tauri.conf.json   # Tauri 配置
├── src/                 # 前端源码（React）
│   ├── components/      # 通用组件
│   │   ├── common/      # 基础组件（Button, Input 等）
│   │   ├── layout/      # 布局组件（Sidebar, Header 等）
│   │   └── editor/      # 编辑器相关组件
│   ├── pages/           # 页面组件
│   │   ├── Dashboard/
│   │   ├── Articles/
│   │   ├── Editor/
│   │   └── Settings/
│   ├── hooks/           # 自定义 Hooks
│   ├── stores/          # 状态管理
│   ├── services/        # API 调用封装
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数
│   ├── i18n/            # 国际化资源
│   └── styles/          # 全局样式
├── themes/              # 博客主题模板
├── package.json
└── README.md
```

---

## 3. 核心模块设计

### 3.1 文章管理模块

#### 3.1.1 模块职责

- 文章的 CRUD 操作
- 文章状态管理（草稿、已发布、回收站）
- 文章版本历史管理
- 文章搜索与筛选
- 文章导入导出

#### 3.1.2 核心接口设计

```rust
// Tauri Command 定义（Rust）
#[tauri::command]
async fn create_article(title: String, content: String) -> Result<Article, String>

#[tauri::command]
async fn update_article(id: i64, article: UpdateArticleDto) -> Result<Article, String>

#[tauri::command]
async fn delete_article(id: i64) -> Result<(), String>

#[tauri::command]
async fn list_articles(query: ArticleQuery) -> Result<Vec<Article>, String>

#[tauri::command]
async fn search_articles(keyword: String) -> Result<Vec<Article>, String>

#[tauri::command]
async fn get_article_versions(id: i64) -> Result<Vec<ArticleVersion>, String>

#[tauri::command]
async fn restore_article_version(id: i64, version_id: i64) -> Result<Article, String>
```

### 3.2 图床服务模块

#### 3.2.1 模块职责

- 统一图床接口抽象
- 多图床服务适配
- 图片上传、删除、列表管理
- 上传进度回调

#### 3.2.2 图床适配器设计

```rust
// 图床 Trait 定义
pub trait ImageBed: Send + Sync {
    async fn upload(&self, file: &[u8], filename: &str) -> Result<String, Error>;
    async fn delete(&self, url: &str) -> Result<(), Error>;
    async fn list(&self) -> Result<Vec<ImageInfo>, Error>;
    async fn test_connection(&self) -> Result<bool, Error>;
}
```

**支持的图床实现：**

- **GitHubImageBed**：使用 GitHub API 上传到指定仓库
- **AliyunOssImageBed**：阿里云 OSS SDK
- **TencentCosImageBed**：腾讯云 COS SDK
- **CloudflareR2ImageBed**：Cloudflare R2 API
- **CustomImageBed**：自定义 API 接入

### 3.3 静态网站生成器模块

#### 3.3.1 模块职责

- 解析 Markdown 文件并转换为 HTML
- 应用主题模板渲染页面
- 生成 SEO 相关文件（sitemap、RSS、robots.txt）
- 增量构建支持

#### 3.3.2 生成流程

1. 读取文章源文件和元数据
2. 解析 Markdown 内容（支持代码高亮、数学公式、Mermaid）
3. 提取 Front Matter 元数据
4. 应用主题模板渲染 HTML
5. 生成列表页（首页、归档、标签、分类）
6. 生成 SEO 文件（sitemap.xml、feed.xml、robots.txt）
7. 复制静态资源（CSS、JS、图片）
8. 输出到目标目录

#### 3.3.3 SEO 文件生成

| 文件 | 内容说明 |
|-----|---------|
| sitemap.xml | 包含所有页面 URL、最后修改时间、更新频率 |
| feed.xml | RSS 2.0 格式订阅文件，包含最新文章 |
| robots.txt | 爬虫规则配置，指向 sitemap 位置 |
| JSON-LD | 嵌入页面的结构化数据（文章、面包屑等） |
| Open Graph | 社交媒体分享元数据 |

### 3.4 部署服务模块

#### 3.4.1 部署方式

| 部署方式 | 实现技术 | 说明 |
|---------|---------|------|
| 本地导出 | 文件系统操作 | 将生成的静态文件复制到指定目录 |
| Git 部署 | git2 crate | 自动 commit 和 push 到远程仓库 |
| FTP/SFTP | ftp/sftp crate | 上传文件到远程服务器 |
| 一键发布 | 组合上述方式 | 按配置自动执行完整发布流程 |

#### 3.4.2 部署配置结构

```rust
pub struct DeployConfig {
    pub method: DeployMethod,
    pub git_config: Option<GitConfig>,
    pub ftp_config: Option<FtpConfig>,
    pub output_path: PathBuf,
}
```

---

## 4. 数据库设计

### 4.1 数据库选型

采用 SQLite 作为本地数据库，理由如下：

- 零配置，无需安装额外服务
- 单文件存储，便于备份和迁移
- 查询性能优秀，适合小型应用
- Rust 生态支持良好（rusqlite）

### 4.2 核心数据表

#### 4.2.1 articles 表（文章）

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PK, AUTO | 主键 |
| title | TEXT | NOT NULL | 文章标题 |
| slug | TEXT | UNIQUE, NOT NULL | URL 别名 |
| content | TEXT | - | Markdown 内容 |
| excerpt | TEXT | - | 文章摘要 |
| status | TEXT | DEFAULT 'draft' | 文章状态 |
| created_at | DATETIME | DEFAULT NOW | 创建时间 |
| updated_at | DATETIME | DEFAULT NOW | 更新时间 |
| published_at | DATETIME | - | 发布时间 |
| cover_image | TEXT | - | 封面图片 URL |
| meta_title | TEXT | - | SEO 标题 |
| meta_description | TEXT | - | SEO 描述 |
| meta_keywords | TEXT | - | SEO 关键词 |

#### 4.2.2 tags 表（标签）

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PK, AUTO | 主键 |
| name | TEXT | UNIQUE, NOT NULL | 标签名称 |
| slug | TEXT | UNIQUE, NOT NULL | URL 别名 |
| created_at | DATETIME | DEFAULT NOW | 创建时间 |

#### 4.2.3 categories 表（分类）

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PK, AUTO | 主键 |
| name | TEXT | NOT NULL | 分类名称 |
| slug | TEXT | UNIQUE, NOT NULL | URL 别名 |
| parent_id | INTEGER | - | 父分类 ID（支持层级） |
| created_at | DATETIME | DEFAULT NOW | 创建时间 |

#### 4.2.4 article_tags 表（文章-标签关联）

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| article_id | INTEGER | PK, FK | 文章 ID |
| tag_id | INTEGER | PK, FK | 标签 ID |

#### 4.2.5 article_versions 表（文章版本历史）

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PK, AUTO | 主键 |
| article_id | INTEGER | FK | 文章 ID |
| title | TEXT | NOT NULL | 历史版本标题 |
| content | TEXT | - | 历史版本内容 |
| created_at | DATETIME | DEFAULT NOW | 版本创建时间 |

#### 4.2.6 images 表（图片）

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PK, AUTO | 主键 |
| filename | TEXT | NOT NULL | 原始文件名 |
| url | TEXT | NOT NULL | 图片 URL |
| imagebed_id | INTEGER | FK | 所属图床配置 ID |
| size | INTEGER | - | 文件大小（字节） |
| created_at | DATETIME | DEFAULT NOW | 上传时间 |

#### 4.2.7 imagebed_configs 表（图床配置）

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PK, AUTO | 主键 |
| name | TEXT | NOT NULL | 配置名称 |
| type | TEXT | NOT NULL | 图床类型 |
| config | TEXT | NOT NULL | JSON 格式配置 |
| is_default | INTEGER | DEFAULT 0 | 是否默认 |
| created_at | DATETIME | DEFAULT NOW | 创建时间 |

#### 4.2.8 site_config 表（站点配置）

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| key | TEXT | PK | 配置键 |
| value | TEXT | - | 配置值（JSON 格式） |

#### 4.2.9 deploy_configs 表（部署配置）

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PK, AUTO | 主键 |
| name | TEXT | NOT NULL | 配置名称 |
| method | TEXT | NOT NULL | 部署方式 |
| config | TEXT | NOT NULL | JSON 格式配置 |
| is_default | INTEGER | DEFAULT 0 | 是否默认 |
| created_at | DATETIME | DEFAULT NOW | 创建时间 |

---

## 5. API 接口设计

### 5.1 接口规范

所有前后端通信通过 Tauri Command 机制实现，采用异步调用方式。

- **请求**：通过 @tauri-apps/api 的 invoke 函数调用
- **响应**：统一返回 Result<T, String> 类型
- **事件**：通过 Tauri Event 机制实现进度回调和状态通知

### 5.2 核心 API 列表

#### 5.2.1 文章管理 API

| API 名称 | 参数 | 返回值 |
|---------|------|--------|
| create_article | title, content, options? | Article |
| update_article | id, article | Article |
| delete_article | id | void |
| get_article | id | Article |
| list_articles | query? | Article[] |
| search_articles | keyword | Article[] |
| publish_article | id | Article |
| unpublish_article | id | Article |
| get_article_versions | id | ArticleVersion[] |
| restore_version | id, versionId | Article |
| import_articles | files[] | ImportResult |
| export_article | id, format | FilePath |

#### 5.2.2 图片管理 API

| API 名称 | 参数 | 返回值 |
|---------|------|--------|
| upload_image | file, imagebedId? | ImageInfo |
| delete_image | id | void |
| list_images | query? | ImageInfo[] |
| get_imagebeds | - | ImagebedConfig[] |
| create_imagebed | config | ImagebedConfig |
| update_imagebed | id, config | ImagebedConfig |
| delete_imagebed | id | void |
| test_imagebed | id | boolean |
| set_default_imagebed | id | void |

#### 5.2.3 生成与部署 API

| API 名称 | 参数 | 返回值 |
|---------|------|--------|
| generate_site | options? | GenerateResult |
| preview_site | port? | PreviewUrl |
| stop_preview | - | void |
| deploy_site | configId? | DeployResult |
| get_deploy_configs | - | DeployConfig[] |
| create_deploy_config | config | DeployConfig |
| update_deploy_config | id, config | DeployConfig |
| delete_deploy_config | id | void |
| get_deploy_logs | limit? | DeployLog[] |

#### 5.2.4 站点配置 API

| API 名称 | 参数 | 返回值 |
|---------|------|--------|
| get_site_config | - | SiteConfig |
| update_site_config | config | SiteConfig |
| get_themes | - | Theme[] |
| apply_theme | themeId | void |
| get_custom_pages | - | CustomPage[] |
| create_custom_page | page | CustomPage |
| update_custom_page | id, page | CustomPage |
| delete_custom_page | id | void |

---

## 6. 安全设计

### 6.1 敏感数据存储

- 图床密钥、FTP 密码等敏感信息使用系统密钥库加密存储
  - Windows：使用 DPAPI
  - macOS：使用 Keychain
  - Linux：使用 Secret Service API
- Tauri 提供 keyring 插件支持

### 6.2 网络安全

- 所有外部 API 请求使用 HTTPS
- SSL 证书验证
- 请求超时和重试机制

### 6.3 数据备份

- 支持手动导出完整数据备份
- 备份文件包含数据库、文章源文件、配置
- 恢复备份时进行数据校验

---

## 7. 性能优化策略

### 7.1 前端优化

- 组件懒加载和代码分割
- 虚拟列表处理大量文章
- Markdown 预览防抖处理
- 图片懒加载和压缩预览

### 7.2 后端优化

- 数据库索引优化（slug、status、created_at）
- 增量构建：仅重新生成变更的文章
- 文件监听缓存
- 异步并发处理

### 7.3 静态网站优化

- HTML/CSS/JS 压缩
- 图片压缩和 WebP 转换
- 资源文件哈希命名，启用浏览器缓存

---

## 8. 国际化设计

### 8.1 支持语言

- 简体中文（zh-CN）
- English（en-US）

### 8.2 实现方案

- 前端：使用 i18next 库管理翻译资源
- 语言资源文件：src/i18n/zh-CN.json、src/i18n/en-US.json
- 语言切换：设置页面提供语言选择，即时生效
- 默认语言：跟随系统语言设置

---

## 9. 测试策略

### 9.1 单元测试

- Rust 后端：使用 cargo test
- React 前端：使用 Vitest + React Testing Library

### 9.2 集成测试

- Tauri 集成测试：测试前后端通信
- 数据库操作测试
- 静态生成器测试

### 9.3 端到端测试

- 使用 Playwright 进行 E2E 测试
- 覆盖核心用户流程

---

## 10. 发布与部署

### 10.1 构建产物

| 平台 | 构建产物 |
|-----|---------|
| Windows | NSIS 安装包（.exe）、便携版 |
| macOS | DMG 安装包、App Bundle |
| Linux | AppImage、deb、rpm |

### 10.2 自动更新

- 集成 Tauri 内置更新机制
- 支持静默更新和提示更新两种模式
- 更新服务器托管静态更新文件

### 10.3 CI/CD 流程

- 使用 GitHub Actions 自动构建
- 代码提交触发测试
- Tag 发布触发构建和发布

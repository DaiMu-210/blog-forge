# BlogForge - 桌面端博客管理软件规格文档

## 1. 项目概述

### 1.1 项目名称与类型
- **项目名称**: BlogForge
- **项目类型**: 跨平台桌面应用程序
- **核心功能**: 面向个人用户的博客管理系统，支持 Markdown 编辑、本地预览和静态网站生成发布

### 1.2 技术栈
| 层级 | 技术选型 |
|-----|---------|
| 桌面框架 | Tauri 2.x |
| 前端框架 | React 18 + TypeScript |
| 状态管理 | Zustand |
| UI 组件库 | Ant Design |
| 样式方案 | Tailwind CSS |
| Markdown 编辑器 | Milkdown |
| 代码高亮 | Shiki |
| 数据库 | SQLite (rusqlite) |
| 后端语言 | Rust |

### 1.3 目标用户
- 个人博主、技术写作者
- 希望自主管理博客内容的创作者
- 对 SEO 有一定要求的网站运营者
- 偏好 Markdown 写作的开发者群体

---

## 2. UI/UX 规格

### 2.1 布局结构

#### 2.1.1 整体布局
- **三栏式布局**: 侧边栏（导航）、列表区、编辑/预览区
- **侧边栏**: 宽度 240px，可折叠至 64px
- **列表区**: 宽度 300-400px，可调整
- **主内容区**: 自适应剩余宽度
- **最小窗口尺寸**: 1280 × 720 px

#### 2.1.2 页面结构
```
┌────────────────────────────────────────────────────────┐
│  顶部栏（标题、搜索、设置）                              │
├────────┬─────────────────┬────────────────────────────┤
│        │                 │                            │
│ 侧边栏 │   文章列表区     │    编辑/预览区              │
│  导航  │                 │                            │
│        │                 │                            │
│        │                 │                            │
│        │                 │                            │
└────────┴─────────────────┴────────────────────────────┘
```

### 2.2 视觉设计

#### 2.2.1 色彩系统

**亮色主题:**
| 颜色名称 | 色值 | 用途 |
|---------|------|------|
| Primary | #1890FF | 主要按钮、链接、选中状态 |
| Primary Hover | #40A9FF | 主色悬停状态 |
| Primary Active | #096DD9 | 主色按下状态 |
| Success | #52C41A | 成功提示、完成状态 |
| Warning | #FAAD14 | 警告提示、注意事项 |
| Error | #FF4D4F | 错误提示、删除操作 |
| Text Primary | #262626 | 主要文字 |
| Text Secondary | #595959 | 次要文字、说明文字 |
| Border | #D9D9D9 | 边框、分割线 |
| Background | #F5F5F5 | 背景色 |

**暗色主题:**
| 颜色名称 | 色值 |
|---------|------|
| Primary | #177DDC |
| Primary Hover | #3C9AE8 |
| Text Primary | #FFFFFF |
| Text Secondary | #A6A6A6 |
| Border | #434343 |
| Background | #141414 |
| Background Secondary | #1F1F1F |

#### 2.2.2 字体系统

| 平台 | 字体 |
|-----|------|
| Windows | Segoe UI, Microsoft YaHei, sans-serif |
| macOS | -apple-system, BlinkMacSystemFont, PingFang SC, sans-serif |
| Linux | Noto Sans, Noto Sans CJK SC, sans-serif |
| 代码字体 | JetBrains Mono, Consolas, Monaco, monospace |

**字号规范:**
| 层级 | 字号 | 用途 |
|-----|------|------|
| H1 | 24px | 页面标题 |
| H2 | 20px | 区块标题 |
| H3 | 16px | 卡片标题 |
| Body | 14px | 正文内容 |
| Body Small | 12px | 辅助文字 |

#### 2.2.3 间距系统

| 间距名称 | 数值 |
|---------|------|
| xs | 4px |
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 24px |
| 2xl | 32px |

### 2.3 组件规格

#### 按钮
| 类型 | 样式 | 用途 |
|-----|------|------|
| 主要按钮 | 实心背景，主色 | 主要操作（保存、发布） |
| 次要按钮 | 边框按钮 | 次要操作（取消、返回） |
| 文字按钮 | 无边框，文字链接 | 辅助操作 |
| 危险按钮 | 实心背景，红色 | 危险操作（删除） |

#### 按钮尺寸
| 尺寸 | 高度 |
|-----|------|
| Small | 24px |
| Medium | 32px |
| Large | 40px |

#### 卡片
| 属性 | 规范 |
|-----|------|
| 圆角 | 8px |
| 阴影 | 0 2px 8px rgba(0,0,0,0.08) |
| 内边距 | 16px |

### 2.4 动效规范

| 动效类型 | 时长 |
|---------|------|
| 微交互（按钮悬停） | 100-150ms |
| 状态切换（展开/折叠） | 200-300ms |
| 页面过渡 | 300-400ms |

---

## 3. 功能规格

### 3.1 文章管理模块

#### 3.1.1 文章创建与编辑
- 支持创建新文章，自动生成 Front Matter
- Markdown 编辑器支持：
  - 代码块语法高亮
  - 数学公式（LaTeX/KaTeX）
  - 图片上传与预览
  - 实时预览（分屏显示）
- 文章状态管理：草稿、已发布、回收站
- 自动保存与手动保存

#### 3.1.2 文章组织
- 标签系统：支持多标签
- 分类系统：支持层级分类
- 文章搜索：全文搜索、按标签/分类筛选
- 文章排序：按创建时间、修改时间、标题

#### 3.1.3 版本管理
- 自动保存历史版本
- 版本对比
- 一键回滚到指定版本

### 3.2 图片管理模块

#### 3.2.1 图床配置
- GitHub 图床
- 阿里云 OSS
- 腾讯云 COS
- Cloudflare R2
- 自定义图床

#### 3.2.2 图片上传
- 拖拽上传
- 粘贴上传
- 上传进度显示
- 自动插入 Markdown 图片语法

### 3.3 预览模块
- 内置实时预览：编辑器内嵌预览窗口
- 外部浏览器预览
- 响应式预览

### 3.4 静态网站生成模块
- 首页、文章列表页、文章详情页
- 标签页、分类页、归档页
- sitemap.xml、RSS、robots.txt
- 增量构建

### 3.5 发布部署模块
- 本地导出
- Git 部署（GitHub Pages）
- FTP/SFTP 上传
- 一键发布

### 3.6 系统设置
- 界面语言：中文/英文
- 主题模式：亮色/暗色主题
- 编辑器设置：字体、字号、自动保存间隔
- 数据备份与恢复

---

## 4. 数据模型

### 4.1 核心数据表

#### articles（文章表）
| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PK, AUTO | 主键 |
| title | TEXT | NOT NULL | 文章标题 |
| slug | TEXT | UNIQUE, NOT NULL | URL 别名 |
| content | TEXT | - | Markdown 内容 |
| excerpt | TEXT | - | 文章摘要 |
| status | TEXT | DEFAULT 'draft' | 状态 |
| created_at | DATETIME | DEFAULT NOW | 创建时间 |
| updated_at | DATETIME | DEFAULT NOW | 更新时间 |
| published_at | DATETIME | - | 发布时间 |
| cover_image | TEXT | - | 封面图片 |
| meta_title | TEXT | - | SEO 标题 |
| meta_description | TEXT | - | SEO 描述 |
| meta_keywords | TEXT | - | SEO 关键词 |

#### tags（标签表）
| 字段名 | 类型 | 约束 |
|-------|------|------|
| id | INTEGER | PK, AUTO |
| name | TEXT | UNIQUE, NOT NULL |
| slug | TEXT | UNIQUE, NOT NULL |
| created_at | DATETIME | DEFAULT NOW |

#### categories（分类表）
| 字段名 | 类型 | 约束 |
|-------|------|------|
| id | INTEGER | PK, AUTO |
| name | TEXT | NOT NULL |
| slug | TEXT | UNIQUE, NOT NULL |
| parent_id | INTEGER | FK |
| sort_order | INTEGER | DEFAULT 0 |

#### article_tags（文章-标签关联）
| 字段名 | 类型 | 约束 |
|-------|------|------|
| article_id | INTEGER | PK, FK |
| tag_id | INTEGER | PK, FK |

#### article_versions（版本历史）
| 字段名 | 类型 | 约束 |
|-------|------|------|
| id | INTEGER | PK, AUTO |
| article_id | INTEGER | FK |
| title | TEXT | NOT NULL |
| content | TEXT | - |
| created_at | DATETIME | DEFAULT NOW |

#### images（图片表）
| 字段名 | 类型 | 约束 |
|-------|------|------|
| id | INTEGER | PK, AUTO |
| filename | TEXT | NOT NULL |
| url | TEXT | NOT NULL |
| imagebed_id | INTEGER | FK |
| size | INTEGER | - |

#### imagebed_configs（图床配置）
| 字段名 | 类型 | 约束 |
|-------|------|------|
| id | INTEGER | PK, AUTO |
| name | TEXT | NOT NULL |
| type | TEXT | NOT NULL |
| config | TEXT | JSON |
| is_default | INTEGER | DEFAULT 0 |

---

## 5. API 接口设计

### 5.1 文章管理 API

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

### 5.2 图片管理 API

| API 名称 | 参数 | 返回值 |
|---------|------|--------|
| upload_image | file, imagebedId? | ImageInfo |
| delete_image | id | void |
| list_images | query? | ImageInfo[] |
| get_imagebeds | - | ImagebedConfig[] |
| create_imagebed | config | ImagebedConfig |
| delete_imagebed | id | void |
| test_imagebed | id | boolean |

### 5.3 生成与部署 API

| API 名称 | 参数 | 返回值 |
|---------|------|--------|
| generate_site | options? | GenerateResult |
| preview_site | port? | PreviewUrl |
| stop_preview | - | void |
| deploy_site | configId? | DeployResult |
| get_deploy_configs | - | DeployConfig[] |

---

## 6. 验收标准

### 6.1 功能验收
- [ ] 应用可以成功启动
- [ ] 可以创建、编辑、保存文章
- [ ] Markdown 编辑器支持实时预览
- [ ] 可以添加和管理标签、分类
- [ ] 可以切换亮色/暗色主题
- [ ] 可以生成静态网站文件
- [ ] 可以配置图床并上传图片

### 6.2 视觉验收
- [ ] 布局符合三栏式设计
- [ ] 色彩符合设计规范
- [ ] 字体系统正确应用
- [ ] 动效流畅自然
- [ ] 响应式适配正常

### 6.3 性能验收
- [ ] 应用启动时间 ≤ 3 秒
- [ ] 文章列表加载 ≤ 1 秒
- [ ] Markdown 渲染延迟 ≤ 200ms
- [ ] 界面响应时间 ≤ 100ms

---

## 7. 项目结构

```
blogforge/
├── src-tauri/               # Tauri 后端（Rust）
│   ├── src/
│   │   ├── commands/        # Tauri 命令
│   │   ├── models/          # 数据模型
│   │   ├── services/        # 业务服务
│   │   ├── database/        # 数据库操作
│   │   └── utils/           # 工具函数
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                     # 前端源码（React）
│   ├── components/
│   │   ├── common/          # 基础组件
│   │   ├── layout/          # 布局组件
│   │   └── editor/          # 编辑器组件
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Articles/
│   │   ├── Editor/
│   │   └── Settings/
│   ├── hooks/               # 自定义 Hooks
│   ├── stores/              # 状态管理
│   ├── services/            # API 调用
│   ├── types/               # 类型定义
│   └── utils/               # 工具函数
├── package.json
└── README.md
```

# BlogForge 数据库设计文档

**版本**: 1.0.0  
**日期**: 2026-05-08

---

## 1. 数据库概述

### 1.1 数据库选型

本项目采用 SQLite 作为本地数据库，主要考虑以下因素：

- 零配置，无需安装额外数据库服务
- 单文件存储，体积小，便于备份迁移
- 查询性能优秀，适合小型应用
- 跨平台：支持 Windows、macOS、Linux
- Rust 生态支持良好（rusqlite）

### 1.2 数据库文件

- 文件名：`blogforge.db`
- 存储位置：用户数据目录（通过 Tauri app_data_dir 获取）
- 备份文件：`blogforge_backup_YYYYMMDD.db`

### 1.3 数据表清单

| 表名 | 说明 |
|-----|------|
| articles | 文章主表 |
| tags | 标签表 |
| categories | 分类表 |
| article_tags | 文章-标签关联表 |
| article_categories | 文章-分类关联表 |
| article_versions | 文章版本历史表 |
| images | 图片资源表 |
| imagebed_configs | 图床配置表 |
| site_config | 站点配置表 |
| deploy_configs | 部署配置表 |
| deploy_logs | 部署日志表 |
| custom_pages | 自定义页面表 |

---

## 2. 数据表详细设计

### 2.1 articles 表（文章主表）

存储文章的基本信息和内容。

**字段定义：**

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PK, AUTO | 主键，自增 |
| title | TEXT | NOT NULL | 文章标题 |
| slug | TEXT | UNIQUE, NOT NULL | URL 别名，用于生成静态文件路径 |
| content | TEXT | - | Markdown 内容 |
| excerpt | TEXT | - | 文章摘要，用于列表展示和 SEO |
| status | TEXT | DEFAULT 'draft' | 文章状态：draft/published/trash |
| created_at | DATETIME | DEFAULT NOW | 创建时间 |
| updated_at | DATETIME | DEFAULT NOW | 更新时间 |
| published_at | DATETIME | - | 发布时间 |
| cover_image | TEXT | - | 封面图片 URL |
| meta_title | TEXT | - | SEO 标题，为空则使用 title |
| meta_description | TEXT | - | SEO 描述，为空则使用 excerpt |
| meta_keywords | TEXT | - | SEO 关键词，逗号分隔 |
| is_top | INTEGER | DEFAULT 0 | 是否置顶：0/1 |
| view_count | INTEGER | DEFAULT 0 | 浏览次数（可选功能） |

**索引：**

- `idx_articles_slug`：slug 字段唯一索引
- `idx_articles_status`：status 字段索引
- `idx_articles_created_at`：created_at 字段索引

### 2.2 tags 表（标签表）

存储标签信息。

**字段定义：**

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PK, AUTO | 主键，自增 |
| name | TEXT | UNIQUE, NOT NULL | 标签名称 |
| slug | TEXT | UNIQUE, NOT NULL | URL 别名 |
| color | TEXT | - | 标签颜色（可选） |
| created_at | DATETIME | DEFAULT NOW | 创建时间 |

**索引：**

- `idx_tags_slug`：slug 字段唯一索引

### 2.3 categories 表（分类表）

存储分类信息，支持层级结构。

**字段定义：**

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PK, AUTO | 主键，自增 |
| name | TEXT | NOT NULL | 分类名称 |
| slug | TEXT | UNIQUE, NOT NULL | URL 别名 |
| parent_id | INTEGER | FK, DEFAULT NULL | 父分类 ID，支持层级 |
| sort_order | INTEGER | DEFAULT 0 | 排序序号 |
| created_at | DATETIME | DEFAULT NOW | 创建时间 |

**外键：**

- `fk_categories_parent`：parent_id → categories(id)

### 2.4 article_tags 表（文章-标签关联表）

存储文章与标签的多对多关系。

**字段定义：**

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| article_id | INTEGER | PK, FK, NOT NULL | 文章 ID |
| tag_id | INTEGER | PK, FK, NOT NULL | 标签 ID |

**外键：**

- `fk_article_tags_article`：article_id → articles(id)
- `fk_article_tags_tag`：tag_id → tags(id)

### 2.5 article_categories 表（文章-分类关联表）

存储文章与分类的关联关系。

**字段定义：**

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| article_id | INTEGER | PK, FK, NOT NULL | 文章 ID |
| category_id | INTEGER | PK, FK, NOT NULL | 分类 ID |

**说明：**

一篇文章只能属于一个分类，但使用关联表设计便于后期扩展。

### 2.6 article_versions 表（文章版本历史表）

存储文章的历史版本，支持版本回滚。

**字段定义：**

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PK, AUTO | 主键，自增 |
| article_id | INTEGER | FK, NOT NULL | 文章 ID |
| title | TEXT | NOT NULL | 历史版本标题 |
| content | TEXT | - | 历史版本内容 |
| created_at | DATETIME | DEFAULT NOW | 版本创建时间 |

**外键：**

- `fk_versions_article`：article_id → articles(id)

**索引：**

- `idx_versions_article`：article_id 字段索引

### 2.7 images 表（图片资源表）

存储已上传图片的信息。

**字段定义：**

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PK, AUTO | 主键，自增 |
| filename | TEXT | NOT NULL | 原始文件名 |
| storage_key | TEXT | NOT NULL | 存储路径/键名 |
| url | TEXT | NOT NULL | 图片访问 URL |
| imagebed_id | INTEGER | FK | 所属图床配置 ID |
| size | INTEGER | - | 文件大小（字节） |
| width | INTEGER | - | 图片宽度（像素） |
| height | INTEGER | - | 图片高度（像素） |
| mime_type | TEXT | - | MIME 类型 |
| created_at | DATETIME | DEFAULT NOW | 上传时间 |

**外键：**

- `fk_images_imagebed`：imagebed_id → imagebed_configs(id)

### 2.8 imagebed_configs 表（图床配置表）

存储图床服务的配置信息。

**字段定义：**

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PK, AUTO | 主键，自增 |
| name | TEXT | NOT NULL | 配置名称 |
| type | TEXT | NOT NULL | 图床类型：github/aliyun/tencent/r2/custom |
| config | TEXT | NOT NULL | JSON 格式配置（加密存储敏感信息） |
| is_default | INTEGER | DEFAULT 0 | 是否默认：0/1 |
| created_at | DATETIME | DEFAULT NOW | 创建时间 |
| updated_at | DATETIME | DEFAULT NOW | 更新时间 |

**配置 JSON 结构示例：**

```json
// GitHub 图床配置
{ "repo": "user/repo", "branch": "main", "token": "***", "path": "images" }
```

### 2.9 site_config 表（站点配置表）

以键值对形式存储站点配置。

**字段定义：**

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| key | TEXT | PK, NOT NULL | 配置键 |
| value | TEXT | - | 配置值（JSON 格式） |

**预定义配置项：**

| 配置键 | 说明 |
|-------|------|
| site_info | 站点基本信息（名称、描述、作者、URL） |
| theme | 当前主题配置 |
| navigation | 导航菜单配置 |
| social_links | 社交链接配置 |
| seo_settings | SEO 全局设置 |
| comment_config | 评论系统配置 |
| analytics_config | 统计代码配置 |
| app_settings | 应用设置（语言、主题模式等） |

### 2.10 deploy_configs 表（部署配置表）

存储部署配置信息。

**字段定义：**

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PK, AUTO | 主键，自增 |
| name | TEXT | NOT NULL | 配置名称 |
| method | TEXT | NOT NULL | 部署方式：local/git/ftp/sftp |
| config | TEXT | NOT NULL | JSON 格式配置（加密存储敏感信息） |
| is_default | INTEGER | DEFAULT 0 | 是否默认：0/1 |
| created_at | DATETIME | DEFAULT NOW | 创建时间 |
| updated_at | DATETIME | DEFAULT NOW | 更新时间 |

### 2.11 deploy_logs 表（部署日志表）

记录部署操作日志。

**字段定义：**

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PK, AUTO | 主键，自增 |
| config_id | INTEGER | FK | 部署配置 ID |
| status | TEXT | NOT NULL | 部署状态：success/failed |
| message | TEXT | - | 日志消息 |
| files_count | INTEGER | - | 部署文件数量 |
| duration_ms | INTEGER | - | 耗时（毫秒） |
| created_at | DATETIME | DEFAULT NOW | 部署时间 |

**索引：**

- `idx_deploy_logs_created`：created_at 字段索引

### 2.12 custom_pages 表（自定义页面表）

存储自定义页面（如关于页、友链页）。

**字段定义：**

| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INTEGER | PK, AUTO | 主键，自增 |
| title | TEXT | NOT NULL | 页面标题 |
| slug | TEXT | UNIQUE, NOT NULL | URL 别名 |
| content | TEXT | - | Markdown 内容 |
| layout | TEXT | DEFAULT 'page' | 页面布局模板 |
| is_published | INTEGER | DEFAULT 0 | 是否发布：0/1 |
| created_at | DATETIME | DEFAULT NOW | 创建时间 |
| updated_at | DATETIME | DEFAULT NOW | 更新时间 |

---

## 3. 实体关系说明

### 3.1 核心关系

- **articles ↔ tags**：多对多关系，通过 article_tags 关联
- **articles ↔ categories**：多对一关系，通过 article_categories 关联
- **articles → article_versions**：一对多关系，存储历史版本
- **images → imagebed_configs**：多对一关系，记录图片来源

### 3.2 关系图示意

```
┌─────────────┐       ┌─────────────┐
│   articles  │───M:N─│    tags     │
└──────┬──────┘       └─────────────┘
       │
       │1:N
       ▼
┌─────────────┐       ┌─────────────┐
│  versions   │       │ categories  │
└─────────────┘       └──────┬──────┘
                             │
                             │M:1
                             ▼
                      ┌─────────────┐
                      │   articles  │
                      └─────────────┘
```

---

## 4. 数据迁移策略

### 4.1 版本管理

- 数据库版本号存储在 site_config 表中
- 每次启动检查版本号，执行必要的迁移脚本
- 迁移脚本放在 migrations/ 目录，按版本号命名

### 4.2 初始化脚本

首次启动时执行 init.sql 创建所有表结构：

```sql
-- 创建 articles 表
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    -- ... 其他字段
);
```

---

## 5. 备份与恢复

### 5.1 自动备份

- 每次应用启动时自动备份数据库
- 保留最近 5 个备份文件
- 备份文件命名：`blogforge_backup_YYYYMMDD_HHMMSS.db`

### 5.2 手动备份

- 用户可在设置页面手动导出备份
- 备份内容包括：数据库文件、文章源文件、配置文件
- 导出格式：ZIP 压缩包

### 5.3 数据恢复

- 支持从备份文件恢复
- 恢复前验证备份文件完整性
- 恢复前自动备份当前数据

---

## 6. 性能优化建议

### 6.1 索引策略

- 为常用查询字段创建索引
- 避免过度索引，影响写入性能
- 定期执行 ANALYZE 更新统计信息

### 6.2 查询优化

- 使用分页查询，避免一次性加载大量数据
- 使用事务批量操作
- 避免 SELECT *，只查询需要的字段

### 6.3 数据清理

- 定期清理过期的文章版本历史（保留最近 20 个版本）
- 定期清理超过 30 天的部署日志
- 定期执行 VACUUM 压缩数据库

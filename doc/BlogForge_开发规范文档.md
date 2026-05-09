# BlogForge 开发规范文档

**版本**: 1.0.0  
**日期**: 2026-05-08

---

## 1. 代码规范

### 1.1 TypeScript/JavaScript 规范

#### 1.1.1 命名规范

| 类型 | 命名规则 |
|-----|---------|
| 组件 | PascalCase（如 ArticleEditor） |
| 函数/方法 | camelCase（如 fetchArticles） |
| 变量 | camelCase（如 articleList） |
| 常量 | UPPER_SNAKE_CASE（如 API_BASE_URL） |
| 类型/接口 | PascalCase（如 Article, ArticleProps） |
| 枚举 | PascalCase，成员 UPPER_SNAKE_CASE |
| 文件名（组件） | PascalCase.tsx（如 ArticleEditor.tsx） |
| 文件名（工具） | camelCase.ts（如 formatDate.ts） |

#### 1.1.2 代码风格

- 使用 ESLint + Prettier 进行代码格式化
- 缩进：2 空格
- 引号：优先使用单引号
- 分号：不强制使用分号
- 行宽：100 字符
- 尾随逗号：ES5 兼容

#### 1.1.3 TypeScript 规范

- 严格模式：启用 strict: true
- 显式类型：函数参数和返回值必须声明类型
- 避免 any：使用 unknown 或具体类型
- 接口优先：优先使用 interface 而非 type
- 类型导入：使用 import type 导入类型

#### 1.1.4 React 组件规范

- 函数组件：使用函数组件和 Hooks
- 组件结构：组件 → Hooks → Handlers → Render
- Props 类型：定义 Props 接口
- 默认值：使用默认参数或 defaultProps
- memo：纯展示组件使用 React.memo

### 1.2 Rust 规范

#### 1.2.1 命名规范

| 类型 | 命名规则 |
|-----|---------|
| 结构体/枚举 | PascalCase（如 Article, ImageConfig） |
| 函数/方法 | snake_case（如 create_article） |
| 变量 | snake_case（如 article_list） |
| 常量 | UPPER_SNAKE_CASE（如 MAX_VERSIONS） |
| 模块 | snake_case（如 article_service） |
| Trait | PascalCase（如 ImageBed） |

#### 1.2.2 代码风格

- 使用 rustfmt 格式化代码
- 使用 clippy 进行静态检查
- 缩进：4 空格
- 行宽：100 字符
- 文档注释：使用 /// 或 //!

#### 1.2.3 错误处理

- 使用 Result<T, E> 返回错误
- 使用 thiserror 定义自定义错误类型
- 避免 panic，使用 ? 传播错误
- Tauri Command 返回 Result<T, String>

---

## 2. Git 规范

### 2.1 分支策略

| 分支类型 | 说明 |
|---------|------|
| main | 主分支，稳定版本代码 |
| develop | 开发分支，集成最新功能 |
| feature/* | 功能分支，如 feature/article-editor |
| bugfix/* | Bug 修复分支 |
| release/* | 发布分支，如 release/v1.0.0 |
| hotfix/* | 紧急修复分支 |

### 2.2 Commit 规范

采用 Conventional Commits 规范：

```
<type>(<scope>): <subject>
```

**类型说明：**

| 类型 | 说明 |
|-----|------|
| feat | 新功能 |
| fix | Bug 修复 |
| docs | 文档更新 |
| style | 代码格式（不影响功能） |
| refactor | 重构代码 |
| perf | 性能优化 |
| test | 测试相关 |
| chore | 构建/工具相关 |
| ci | CI 配置相关 |

**示例：**

```
feat(editor): add code block syntax highlighting
fix(article): resolve version history restore issue
docs(readme): update installation guide
```

### 2.3 PR 规范

- 标题格式：`<type>: <description>`
- 描述包含：改动内容、测试方法、相关 Issue
- 关联 Issue：使用 Fixes #123 或 Closes #123
- 代码审查：至少一人 Review 通过
- CI 检查：所有测试通过

---

## 3. 项目结构规范

### 3.1 前端目录规范

```
src/
├── components/          # 通用组件
│   ├── common/          # 基础组件（Button, Input 等）
│   ├── layout/          # 布局组件（Sidebar, Header 等）
│   └── editor/          # 编辑器相关组件
├── pages/               # 页面组件
│   ├── Dashboard/
│   ├── Articles/
│   ├── Editor/
│   └── Settings/
├── hooks/               # 自定义 Hooks
├── stores/              # 状态管理
├── services/            # API 服务
├── types/               # 类型定义
├── utils/               # 工具函数
├── i18n/                # 国际化资源
└── styles/              # 全局样式
```

### 3.2 后端目录规范

```
src-tauri/src/
├── commands/            # Tauri 命令（API 端点）
│   ├── article.rs       # 文章相关命令
│   ├── image.rs         # 图片相关命令
│   └── deploy.rs        # 部署相关命令
├── models/              # 数据模型
├── services/            # 业务服务
├── database/            # 数据库操作
├── generator/           # 静态网站生成器
├── imagebed/            # 图床服务
├── deploy/              # 部署服务
├── utils/               # 工具函数
├── error.rs             # 错误定义
└── lib.rs               # 模块导出
```

---

## 4. 注释规范

### 4.1 TypeScript 注释

- 使用 JSDoc 格式注释公共 API
- 复杂逻辑添加行内注释说明
- TODO 使用 // TODO: 格式

**示例：**

```typescript
/**
 * 获取文章列表
 * @param query 查询参数
 * @returns 文章列表
 */
async function fetchArticles(query: ArticleQuery): Promise<Article[]> {
  // 实现逻辑
}
```

### 4.2 Rust 注释

- 公共 API 使用文档注释 ///
- 模块级文档使用 //!
- 复杂逻辑添加普通注释 //

**示例：**

```rust
/// 创建新文章
/// # Arguments
/// * `title` - 文章标题
/// * `content` - 文章内容
/// # Returns
/// 创建成功返回文章对象，失败返回错误
pub fn create_article(title: &str, content: &str) -> Result<Article, Error> {
    // 实现逻辑
}
```

---

## 5. 测试规范

### 5.1 单元测试

- 每个模块必须有对应的测试文件
- 测试覆盖率目标：核心逻辑 ≥ 80%
- 测试命名：should_xxx_when_xxx
- Rust 测试与代码放在同一文件（#[cfg(test)]）

### 5.2 测试文件命名

| 类型 | 命名规则 |
|-----|---------|
| React 组件测试 | ComponentName.test.tsx |
| 工具函数测试 | functionName.test.ts |
| Hook 测试 | useHookName.test.ts |
| Rust 测试 | 与源文件同名，#[cfg(test)] 模块内 |

### 5.3 测试原则

- **AAA 模式**：Arrange（准备）、Act（执行）、Assert（断言）
- **单一职责**：每个测试只验证一个行为
- **独立性**：测试之间互不依赖
- **可重复**：多次运行结果一致

---

## 6. 文档规范

### 6.1 代码文档

- 公共 API 必须有文档注释
- 复杂算法必须有实现说明
- 使用 TypeDoc/Rustdoc 生成 API 文档

### 6.2 项目文档

| 文档类型 | 说明 |
|---------|------|
| README.md | 项目介绍、快速开始、安装指南 |
| CHANGELOG.md | 版本变更记录 |
| CONTRIBUTING.md | 贡献指南 |
| docs/ | 详细文档目录 |
| docs/architecture.md | 架构设计文档 |
| docs/api.md | API 接口文档 |
| docs/deployment.md | 部署指南 |

---

## 7. 依赖管理

### 7.1 前端依赖

- 使用 pnpm 管理依赖
- 定期更新依赖，关注安全漏洞
- 锁定版本号，使用 pnpm-lock.yaml
- 避免引入重复功能的依赖

### 7.2 Rust 依赖

- 使用 Cargo 管理依赖
- 锁定版本号，使用 Cargo.lock
- 定期运行 cargo audit 检查安全漏洞
- 优先使用成熟稳定的 crate

---

## 8. 日志规范

### 8.1 日志级别

| 级别 | 使用场景 |
|-----|---------|
| ERROR | 错误信息，需要立即处理 |
| WARN | 警告信息，潜在问题 |
| INFO | 重要业务信息 |
| DEBUG | 调试信息，开发阶段使用 |
| TRACE | 详细追踪信息，仅开发调试 |

### 8.2 日志格式

- 前端：使用 console 对象，生产环境移除 console.log
- 后端：使用 log/tracing crate，结构化日志输出

**日志格式：** `[时间] [级别] [模块] 消息`

**示例：** `2024-01-15 10:30:00 [INFO] [article_service] Article created: id=123`

---

## 9. 安全规范

### 9.1 敏感数据处理

- 密钥、密码等敏感信息禁止明文存储
- 使用系统密钥库存储敏感配置
- 敏感信息禁止写入日志
- 禁止将敏感信息提交到代码仓库

### 9.2 输入验证

- 所有用户输入必须验证和清理
- 防止 XSS 攻击，对输出进行转义
- 文件路径验证，防止路径遍历

### 9.3 依赖安全

- 定期检查依赖安全漏洞
- 及时更新有漏洞的依赖
- 避免使用不再维护的依赖

---

## 10. 性能规范

### 10.1 前端性能

- 组件懒加载，减少首屏加载时间
- 列表使用虚拟滚动
- 避免不必要的重渲染
- 图片懒加载和压缩
- 防抖/节流处理频繁操作

### 10.2 后端性能

- 数据库查询优化，添加必要索引
- 避免 N+1 查询问题
- 使用异步操作处理耗时任务
- 合理使用缓存

---

## 11. 发布规范

### 11.1 版本号规范

采用语义化版本号：MAJOR.MINOR.PATCH

| 版本类型 | 说明 |
|---------|------|
| MAJOR | 不兼容的 API 变更 |
| MINOR | 向后兼容的功能新增 |
| PATCH | 向后兼容的问题修复 |

### 11.2 发布检查清单

1. 所有测试通过
2. 代码审查完成
3. CHANGELOG.md 已更新
4. 版本号已更新
5. 文档已同步更新
6. 构建产物已测试

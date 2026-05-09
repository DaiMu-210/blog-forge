# Tasks

- [x] Task 1: 安装前端依赖 marked + DOMPurify
  - 运行 `npm install marked dompurify` 和 `npm install -D @types/dompurify`

- [x] Task 2: 创建 MarkdownPreview 组件
  - 位置：`src/components/editor/MarkdownPreview.tsx`
  - 接收 markdown 字符串，使用 marked 渲染为 HTML
  - 使用 DOMPurify 过滤 XSS
  - 支持自定义 className
  - 使用 `useMemo` 避免不必要的重渲染

- [x] Task 3: 改造编辑器为分栏布局
  - 位置：`src/pages/Editor/index.tsx`
  - 编辑区与预览区左右分栏（grid-cols-1 lg:grid-cols-2）
  - 工具栏添加"预览"切换按钮（Eye 图标），控制预览区显示/隐藏
  - 预览关闭时编辑器占满全宽
  - CSS 样式让预览区有合适的滚动和排版

- [x] Task 4: 后端支持单篇文章生成
  - 位置：`src-tauri/src/generator/mod.rs`
  - 新增 `generate_article_preview(article: &Article) -> AppResult<String>` 函数
  - 读取站点配置获取站点标题/描述等
  - 使用 Tera 模板渲染完整 HTML 页面
  - 位置：`src-tauri/src/commands/article.rs`
  - 新增 `preview_article(state, id) -> Result<String, String>` 命令
  - 在 `src-tauri/src/lib.rs` 注册命令

- [x] Task 5: 前端预览单篇文章功能
  - 位置：`src/api.ts`
  - 新增 `previewArticle(id: number): Promise<string>` API
  - 位置：`src/pages/Editor/index.tsx`
  - 工具栏添加"预览站点"按钮（ExternalLink 图标）
  - 点击后调用 previewArticle，在模态框中以 iframe 展示 HTML

- [x] Task 6: i18n 翻译
  - zh-CN.json: `editor.togglePreview`、`editor.previewArticle`、`editor.previewSite`
  - en-US.json: 对应英文翻译

- [x] Task 7: 编译验证
  - `npm run build` 前端编译通过
  - `cargo build` 后端编译通过

- [x] Task 8: 重写 generate_site 生成完整静态站点
  - 位置：`src-tauri/src/generator/mod.rs`
  - 修改 `generate_site` 函数签名，接收 `articles: &[Article]` 和 `config_entries: &[SiteConfigEntry]` 参数
  - 从 config_entries 提取站点标题、作者等配置
  - 生成 style.css 文件（复用 generate_article_preview 中的内联样式）
  - 使用 Tera 生成 index.html（文章目录列表页，展示所有已发布文章标题和日期）
  - 为每篇文章调用 `generate_article_preview` 生成独立的 HTML 文件
  - 文章页面命名为 `{article.id}.html`
  - 返回 `GeneratedSite { files_count }` 统计生成的文件总数

- [x] Task 9: 新增 preview_site 命令
  - 位置：`src-tauri/src/commands/deploy.rs`
  - 新增 `preview_site(state: State<'_, DbState>) -> Result<serde_json::Value, String>` 命令
  - 查询所有已发布文章（status = "published"）
  - 获取站点配置
  - 在临时目录（`std::env::temp_dir()/blogforge-preview`）生成站点
  - 若已有预览服务器运行，先停止旧服务器
  - 启动新的 `SiteServer`，返回 `{ url: "http://127.0.0.1:{port}", files_count: N }`
  - 使用全局静态 `Mutex<Option<SiteServer>>` 管理服务器生命周期

- [x] Task 10: 更新 lib.rs 注册模块和命令
  - 位置：`src-tauri/src/lib.rs`
  - 添加 `pub mod server;` 模块声明
  - 在 `invoke_handler` 中注册 `commands::deploy::preview_site`

- [x] Task 11: 前端 api.ts + Editor 预览站点按钮
  - 位置：`src/api.ts` deploy 部分新增 `previewSite: () => invoke<{ url: string; files_count: number }>('preview_site')`
  - 位置：`src/pages/Editor/index.tsx`
  - 引入 `Globe` 图标 (lucide-react)
  - 工具栏添加"预览站点"按钮
  - 点击后调用 `previewSite()` API，通过 `window.open(url, '_blank')` 在浏览器中打开
  - 添加 loading 状态和错误处理

- [x] Task 12: 编译验证
  - `cargo build` 后端编译通过
  - `npm run build` 前端编译通过

# Task Dependencies
- Task 2 依赖 Task 1
- Task 3 依赖 Task 2
- Task 5 依赖 Task 4
- Task 6 依赖 Task 3, 5
- Task 7 依赖 Task 6
- Task 8 是独立后端任务，可并行
- Task 9 依赖 Task 4 (server.rs 已创建) 和 Task 8 (generate_site 重写)
- Task 10 依赖 Task 9
- Task 11 依赖 Task 9 (需要后端命令可用)
- Task 12 依赖 Task 8, 9, 10, 11

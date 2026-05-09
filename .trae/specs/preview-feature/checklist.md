# Preview Feature Checklist

## Task 1: 安装依赖
- [x] marked + dompurify + @types/dompurify 已安装到 package.json

## Task 2: MarkdownPreview 组件
- [x] `src/components/editor/MarkdownPreview.tsx` 已创建
- [x] 接收 markdown 字符串 props 并渲染为 HTML
- [x] 使用 DOMPurify 进行 XSS 过滤
- [x] 使用 useMemo 优化性能

## Task 3: 编辑器分栏布局
- [x] 编辑区默认左右分栏（编辑 + 预览）
- [x] 工具栏有预览切换按钮，可隐藏/显示预览区
- [x] 预览关闭时编辑器占满全宽
- [x] 预览区有适当的滚动和排版样式

## Task 4: 后端单篇文章生成
- [x] `generator/mod.rs` 新增 `generate_article_preview` 函数
- [x] `commands/article.rs` 新增 `preview_article` 命令
- [x] `lib.rs` 注册了 `preview_article` 命令
- [x] 后端编译通过

## Task 5: 前端预览单篇文章
- [x] `api.ts` 新增 `previewArticle` 函数
- [x] 编辑器工具栏有"预览"按钮
- [x] 点击后在模态框/iframe 中展示预览
- [x] 预览按钮对未保存的新文章禁用或提示先保存

## Task 6: i18n
- [x] zh-CN.json 包含 `editor.togglePreview`、`editor.previewArticle` 等键
- [x] en-US.json 包含对应的英文翻译

## Task 7: 编译验证
- [x] `npm run build` 通过
- [x] `cargo build` 通过

## Task 8: 重写 generate_site 生成完整静态站点
- [x] `generate_site` 接收 `articles` 和 `config_entries` 参数
- [x] 生成 style.css 文件
- [x] 使用 Tera 生成 index.html 目录列表页
- [x] 每篇已发布文章生成独立 HTML 文件
- [x] 返回正确的 files_count

## Task 9: 新增 preview_site 命令
- [x] `preview_site` 命令查询已发布文章
- [x] 获取站点配置并传给生成器
- [x] 在临时目录生成站点
- [x] 使用全局 Mutex 管理 SiteServer 生命周期
- [x] 返回正确的 url 和 files_count

## Task 10: 更新 lib.rs
- [x] `pub mod server;` 声明存在
- [x] `preview_site` 在 invoke_handler 中注册

## Task 11: 前端预览站点按钮
- [x] `api.ts` 有 `previewSite` 函数
- [x] Editor 工具栏有 Globe 图标预览站点按钮
- [x] 点击按钮调用 previewSite 并用 window.open 打开

## Task 12: 编译验证
- [x] `npm run build` 通过
- [x] `cargo build` 通过

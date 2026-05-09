use crate::models::{AppResult, Article, SiteConfigEntry};
use std::collections::HashMap;
use std::path::Path;
use tera::{Context, Tera};

#[derive(Debug, Clone, serde::Serialize)]
pub struct GeneratedSite {
    pub success: bool,
    pub output_path: String,
    pub files_count: i64,
}

pub fn generate_site(output_path: &Path, articles: &[Article], config_entries: &[SiteConfigEntry]) -> AppResult<GeneratedSite> {
    std::fs::create_dir_all(output_path)?;

    let config_map: HashMap<String, String> = config_entries
        .iter()
        .map(|e| (e.key.clone(), e.value.clone()))
        .collect();

    let site_title = config_map.get("site_title").cloned().unwrap_or_else(|| "BlogForge".to_string());

    let css = r#"body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.8; color: #333; }
h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.meta { color: #888; font-size: 0.9em; margin-bottom: 20px; }
.content { font-size: 1.1em; }
.content p { margin: 1em 0; }
.content pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
.content code { background: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-size: 0.9em; }
.content pre code { background: none; padding: 0; }
.content img { max-width: 100%; height: auto; }
.content blockquote { border-left: 4px solid #ddd; margin: 1em 0; padding: 10px 20px; color: #666; background: #fafafa; }
.content table { border-collapse: collapse; width: 100%; }
.content th, .content td { border: 1px solid #ddd; padding: 8px; text-align: left; }
.content th { background: #f5f5f5; }
.article-list { list-style: none; padding: 0; }
.article-item { border-bottom: 1px solid #eee; padding: 15px 0; }
.article-item a { font-size: 1.2em; color: #333; text-decoration: none; }
.article-item a:hover { color: #0066cc; }
.article-date { color: #999; font-size: 0.85em; margin-top: 4px; }
.no-articles { text-align: center; color: #999; padding: 40px 0; }"#;
    std::fs::write(output_path.join("style.css"), css)?;

    let mut files_count: i64 = 1;

    let index_template = r#"<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ site_title }}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>{{ site_title }}</h1>
    {% if articles | length > 0 %}
    <ul class="article-list">
        {% for article in articles %}
        <li class="article-item">
            <a href="{{ article.id }}.html">{{ article.title }}</a>
            <div class="article-date">{{ article.updated_at }}</div>
        </li>
        {% endfor %}
    </ul>
    {% else %}
    <p class="no-articles">暂无文章</p>
    {% endif %}
</body>
</html>"#;

    let mut tera = Tera::default();
    tera.add_raw_template("index.html", index_template)
        .map_err(|e| crate::models::AppError::Generator(format!("模板解析失败: {}", e)))?;

    let mut ctx = Context::new();
    ctx.insert("site_title", &site_title);
    ctx.insert("articles", articles);

    let index_html = tera.render("index.html", &ctx)
        .map_err(|e| crate::models::AppError::Generator(format!("模板渲染失败: {}", e)))?;
    std::fs::write(output_path.join("index.html"), index_html)?;
    files_count += 1;

    for article in articles {
        let html = generate_article_preview(article, config_entries)?;
        std::fs::write(output_path.join(format!("{}.html", article.id)), html)?;
        files_count += 1;
    }

    Ok(GeneratedSite {
        success: true,
        output_path: output_path.to_string_lossy().to_string(),
        files_count,
    })
}

pub fn generate_article_preview(article: &Article, config_entries: &[SiteConfigEntry]) -> AppResult<String> {
    let config_map: HashMap<String, String> = config_entries
        .iter()
        .map(|e| (e.key.clone(), e.value.clone()))
        .collect();

    let site_title = config_map.get("site_title").cloned().unwrap_or_else(|| "BlogForge".to_string());
    let author = config_map.get("author").cloned().unwrap_or_default();
    let theme_template = config_map.get("theme_template").cloned().unwrap_or_default();

    let template_content = if theme_template.is_empty() {
        r#"<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }} - {{ site_title }}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.8; color: #333; }
        h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .meta { color: #888; font-size: 0.9em; margin-bottom: 20px; }
        .content { font-size: 1.1em; }
        .content p { margin: 1em 0; }
        .content pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .content code { background: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-size: 0.9em; }
        .content pre code { background: none; padding: 0; }
        .content img { max-width: 100%; height: auto; }
        .content blockquote { border-left: 4px solid #ddd; margin: 1em 0; padding: 10px 20px; color: #666; background: #fafafa; }
        .content table { border-collapse: collapse; width: 100%; }
        .content th, .content td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .content th { background: #f5f5f5; }
    </style>
</head>
<body>
    <h1>{{ title }}</h1>
    <div class="meta">
        {% if date %}<span>发布日期: {{ date }}</span>{% endif %}
        {% if author %}<span> | 作者: {{ author }}</span>{% endif %}
    </div>
    <div class="content">
        {{ content }}
    </div>
</body>
</html>"#
    } else {
        &theme_template
    };

    let mut tera = Tera::default();
    tera.add_raw_template("article.html", template_content)
        .map_err(|e| crate::models::AppError::Generator(format!("模板解析失败: {}", e)))?;

    let mut ctx = Context::new();
    ctx.insert("title", &article.title);
    ctx.insert("content", &article.content);
    ctx.insert("site_title", &site_title);
    ctx.insert("date", &article.updated_at);
    ctx.insert("author", &author);

    tera.render("article.html", &ctx)
        .map_err(|e| crate::models::AppError::Generator(format!("模板渲染失败: {}", e)))
}

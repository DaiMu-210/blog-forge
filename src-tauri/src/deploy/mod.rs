pub mod cos;

use crate::models::{AppResult, Article, SiteConfigEntry};
use std::path::PathBuf;

#[derive(Debug, Clone, serde::Serialize)]
pub struct DeployResult {
    pub success: bool,
    pub output_path: String,
    pub message: String,
}

pub fn deploy_local(output_dir: &PathBuf, articles: &[Article], config_entries: &[SiteConfigEntry]) -> AppResult<DeployResult> {
    let result = crate::generator::generate_site(output_dir, articles, config_entries)?;
    Ok(DeployResult {
        success: result.success,
        output_path: result.output_path,
        message: if result.success { "站点生成成功".to_string() } else { "站点生成失败".to_string() },
    })
}

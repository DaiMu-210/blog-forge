use std::path::{Path, PathBuf};
use std::fs;
use hmac::{Hmac, Mac};
use sha2::{Sha256, Digest};
use crate::models::{AppError, AppResult};

type HmacSha256 = Hmac<Sha256>;

#[derive(Debug, Clone, serde::Deserialize)]
pub struct CosConfig {
    pub secret_id: String,
    pub secret_key: String,
    pub region: String,
    pub bucket: String,
    #[serde(default)]
    pub prefix: String,
}

fn hmac_sha256(key: &[u8], data: &str) -> Vec<u8> {
    let mut mac = HmacSha256::new_from_slice(key).expect("HMAC key");
    mac.update(data.as_bytes());
    mac.finalize().into_bytes().to_vec()
}

fn sha256_hex(data: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data.as_bytes());
    hasher.finalize().iter().map(|b| format!("{:02x}", b)).collect()
}

fn sha256_bytes(data: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hasher.finalize().iter().map(|b| format!("{:02x}", b)).collect()
}

fn aws_v4_sign(
    method: &str,
    path: &str,
    host: &str,
    body_hash: &str,
    secret_key: &str,
    region: &str,
    amz_date: &str,
    date_stamp: &str,
) -> String {
    let service = "s3";
    let signed_headers = "host;x-amz-content-sha256;x-amz-date";
    let canonical_headers = format!("host:{}\nx-amz-content-sha256:{}\nx-amz-date:{}",
        host, body_hash, amz_date);
    let canonical_request = format!("{}\n{}\n\n{}\n{}\n{}",
        method, path, canonical_headers, signed_headers, body_hash);

    let algorithm = "AWS4-HMAC-SHA256";
    let credential_scope = format!("{}/{}/{}/aws4_request", date_stamp, region, service);
    let string_to_sign = format!("{}\n{}\n{}\n{}",
        algorithm, amz_date, credential_scope, sha256_hex(&canonical_request));

    let k_secret = format!("AWS4{}", secret_key);
    let k_date = hmac_sha256(k_secret.as_bytes(), date_stamp);
    let k_region = hmac_sha256(&k_date, region);
    let k_service = hmac_sha256(&k_region, service);
    let k_signing = hmac_sha256(&k_service, "aws4_request");
    hmac_sha256(&k_signing, &string_to_sign).iter().map(|b| format!("{:02x}", b)).collect()
}

fn walk_dir(base: &Path, dir: &Path, cos: &CosConfig) -> AppResult<Vec<(String, PathBuf)>> {
    let mut files = Vec::new();
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_dir() {
            files.extend(walk_dir(base, &path, cos)?);
        } else {
            let relative = path.strip_prefix(base).unwrap_or(&path);
            let cos_key = if cos.prefix.is_empty() {
                relative.to_string_lossy().replace('\\', "/")
            } else {
                format!("{}/{}", cos.prefix.trim_end_matches('/'), relative.to_string_lossy().replace('\\', "/"))
            };
            files.push((cos_key, path));
        }
    }
    Ok(files)
}

pub fn deploy(output_dir: &Path, config: &CosConfig) -> AppResult<String> {
    let host = format!("{}.cos.{}.myqcloud.com", config.bucket, config.region);
    let base_url = format!("https://{}", host);
    let files = walk_dir(output_dir, output_dir, config)?;

    if files.is_empty() {
        return Ok("没有需要上传的文件".to_string());
    }

    let amz_date = format!("{}T{}Z",
        chrono::Local::now().format("%Y%m%d"),
        chrono::Local::now().format("%H%M%S"));
    let date_stamp = chrono::Local::now().format("%Y%m%d").to_string();

    let mut uploaded = 0u64;
    let total = files.len();

    for (cos_key, local_path) in &files {
        let content = fs::read(local_path)?;
        let body_hash = sha256_bytes(&content);
        let mime = mime_guess::from_path(local_path).first_or_octet_stream();
        let path = format!("/{}", cos_key);

        let signature = aws_v4_sign(
            "PUT", &path, &host, &body_hash,
            &config.secret_key, &config.region,
            &amz_date, &date_stamp,
        );

        let authorization = format!(
            "AWS4-HMAC-SHA256 Credential={}/{}/{}/s3/aws4_request,SignedHeaders=host;x-amz-content-sha256;x-amz-date,Signature={}",
            config.secret_id, date_stamp, config.region, signature
        );

        let url = format!("{}{}", base_url, path);

        let response = ureq::put(&url)
            .set("Host", &host)
            .set("x-amz-content-sha256", &body_hash)
            .set("x-amz-date", &amz_date)
            .set("Authorization", &authorization)
            .set("Content-Type", &mime.to_string())
            .send_bytes(&content)
            .map_err(|e| AppError::Http(format!("上传 {} 失败: {}", cos_key, e)))?;

        let status = response.status();
        if status < 200 || status >= 300 {
            return Err(AppError::Http(format!("上传 {} 失败，HTTP状态码: {}", cos_key, status)));
        }

        uploaded += 1;
    }

    Ok(format!("成功上传 {}/{} 个文件到腾讯云 COS ({}/{})", uploaded, total, config.bucket, config.region))
}

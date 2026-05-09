use crate::models::AppResult;

pub trait ImageBed: Send + Sync {
    fn upload(&self, _file: &[u8], _filename: &str) -> AppResult<String>;
    fn delete(&self, _url: &str) -> AppResult<()>;
    fn list(&self) -> AppResult<Vec<ImageInfo>>;
    fn test_connection(&self) -> AppResult<bool>;
}

#[derive(Debug, Clone)]
pub struct ImageInfo {
    pub filename: String,
    pub url: String,
    pub size: i64,
}

pub struct NoopImageBed;

impl ImageBed for NoopImageBed {
    fn upload(&self, _file: &[u8], _filename: &str) -> AppResult<String> {
        Ok(String::new())
    }

    fn delete(&self, _url: &str) -> AppResult<()> {
        Ok(())
    }

    fn list(&self) -> AppResult<Vec<ImageInfo>> {
        Ok(vec![])
    }

    fn test_connection(&self) -> AppResult<bool> {
        Ok(true)
    }
}

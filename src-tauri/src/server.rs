use std::fs;
use std::io::{Read, Write};
use std::net::TcpListener;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread::{self, JoinHandle};
use std::time::Duration;

pub struct SiteServer {
    port: u16,
    stop_flag: Arc<AtomicBool>,
    handle: Option<JoinHandle<()>>,
}

impl SiteServer {
    pub fn start(serve_dir: PathBuf) -> Result<Self, String> {
        let listener = TcpListener::bind("127.0.0.1:0").map_err(|e| e.to_string())?;
        listener
            .set_nonblocking(true)
            .map_err(|e| e.to_string())?;
        let port = listener.local_addr().map_err(|e| e.to_string())?.port();
        let stop_flag = Arc::new(AtomicBool::new(false));
        let stop = stop_flag.clone();

        let handle = thread::spawn(move || {
            loop {
                if stop.load(Ordering::Relaxed) {
                    break;
                }
                match listener.accept() {
                    Ok((mut stream, _)) => {
                        let mut buf = [0u8; 4096];
                        if stream.read(&mut buf).is_ok() {
                            let request = String::from_utf8_lossy(&buf);
                            let path = if let Some(line) = request.lines().next() {
                                let parts: Vec<&str> = line.split_whitespace().collect();
                                if parts.len() >= 2 && parts[0] == "GET" {
                                    let p = if parts[1] == "/" {
                                        "/index.html"
                                    } else {
                                        parts[1]
                                    };
                                    p.trim_start_matches('/')
                                } else {
                                    "index.html"
                                }
                            } else {
                                "index.html"
                            };

                            let file_path = serve_dir.join(path);
                            let content = fs::read(&file_path).unwrap_or_else(|_| {
                                fs::read(serve_dir.join("index.html")).unwrap_or_default()
                            });

                            let mime = if file_path
                                .extension()
                                .and_then(|e| e.to_str())
                                == Some("css")
                            {
                                "text/css"
                            } else if file_path
                                .extension()
                                .and_then(|e| e.to_str())
                                == Some("js")
                            {
                                "application/javascript"
                            } else {
                                "text/html; charset=utf-8"
                            };

                            let response = format!(
                                "HTTP/1.1 200 OK\r\nContent-Type: {}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
                                mime,
                                content.len()
                            );
                            let _ = stream.write_all(response.as_bytes());
                            let _ = stream.write_all(&content);
                        }
                    }
                    Err(ref e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                        thread::sleep(Duration::from_millis(100));
                    }
                    Err(_) => break,
                }
            }
        });

        Ok(SiteServer {
            port,
            stop_flag,
            handle: Some(handle),
        })
    }

    pub fn port(&self) -> u16 {
        self.port
    }

    pub fn stop(&self) {
        self.stop_flag.store(true, Ordering::Relaxed);
    }
}

impl Drop for SiteServer {
    fn drop(&mut self) {
        self.stop();
        if let Some(handle) = self.handle.take() {
            let _ = handle.join();
        }
    }
}

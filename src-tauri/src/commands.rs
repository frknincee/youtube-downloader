use serde::{Deserialize, Serialize};
use std::process::Stdio;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::{Emitter, Manager};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;
use tokio::sync::Mutex;

pub struct DownloadState {
    pub cancel_flag: Arc<AtomicBool>,
    pub current_process: Arc<Mutex<Option<tokio::process::Child>>>,
}

impl Default for DownloadState {
    fn default() -> Self {
        Self {
            cancel_flag: Arc::new(AtomicBool::new(false)),
            current_process: Arc::new(Mutex::new(None)),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VideoInfo {
    pub title: String,
    pub duration: Option<f64>,
    pub thumbnail: Option<String>,
    pub uploader: Option<String>,
    pub view_count: Option<u64>,
    pub duration_string: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PlaylistItem {
    pub id: String,
    pub title: String,
    pub duration: Option<f64>,
    pub duration_string: Option<String>,
    pub url: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DownloadProgress {
    pub percent: f64,
    pub status: String,
    pub speed: Option<String>,
    pub eta: Option<String>,
}

fn find_ytdlp() -> String {
    let paths = vec![
        "yt-dlp".to_string(),
        format!(
            "{}/.local/bin/yt-dlp",
            std::env::var("HOME").unwrap_or_default()
        ),
        "/usr/local/bin/yt-dlp".to_string(),
        "/opt/homebrew/bin/yt-dlp".to_string(),
    ];

    for path in &paths {
        if std::process::Command::new(path)
            .arg("--version")
            .output()
            .is_ok()
        {
            return path.clone();
        }
    }

    "python3".to_string()
}

fn get_ytdlp_cmd() -> (String, Vec<String>) {
    let ytdlp = find_ytdlp();
    if ytdlp == "python3" {
        (
            "python3".to_string(),
            vec!["-m".to_string(), "yt_dlp".to_string()],
        )
    } else {
        (ytdlp, vec![])
    }
}

fn find_ffmpeg() -> Option<String> {
    let paths = vec![
        "ffmpeg".to_string(),
        format!(
            "{}/.local/bin/ffmpeg",
            std::env::var("HOME").unwrap_or_default()
        ),
        "/usr/local/bin/ffmpeg".to_string(),
        "/opt/homebrew/bin/ffmpeg".to_string(),
    ];

    for path in &paths {
        if std::process::Command::new(path)
            .arg("-version")
            .output()
            .is_ok()
        {
            return Some(path.clone());
        }
    }
    None
}

#[tauri::command]
pub async fn get_video_info(url: String) -> Result<VideoInfo, String> {
    let (cmd, mut base_args) = get_ytdlp_cmd();
    base_args.extend_from_slice(&[
        "--dump-json".to_string(),
        "--no-playlist".to_string(),
        "--no-warnings".to_string(),
        url,
    ]);

    let output = Command::new(&cmd)
        .args(&base_args)
        .output()
        .await
        .map_err(|e| format!("yt-dlp çalıştırılamadı: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Video bilgisi alınamadı: {}", stderr));
    }

    let json_str = String::from_utf8_lossy(&output.stdout);
    let json: serde_json::Value =
        serde_json::from_str(&json_str).map_err(|e| format!("JSON parse hatası: {}", e))?;

    Ok(VideoInfo {
        title: json["title"]
            .as_str()
            .unwrap_or("Bilinmeyen")
            .to_string(),
        duration: json["duration"].as_f64(),
        thumbnail: json["thumbnail"].as_str().map(|s| s.to_string()),
        uploader: json["uploader"].as_str().map(|s| s.to_string()),
        view_count: json["view_count"].as_u64(),
        duration_string: json["duration_string"].as_str().map(|s| s.to_string()),
    })
}

#[tauri::command]
pub async fn fetch_playlist(url: String) -> Result<Vec<PlaylistItem>, String> {
    let (cmd, mut base_args) = get_ytdlp_cmd();
    base_args.extend_from_slice(&[
        "--flat-playlist".to_string(),
        "--dump-json".to_string(),
        "--no-warnings".to_string(),
        url,
    ]);

    let output = Command::new(&cmd)
        .args(&base_args)
        .output()
        .await
        .map_err(|e| format!("yt-dlp çalıştırılamadı: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Playlist alınamadı: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let items: Vec<PlaylistItem> = stdout
        .lines()
        .filter_map(|line| {
            let json: serde_json::Value = serde_json::from_str(line).ok()?;
            Some(PlaylistItem {
                id: json["id"].as_str()?.to_string(),
                title: json["title"]
                    .as_str()
                    .unwrap_or("Bilinmeyen")
                    .to_string(),
                duration: json["duration"].as_f64(),
                duration_string: json["duration_string"].as_str().map(|s| s.to_string()),
                url: format!(
                    "https://www.youtube.com/watch?v={}",
                    json["id"].as_str().unwrap_or("")
                ),
            })
        })
        .collect();

    Ok(items)
}

#[tauri::command]
pub async fn download_video(
    app: tauri::AppHandle,
    url: String,
    output_dir: String,
    format: String,
    cookies_file: Option<String>,
) -> Result<String, String> {
    let state: tauri::State<'_, DownloadState> = app.state::<DownloadState>();
    state.cancel_flag.store(false, Ordering::SeqCst);

    let (cmd, mut base_args) = get_ytdlp_cmd();

    if let Some(ffmpeg_path) = find_ffmpeg() {
        if let Some(parent) = std::path::Path::new(&ffmpeg_path).parent() {
            base_args.push("--ffmpeg-location".to_string());
            base_args.push(parent.to_string_lossy().to_string());
        }
    }

    if let Some(ref cookies) = cookies_file {
        base_args.push("--cookies".to_string());
        base_args.push(cookies.clone());
    }

    base_args.push("--no-playlist".to_string());
    base_args.push("--newline".to_string());
    base_args.push("-o".to_string());
    base_args.push(std::format!("{}/%(title)s.%(ext)s", output_dir));

    match format.as_str() {
        "audio" => {
            base_args.push("-x".to_string());
            base_args.push("--audio-format".to_string());
            base_args.push("mp3".to_string());
            base_args.push("--audio-quality".to_string());
            base_args.push("192K".to_string());
        }
        _ => {
            base_args.push("--merge-output-format".to_string());
            base_args.push("mp4".to_string());
        }
    }

    base_args.push(url);

    let mut child: tokio::process::Child = Command::new(&cmd)
        .args(&base_args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("İndirme başlatılamadı: {}", e))?;

    let stdout = child.stdout.take().unwrap();
    let cancel_flag = state.cancel_flag.clone();
    let current_process = state.current_process.clone();

    {
        let mut proc = current_process.lock().await;
        *proc = Some(child);
    }

    let mut reader = BufReader::new(stdout).lines();

    while let Ok(Some(line)) = reader.next_line().await {
        if cancel_flag.load(Ordering::SeqCst) {
            let mut proc = current_process.lock().await;
            if let Some(ref mut c) = *proc {
                let _ = c.kill().await;
            }
            *proc = None;
            return Err("İndirme iptal edildi".to_string());
        }

        if let Some(percent) = parse_progress(&line) {
            let _ = app.emit(
                "download-progress",
                DownloadProgress {
                    percent,
                    status: "downloading".to_string(),
                    speed: parse_speed(&line),
                    eta: parse_eta(&line),
                },
            );
        }
    }

    let mut proc = current_process.lock().await;
    if let Some(mut c) = proc.take() {
        let status = c
            .wait()
            .await
            .map_err(|e| format!("Hata: {}", e))?;
        if !status.success() {
            return Err("İndirme başarısız oldu".to_string());
        }
    }

    let _ = app.emit(
        "download-progress",
        DownloadProgress {
            percent: 100.0,
            status: "completed".to_string(),
            speed: None,
            eta: None,
        },
    );

    Ok("İndirme tamamlandı".to_string())
}

#[tauri::command]
pub async fn cancel_download(app: tauri::AppHandle) -> Result<(), String> {
    let state: tauri::State<'_, DownloadState> = app.state::<DownloadState>();
    state.cancel_flag.store(true, Ordering::SeqCst);

    let mut proc = state.current_process.lock().await;
    if let Some(ref mut c) = *proc {
        let _ = c.kill().await;
    }
    *proc = None;

    Ok(())
}

#[tauri::command]
pub async fn select_directory() -> Result<String, String> {
    Ok(String::new())
}

fn parse_progress(line: &str) -> Option<f64> {
    let re_pattern = regex_lite::Regex::new(r"(\d+\.?\d*)%").ok()?;
    let caps = re_pattern.captures(line)?;
    caps.get(1)?.as_str().parse::<f64>().ok()
}

fn parse_speed(line: &str) -> Option<String> {
    let re_pattern = regex_lite::Regex::new(r"at\s+(\S+/s)").ok()?;
    let caps = re_pattern.captures(line)?;
    Some(caps.get(1)?.as_str().to_string())
}

fn parse_eta(line: &str) -> Option<String> {
    let re_pattern = regex_lite::Regex::new(r"ETA\s+(\S+)").ok()?;
    let caps = re_pattern.captures(line)?;
    Some(caps.get(1)?.as_str().to_string())
}

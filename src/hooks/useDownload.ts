import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { VideoInfo, DownloadProgress, FormatType } from "../lib/types";

export function useDownload() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [progress, setProgress] = useState<DownloadProgress>({
    percent: 0,
    status: "idle",
    speed: null,
    eta: null,
  });
  const [format, setFormat] = useState<FormatType>("video");

  useEffect(() => {
    const unlisten = listen<DownloadProgress>("download-progress", (event) => {
      setProgress(event.payload);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const fetchInfo = useCallback(async () => {
    if (!url.trim()) return;
    setProgress({ percent: 0, status: "fetching", speed: null, eta: null, message: "Video bilgisi alınıyor..." });
    setVideoInfo(null);
    try {
      const info = await invoke<VideoInfo>("get_video_info", { url: url.trim() });
      setVideoInfo(info);
      setProgress({ percent: 0, status: "idle", speed: null, eta: null });
    } catch (err) {
      setProgress({ percent: 0, status: "error", speed: null, eta: null, message: String(err) });
    }
  }, [url]);

  const startDownload = useCallback(async (downloadDir: string, cookiesFile: string | null) => {
    if (!url.trim()) return;
    setProgress({ percent: 0, status: "downloading", speed: null, eta: null, message: "İndirme başlatılıyor..." });
    try {
      await invoke("download_video", {
        url: url.trim(),
        outputDir: downloadDir,
        format,
        cookiesFile,
      });
      setProgress({ percent: 100, status: "completed", speed: null, eta: null, message: "İndirme tamamlandı!" });
    } catch (err) {
      const msg = String(err);
      if (msg.includes("iptal")) {
        setProgress({ percent: 0, status: "cancelled", speed: null, eta: null, message: "İndirme iptal edildi" });
      } else {
        setProgress({ percent: 0, status: "error", speed: null, eta: null, message: msg });
      }
    }
  }, [url, format]);

  const cancelDownload = useCallback(async () => {
    try {
      await invoke("cancel_download");
    } catch (_) {}
  }, []);

  const reset = useCallback(() => {
    setUrl("");
    setVideoInfo(null);
    setProgress({ percent: 0, status: "idle", speed: null, eta: null });
  }, []);

  return {
    url, setUrl,
    videoInfo,
    progress,
    format, setFormat,
    fetchInfo,
    startDownload,
    cancelDownload,
    reset,
  };
}

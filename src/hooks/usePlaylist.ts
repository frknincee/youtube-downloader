import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { PlaylistItem, DownloadProgress, FormatType } from "../lib/types";

export function usePlaylist() {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [progress, setProgress] = useState<DownloadProgress>({
    percent: 0,
    status: "idle",
    speed: null,
    eta: null,
  });
  const [format, setFormat] = useState<FormatType>("video");
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchPlaylist = useCallback(async () => {
    if (!playlistUrl.trim()) return;
    setProgress({ percent: 0, status: "fetching", speed: null, eta: null, message: "Playlist yükleniyor..." });
    setItems([]);
    try {
      const result = await invoke<PlaylistItem[]>("fetch_playlist", { url: playlistUrl.trim() });
      setItems(result.map((item) => ({ ...item, selected: true })));
      setProgress({ percent: 0, status: "idle", speed: null, eta: null });
    } catch (err) {
      setProgress({ percent: 0, status: "error", speed: null, eta: null, message: String(err) });
    }
  }, [playlistUrl]);

  const toggleItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  }, []);

  const toggleAll = useCallback((selected: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected })));
  }, []);

  const downloadSelected = useCallback(
    async (downloadDir: string, cookiesFile: string | null) => {
      const selected = items.filter((item) => item.selected);
      if (selected.length === 0) return;

      setProgress({ percent: 0, status: "downloading", speed: null, eta: null });

      for (let i = 0; i < selected.length; i++) {
        const item = selected[i];
        setCurrentIndex(i);
        setProgress({
          percent: (i / selected.length) * 100,
          status: "downloading",
          speed: null,
          eta: null,
          message: `(${i + 1}/${selected.length}) ${item.title}`,
        });

        try {
          await invoke("download_video", {
            url: item.url,
            outputDir: downloadDir.replace("~", ""),
            format,
            cookiesFile,
          });
        } catch (err) {
          const msg = String(err);
          if (msg.includes("iptal")) {
            setProgress({ percent: 0, status: "cancelled", speed: null, eta: null, message: "İndirme iptal edildi" });
            return;
          }
        }
      }

      setProgress({
        percent: 100,
        status: "completed",
        speed: null,
        eta: null,
        message: `${selected.length} video indirildi!`,
      });
    },
    [items, format]
  );

  const reset = useCallback(() => {
    setPlaylistUrl("");
    setItems([]);
    setCurrentIndex(0);
    setProgress({ percent: 0, status: "idle", speed: null, eta: null });
  }, []);

  return {
    playlistUrl,
    setPlaylistUrl,
    items,
    progress,
    format,
    setFormat,
    currentIndex,
    fetchPlaylist,
    toggleItem,
    toggleAll,
    downloadSelected,
    reset,
  };
}

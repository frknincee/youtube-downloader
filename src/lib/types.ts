export interface VideoInfo {
  title: string;
  duration: number | null;
  thumbnail: string | null;
  uploader: string | null;
  view_count: number | null;
  duration_string: string | null;
}

export interface PlaylistItem {
  id: string;
  title: string;
  duration: number | null;
  duration_string: string | null;
  url: string;
  selected?: boolean;
}

export interface DownloadProgress {
  percent: number;
  status: "idle" | "fetching" | "downloading" | "completed" | "error" | "cancelled";
  speed: string | null;
  eta: string | null;
  message?: string;
}

export type FormatType = "video" | "audio";

export type TabType = "single" | "playlist";

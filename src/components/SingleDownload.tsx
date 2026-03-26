import { motion } from "framer-motion";
import { Link, Search, Download, X, RotateCcw } from "lucide-react";
import { FormatToggle } from "./FormatToggle";
import { ProgressBar } from "./ProgressBar";
import { VideoPreview } from "./VideoPreview";
import { useDownload } from "../hooks/useDownload";

interface SingleDownloadProps {
  downloadDir: string;
  cookiesFile: string | null;
  setDownloadDir: (dir: string) => void;
  setCookiesFile: (file: string | null) => void;
}

export function SingleDownload({ downloadDir, cookiesFile }: SingleDownloadProps) {
  const {
    url, setUrl,
    videoInfo,
    progress,
    format, setFormat,
    fetchInfo,
    startDownload,
    cancelDownload,
    reset,
  } = useDownload();

  const isWorking = progress.status === "fetching" || progress.status === "downloading";
  const isDone = progress.status === "completed" || progress.status === "error" || progress.status === "cancelled";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isWorking) {
      if (!videoInfo) fetchInfo();
      else startDownload(downloadDir, cookiesFile);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 p-6"
    >
      {/* URL Input */}
      <div className="relative">
        <Link size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="YouTube video bağlantısını yapıştırın..."
          className="w-full pl-11 pr-12 py-3.5 bg-bg-input border border-border rounded-2xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
        />
        {url && !isWorking && (
          <button
            onClick={() => { setUrl(""); reset(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Fetch Info Button */}
      {!videoInfo && !isWorking && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={fetchInfo}
          disabled={!url.trim()}
          className="flex items-center justify-center gap-2 py-3.5 bg-bg-card hover:bg-bg-card-hover border border-border hover:border-border-hover rounded-2xl text-sm font-medium text-text-secondary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Search size={16} />
          <span>Video Bilgisi Getir</span>
        </motion.button>
      )}

      {/* Video Preview */}
      {videoInfo && <VideoPreview info={videoInfo} />}

      {/* Format Toggle */}
      {videoInfo && !isWorking && <FormatToggle format={format} setFormat={setFormat} />}

      {/* Download / Cancel / Reset Buttons */}
      {videoInfo && !isDone && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={isWorking ? cancelDownload : () => startDownload(downloadDir, cookiesFile)}
          className={`flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold transition-all ${
            isWorking
              ? "bg-error/15 border border-error/30 text-error hover:bg-error/25"
              : "bg-gradient-to-r from-accent to-accent-dim text-white shadow-lg shadow-accent-glow/20 hover:shadow-accent-glow/40"
          }`}
        >
          {isWorking ? (
            <>
              <X size={18} />
              <span>İptal Et</span>
            </>
          ) : (
            <>
              <Download size={18} />
              <span>İndir</span>
            </>
          )}
        </motion.button>
      )}

      {isDone && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={reset}
          className="flex items-center justify-center gap-2 py-3.5 bg-bg-card hover:bg-bg-card-hover border border-border rounded-2xl text-sm font-medium text-text-secondary transition-all"
        >
          <RotateCcw size={16} />
          <span>Yeni İndirme</span>
        </motion.button>
      )}

      {/* Progress */}
      <ProgressBar progress={progress} />
    </motion.div>
  );
}

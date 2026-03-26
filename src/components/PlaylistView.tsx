import { motion, AnimatePresence } from "framer-motion";
import { Link, Search, Download, X, RotateCcw, Check, Clock } from "lucide-react";
import { FormatToggle } from "./FormatToggle";
import { ProgressBar } from "./ProgressBar";
import { usePlaylist } from "../hooks/usePlaylist";

interface PlaylistViewProps {
  downloadDir: string;
  cookiesFile: string | null;
}

export function PlaylistView({ downloadDir, cookiesFile }: PlaylistViewProps) {
  const {
    playlistUrl, setPlaylistUrl,
    items,
    progress,
    format, setFormat,
    fetchPlaylist,
    toggleItem,
    toggleAll,
    downloadSelected,
    reset,
  } = usePlaylist();

  const isWorking = progress.status === "fetching" || progress.status === "downloading";
  const isDone = progress.status === "completed" || progress.status === "error" || progress.status === "cancelled";
  const selectedCount = items.filter((i) => i.selected).length;
  const allSelected = items.length > 0 && selectedCount === items.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isWorking && items.length === 0) {
      fetchPlaylist();
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
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="YouTube playlist bağlantısını yapıştırın..."
          className="w-full pl-11 pr-12 py-3.5 bg-bg-input border border-border rounded-2xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
        />
        {playlistUrl && !isWorking && (
          <button
            onClick={() => { setPlaylistUrl(""); reset(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Fetch Button */}
      {items.length === 0 && !isWorking && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={fetchPlaylist}
          disabled={!playlistUrl.trim()}
          className="flex items-center justify-center gap-2 py-3.5 bg-bg-card hover:bg-bg-card-hover border border-border hover:border-border-hover rounded-2xl text-sm font-medium text-text-secondary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Search size={16} />
          <span>Playlist Yükle</span>
        </motion.button>
      )}

      {/* Playlist Items */}
      {items.length > 0 && (
        <>
          {/* Controls row */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleAll(!allSelected)}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  allSelected
                    ? "bg-accent border-accent"
                    : "border-border hover:border-border-hover"
                }`}
              >
                {allSelected && <Check size={12} className="text-white" />}
              </div>
              <span>
                {allSelected ? "Tümünü Kaldır" : "Tümünü Seç"} ({selectedCount}/{items.length})
              </span>
            </button>

            <FormatToggle format={format} setFormat={setFormat} />
          </div>

          {/* Scrollable list */}
          <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-1">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => toggleItem(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border ${
                    item.selected
                      ? "bg-accent/5 border-accent/20 hover:bg-accent/10"
                      : "bg-bg-card border-transparent hover:bg-bg-card-hover"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      item.selected
                        ? "bg-accent border-accent"
                        : "border-border"
                    }`}
                  >
                    {item.selected && <Check size={12} className="text-white" />}
                  </div>

                  <span className="text-xs text-text-muted font-mono w-6 text-right flex-shrink-0">
                    {index + 1}
                  </span>

                  <span className="text-sm text-text-primary truncate flex-1">
                    {item.title}
                  </span>

                  {item.duration_string && (
                    <span className="flex items-center gap-1 text-xs text-text-muted flex-shrink-0">
                      <Clock size={10} />
                      {item.duration_string}
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Download / Reset */}
      {items.length > 0 && !isDone && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={
            isWorking
              ? () => {} // cancel handled elsewhere
              : () => downloadSelected(downloadDir, cookiesFile)
          }
          disabled={selectedCount === 0 && !isWorking}
          className={`flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold transition-all disabled:opacity-40 ${
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
              <span>{selectedCount} Video İndir</span>
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
          <span>Yeni Playlist</span>
        </motion.button>
      )}

      {/* Progress */}
      <ProgressBar progress={progress} />
    </motion.div>
  );
}

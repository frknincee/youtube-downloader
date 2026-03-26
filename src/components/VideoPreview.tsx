import { motion } from "framer-motion";
import { Clock, Eye, User } from "lucide-react";
import type { VideoInfo } from "../lib/types";

interface VideoPreviewProps {
  info: VideoInfo;
}

function formatViews(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export function VideoPreview({ info }: VideoPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex gap-4 p-4 bg-bg-card rounded-2xl border border-border overflow-hidden"
    >
      {/* Thumbnail */}
      {info.thumbnail && (
        <div className="relative flex-shrink-0 w-44 h-24 rounded-xl overflow-hidden bg-bg-input">
          <img
            src={info.thumbnail}
            alt={info.title}
            className="w-full h-full object-cover"
          />
          {info.duration_string && (
            <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 rounded-md text-xs font-mono text-white">
              {info.duration_string}
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
        <h3 className="text-sm font-semibold text-text-primary leading-tight line-clamp-2">
          {info.title}
        </h3>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          {info.uploader && (
            <span className="flex items-center gap-1">
              <User size={12} />
              {info.uploader}
            </span>
          )}
          {info.duration_string && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {info.duration_string}
            </span>
          )}
          {info.view_count && (
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {formatViews(info.view_count)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

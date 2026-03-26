import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import type { DownloadProgress } from "../lib/types";

interface ProgressBarProps {
  progress: DownloadProgress;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const { percent, status, speed, eta, message } = progress;

  if (status === "idle") return null;

  const statusConfig = {
    fetching: { color: "bg-accent", textColor: "text-accent", icon: Loader2, spin: true },
    downloading: { color: "bg-accent", textColor: "text-accent", icon: Loader2, spin: true },
    completed: { color: "bg-success", textColor: "text-success", icon: CheckCircle2, spin: false },
    error: { color: "bg-error", textColor: "text-error", icon: XCircle, spin: false },
    cancelled: { color: "bg-warning", textColor: "text-warning", icon: AlertCircle, spin: false },
    idle: { color: "bg-accent", textColor: "text-accent", icon: Loader2, spin: false },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-3"
      >
        {/* Progress bar */}
        {(status === "downloading" || status === "completed") && (
          <div className="relative h-2 bg-bg-input rounded-full overflow-hidden">
            <motion.div
              className={`absolute inset-y-0 left-0 ${config.color} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
            {status === "downloading" && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>
        )}

        {/* Status line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon
              size={16}
              className={`${config.textColor} ${config.spin ? "animate-spin" : ""}`}
            />
            <span className={`text-sm ${config.textColor}`}>
              {message || `%${percent.toFixed(0)}`}
            </span>
          </div>

          {status === "downloading" && (speed || eta) && (
            <div className="flex items-center gap-3 text-xs text-text-muted">
              {speed && <span>{speed}</span>}
              {eta && <span>ETA {eta}</span>}
            </div>
          )}

          {status === "downloading" && (
            <span className="text-sm font-mono text-text-secondary">
              %{percent.toFixed(1)}
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

import { motion } from "framer-motion";
import { Video, Music } from "lucide-react";
import type { FormatType } from "../lib/types";

interface FormatToggleProps {
  format: FormatType;
  setFormat: (f: FormatType) => void;
}

export function FormatToggle({ format, setFormat }: FormatToggleProps) {
  const options = [
    { id: "video" as const, label: "Video (MP4)", icon: Video },
    { id: "audio" as const, label: "Ses (MP3)", icon: Music },
  ];

  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = format === opt.id;

        return (
          <motion.button
            key={opt.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFormat(opt.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all border ${
              isActive
                ? "bg-accent/15 border-accent/40 text-accent shadow-lg shadow-accent-glow/10"
                : "bg-bg-card border-border text-text-muted hover:border-border-hover hover:text-text-secondary"
            }`}
          >
            <Icon size={16} />
            <span>{opt.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

import { FolderOpen, Cookie, Check } from "lucide-react";
import { motion } from "framer-motion";
import { open } from "@tauri-apps/plugin-dialog";

interface HeaderProps {
  downloadDir: string;
  setDownloadDir: (dir: string) => void;
  cookiesFile: string | null;
  setCookiesFile: (file: string | null) => void;
}

export function Header({ downloadDir, setDownloadDir, cookiesFile, setCookiesFile }: HeaderProps) {
  const selectFolder = async () => {
    const selected = await open({ directory: true, multiple: false });
    if (selected) {
      setDownloadDir(selected as string);
    }
  };

  const loadCookies = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Cookies", extensions: ["txt"] }],
    });
    if (selected) {
      setCookiesFile(selected as string);
    }
  };

  const shortDir = downloadDir.replace(/^\/Users\/[^/]+/, "~");

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between px-6 py-4 bg-bg-secondary/80 backdrop-blur-xl border-b border-border"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-dim flex items-center justify-center shadow-lg shadow-accent-glow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-text-primary tracking-tight">
            YouTube Downloader
          </h1>
          <p className="text-xs text-text-muted">Hızlı ve kolay video indirme</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={selectFolder}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-card hover:bg-bg-card-hover border border-border hover:border-border-hover transition-all text-sm"
        >
          <FolderOpen size={16} className="text-accent" />
          <span className="text-text-secondary max-w-[200px] truncate">{shortDir}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={loadCookies}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-card hover:bg-bg-card-hover border border-border hover:border-border-hover transition-all text-sm"
        >
          {cookiesFile ? (
            <Check size={16} className="text-success" />
          ) : (
            <Cookie size={16} className="text-accent" />
          )}
          <span className="text-text-secondary">
            {cookiesFile ? "Çerez Yüklendi" : "Çerez Yükle"}
          </span>
        </motion.button>
      </div>
    </motion.header>
  );
}

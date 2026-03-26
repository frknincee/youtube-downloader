import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Header } from "./components/Header";
import { TabSwitcher } from "./components/TabSwitcher";
import { SingleDownload } from "./components/SingleDownload";
import { PlaylistView } from "./components/PlaylistView";
import type { TabType } from "./lib/types";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("single");
  const [downloadDir, setDownloadDir] = useState("~/Downloads");
  const [cookiesFile, setCookiesFile] = useState<string | null>(null);

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      <Header
        downloadDir={downloadDir}
        setDownloadDir={setDownloadDir}
        cookiesFile={cookiesFile}
        setCookiesFile={setCookiesFile}
      />

      <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "single" ? (
            <SingleDownload
              key="single"
              downloadDir={downloadDir}
              cookiesFile={cookiesFile}
              setDownloadDir={setDownloadDir}
              setCookiesFile={setCookiesFile}
            />
          ) : (
            <PlaylistView
              key="playlist"
              downloadDir={downloadDir}
              cookiesFile={cookiesFile}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-border bg-bg-secondary/50 backdrop-blur-sm">
        <p className="text-xs text-text-muted text-center">
          YouTube Downloader v1.0 — Tauri + React ile geliştirildi
        </p>
      </div>
    </div>
  );
}

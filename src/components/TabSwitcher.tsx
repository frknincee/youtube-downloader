import { motion } from "framer-motion";
import { Download, ListVideo } from "lucide-react";
import type { TabType } from "../lib/types";

interface TabSwitcherProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function TabSwitcher({ activeTab, setActiveTab }: TabSwitcherProps) {
  const tabs = [
    { id: "single" as const, label: "Tekli İndirme", icon: Download },
    { id: "playlist" as const, label: "Oynatma Listesi", icon: ListVideo },
  ];

  return (
    <div className="flex gap-1 p-1 bg-bg-secondary rounded-2xl border border-border mx-6 mt-5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-colors z-10"
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-bg-card border border-border-hover rounded-xl shadow-lg"
                transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              />
            )}
            <Icon
              size={16}
              className={`relative z-10 transition-colors ${isActive ? "text-accent" : "text-text-muted"}`}
            />
            <span
              className={`relative z-10 transition-colors ${isActive ? "text-text-primary" : "text-text-muted"}`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

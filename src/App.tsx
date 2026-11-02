import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TabArticleHelper } from './components/TabArticleHelper';
import { TabProposalWriter } from './components/TabProposalWriter';
import { TabEditPolish } from './components/TabEditPolish';
import { TabQualityCheck } from './components/TabQualityCheck';
import { SettingsModal } from './components/SettingsModal';
import { GitHubPagesModal } from './components/GitHubPagesModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ActiveTab } from './types';
import { getStoredApiKey } from './services/gemini';
import { Sparkles, Key, ExternalLink, Github, Heart, Shield } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('article');
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('freelanceboost_theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  // Sync dark class on html root
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('freelanceboost_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('freelanceboost_theme', 'light');
    }
  }, [isDark]);

  // Sync API key status
  const checkApiKey = () => {
    const key = getStoredApiKey();
    setHasApiKey(Boolean(key && key.trim().length > 5));
  };

  useEffect(() => {
    checkApiKey();
  }, []);

  const toggleDark = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        toggleDark={toggleDark}
        hasApiKey={hasApiKey}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner if API key not yet set */}
        {!hasApiKey && (
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-transparent dark:from-amber-950/40 dark:via-amber-900/20 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-200 block text-sm">
                  Add your free Gemini API key to start generating
                </span>
                <p className="text-amber-800 dark:text-amber-400 text-xs">
                  Your key is stored strictly in your browser's <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">localStorage</code>. Zero server tracking.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1"
              >
                Get Free Key <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all shadow-amber-600/20"
              >
                Enter Key
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Article Helper */}
        {activeTab === 'article' && (
          <TabArticleHelper
            hasApiKey={hasApiKey}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* Tab 2: Proposal Writer */}
        {activeTab === 'proposal' && (
          <TabProposalWriter
            hasApiKey={hasApiKey}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* Tab 3: Edit & Polish */}
        {activeTab === 'polish' && (
          <TabEditPolish
            hasApiKey={hasApiKey}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* Tab 4: Quality Check */}
        {activeTab === 'quality' && (
          <TabQualityCheck
            hasApiKey={hasApiKey}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">FreelanceBoost</span>
            <span>•</span>
            <span>Client-side SPA deployable on GitHub Pages</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDeployModalOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Deployment Steps</span>
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              API Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onKeyUpdated={checkApiKey}
      />

      {/* GitHub Pages Deploy Guide Modal */}
      <GitHubPagesModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}

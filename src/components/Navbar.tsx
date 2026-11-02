import React from 'react';
import {
  PenSquare,
  Send,
  Settings,
  Moon,
  Sun,
  Github,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { ActiveTab } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDark: boolean;
  toggleDark: () => void;
  hasApiKey: boolean;
  onOpenSettings: () => void;
  onOpenDeployModal: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  isDark,
  toggleDark,
  hasApiKey,
  onOpenSettings,
  onOpenDeployModal,
}) => {
  const navTabs = [
    {
      id: 'article' as const,
      label: 'Article Helper',
      icon: PenSquare,
      activeColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'proposal' as const,
      label: 'Proposal Writer',
      icon: Send,
      activeColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'polish' as const,
      label: 'Edit & Polish',
      icon: Sparkles,
      activeColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'quality' as const,
      label: 'Quality Check',
      icon: ShieldCheck,
      activeColor: 'text-sky-600 dark:text-sky-400',
    },
  ];

  const renderNavButtons = () =>
    navTabs.map((tab) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            isActive
              ? `bg-white dark:bg-slate-800 ${tab.activeColor} shadow-sm`
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span>{tab.label}</span>
        </button>
      );
    });

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-100 dark:to-slate-200 bg-clip-text text-transparent">
                  FreelanceBoost
                </span>
                <span className="hidden xl:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-md border border-indigo-200/60 dark:border-indigo-800/60">
                  Tech Guest Posts
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Outline &amp; Draft Helper • Upwork Proposal Writer
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Visible on large screens) */}
          <nav className="hidden lg:flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 shrink-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {renderNavButtons()}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* PWA Install Button */}
            <PWAInstallButton variant="navbar" />

            {/* Deploy Guide button */}
            <button
              onClick={onOpenDeployModal}
              title="GitHub Pages Deployment Guide"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <Github className="w-4 h-4" />
              <span>Deploy Guide</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleDark}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Settings / API Key Button */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                hasApiKey
                  ? 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/60 animate-pulse'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
              <span className="flex items-center gap-1">
                {hasApiKey ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Gemini API Key Active" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" title="Gemini API Key Required" />
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Small Screens Navigation Bar (Horizontally scrollable with smooth touch scroll) */}
        <div className="lg:hidden py-2 border-t border-slate-200/60 dark:border-slate-800/60 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <nav className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 w-max">
            {renderNavButtons()}
          </nav>
        </div>
      </div>
    </header>
  );
};

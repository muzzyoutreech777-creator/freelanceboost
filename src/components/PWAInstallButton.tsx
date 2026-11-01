import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  variant?: 'navbar' | 'card' | 'settings';
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running in standalone PWA mode, don't clutter the header
  if (isInstalled && variant === 'navbar') {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'navbar' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 transition-colors shadow-xs"
          title="Install FreelanceBoost as a PWA on your desktop or mobile"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install App</span>
        </button>
      )}

      {variant === 'card' && (
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-indigo-950/40 dark:to-sky-950/30 border border-indigo-200/70 dark:border-indigo-800/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-xs block">
                Install FreelanceBoost as an App
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Launch instantly from your home screen or dock with zero browser address bar distractions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all shrink-0 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isInstalled ? 'Installed' : 'Install PWA'}</span>
          </button>
        </div>
      )}

      {/* Guided installation modal for iOS Safari or manual browser install */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Install FreelanceBoost
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  Follow these 2 quick steps in Safari:
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                    <div className="leading-tight">
                      Tap the <Share2 className="w-3.5 h-3.5 inline text-indigo-600 dark:text-indigo-400 mx-0.5" /> <strong>Share</strong> icon in the bottom Safari toolbar.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                    <div className="leading-tight">
                      Scroll down and tap <PlusSquare className="w-3.5 h-3.5 inline text-indigo-600 dark:text-indigo-400 mx-0.5" /> <strong>Add to Home Screen</strong>.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  Install on your computer or Android device:
                </p>
                <ol className="space-y-1.5 list-decimal pl-4 leading-relaxed">
                  <li>In Chrome or Edge, click the <strong>Install</strong> icon in the right side of the address bar (or menu &gt; <em>Install FreelanceBoost</em>).</li>
                  <li>Click <strong>Install</strong> to add it to your apps, dock, and start menu.</li>
                  <li>Enjoy offline capabilities and fullscreen focus!</li>
                </ol>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};

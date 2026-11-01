import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 dark:bg-amber-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xl shadow-amber-900/20 animate-in slide-in-from-bottom duration-200">
      <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Offline Mode — Cached articles and UI are available.</span>
    </div>
  );
};

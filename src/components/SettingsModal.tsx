import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, CheckCircle2, AlertCircle, ExternalLink, X, Shield, Sparkles } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, getStoredModel, setStoredModel, testGeminiApiKey, DEFAULT_MODEL } from '../services/gemini';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, onKeyUpdated }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setModel(getStoredModel());
      setTestStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(apiKey);
    setStoredModel(model);
    onKeyUpdated();
    onClose();
  };

  const handleClear = () => {
    setApiKey('');
    setStoredApiKey('');
    onKeyUpdated();
    setTestStatus({ loading: false, success: true, message: 'API key cleared from browser storage.' });
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestStatus({ loading: false, success: false, message: 'Please enter a Gemini API key first.' });
      return;
    }
    setTestStatus({ loading: true });
    const result = await testGeminiApiKey(apiKey, model);
    setTestStatus({ loading: false, success: result.success, message: result.message });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">Gemini API Settings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Client-side configuration for GitHub Pages</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Privacy Note */}
          <div className="flex items-start gap-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
            <Shield className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="font-semibold">Zero Backend & Private:</span> Your key is stored exclusively in your browser’s <code className="bg-emerald-100 dark:bg-emerald-900/50 px-1 py-0.5 rounded font-mono">localStorage</code>. It is never logged or sent to any intermediate server.
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestStatus(null);
                }}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* 4-Step Guide */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
                How to get your free key:
              </span>
              <ol className="space-y-1 text-slate-600 dark:text-slate-400 text-xs leading-relaxed list-decimal pl-4">
                <li>Click <strong>Get Free Key</strong> and sign in with Google.</li>
                <li>Click <strong>Create API key</strong>.</li>
                <li>Click the copy icon.</li>
                <li>Paste it here and click <strong>Save Key</strong>.</li>
              </ol>
            </div>
          </div>

          {/* Model Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Gemini Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all cursor-pointer"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash (Recommended: Fast &amp; High Quality)</option>
              <option value="gemini-2.0-flash">gemini-2.0-flash (Fast &amp; Efficient)</option>
              <option value="gemini-1.5-flash">gemini-1.5-flash (Standard Lightweight)</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Reasoning &amp; Analysis)</option>
            </select>
          </div>

          {/* Test Status feedback */}
          {testStatus && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2.5 border ${
                testStatus.loading
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  : testStatus.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/40'
              }`}
            >
              {testStatus.loading ? (
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shrink-0" />
              ) : testStatus.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span className="flex-1 font-medium">{testStatus.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={testStatus?.loading || !apiKey}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors disabled:opacity-50"
            >
              {testStatus?.loading ? 'Testing...' : 'Test Connection'}
            </button>
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-sm transition-all shadow-indigo-500/20"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Github, X, Copy, Check, Terminal, ExternalLink, Globe } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPagesModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedAction, setCopiedAction] = useState(false);
  const [copiedManual, setCopiedManual] = useState(false);

  if (!isOpen) return null;

  const githubActionYaml = `name: Deploy FreelanceBoost to GitHub Pages

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: |
          if [ -f package-lock.json ]; then
            npm ci
          else
            npm install
          fi

      - name: Build static site
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

  const manualSteps = `# 1. Build the static bundle
npm run build

# 2. Push the generated 'dist' folder to gh-pages branch:
npx gh-pages -d dist
`;

  const copyToClipboard = (text: string, type: 'action' | 'manual') => {
    navigator.clipboard.writeText(text);
    if (type === 'action') {
      setCopiedAction(true);
      setTimeout(() => setCopiedAction(false), 2000);
    } else {
      setCopiedManual(true);
      setTimeout(() => setCopiedManual(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">Deploying to GitHub Pages</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">100% Client-Side Single-Page Web App</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Why it works note */}
          <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Why FreelanceBoost runs seamlessly on GitHub Pages
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              FreelanceBoost builds to a pure static collection of HTML, CSS, and JavaScript inside the <code className="font-mono bg-indigo-100 dark:bg-indigo-900/60 px-1 py-0.5 rounded text-indigo-800 dark:text-indigo-200">dist/</code> directory. We configured <code className="font-mono bg-indigo-100 dark:bg-indigo-900/60 px-1 py-0.5 rounded text-indigo-800 dark:text-indigo-200">base: './'</code> in <code className="font-mono">vite.config.ts</code> so asset URLs work on any GitHub repository subdirectory!
            </p>
          </div>

          {/* Method 1 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                Recommended: Automated GitHub Actions Workflow
              </h4>
              <button
                type="button"
                onClick={() => copyToClipboard(githubActionYaml, 'action')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {copiedAction ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Copied Workflow!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy YAML
                  </>
                )}
              </button>
            </div>

            <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal pl-5">
              <li>Create a new file in your repo: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">.github/workflows/deploy.yml</code></li>
              <li>Paste the workflow below and commit to your <code className="font-mono">main</code> branch.</li>
              <li>On GitHub, go to <strong>Settings &gt; Pages</strong>, and set <strong>Source</strong> to <strong>GitHub Actions</strong>.</li>
            </ol>

            <div className="relative">
              <pre className="p-3.5 bg-slate-950 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800 leading-relaxed">
                {githubActionYaml}
              </pre>
            </div>
          </div>

          {/* Method 2 */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
                Quick Alternative: gh-pages CLI Package
              </h4>
              <button
                type="button"
                onClick={() => copyToClipboard(manualSteps, 'manual')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {copiedManual ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Commands
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <pre className="p-3.5 bg-slate-950 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
                {manualSteps}
              </pre>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Then navigate to your GitHub Repository <strong>Settings &gt; Pages</strong> and select the <code className="font-mono">gh-pages</code> branch.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            Built for standalone static hosting
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 rounded-xl transition-all"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

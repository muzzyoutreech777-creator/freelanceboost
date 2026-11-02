import React, { useState } from 'react';
import {
  ShieldCheck,
  SearchCheck,
  FileCheck2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  FileText,
  FileCode2,
  ExternalLink,
  HelpCircle,
  Sparkles,
  Info,
  Heading,
  MessageSquare,
  Link2,
  CheckSquare,
} from 'lucide-react';
import { FactCheckResult, EditorReviewResult, ClaimRisk } from '../types';
import { SAMPLE_FACT_CHECK_DRAFT, SAMPLE_EDITORIAL_GUIDELINES } from '../utils/samples';
import { factCheckDraft, finalEditorReview } from '../services/gemini';

interface Props {
  hasApiKey: boolean;
  onOpenSettings: () => void;
}

export const TabQualityCheck: React.FC<Props> = ({ hasApiKey, onOpenSettings }) => {
  // Input states
  const [draft, setDraft] = useState('');
  const [guidelines, setGuidelines] = useState('');

  // Section 1: Fact Check states
  const [factLoading, setFactLoading] = useState(false);
  const [factError, setFactError] = useState<string | null>(null);
  const [factResult, setFactResult] = useState<FactCheckResult | null>(null);

  // Section 2: Editor Review states
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorResult, setEditorResult] = useState<EditorReviewResult | null>(null);

  // Clipboard tracking
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2000);
  };

  const handleLoadSampleDraft = () => {
    setDraft(SAMPLE_FACT_CHECK_DRAFT);
    setFactError(null);
  };

  const handleLoadSampleGuidelines = () => {
    setGuidelines(SAMPLE_EDITORIAL_GUIDELINES);
    setEditorError(null);
  };

  const handleReset = () => {
    setDraft('');
    setGuidelines('');
    setFactResult(null);
    setEditorResult(null);
    setFactError(null);
    setEditorError(null);
  };

  // Section 1 Trigger: Fact Check
  const handleRunFactCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) {
      setFactError('Please paste your article draft first.');
      return;
    }

    if (!hasApiKey) {
      onOpenSettings();
      setFactError('Please enter your Gemini API key in Settings first.');
      return;
    }

    setFactLoading(true);
    setFactError(null);

    try {
      const data = await factCheckDraft(draft);
      setFactResult(data);
    } catch (err: any) {
      if (err.message?.includes('MISSING_KEY')) {
        onOpenSettings();
      }
      setFactError(err?.message || 'Failed to analyze factual claims. Please check your API key.');
    } finally {
      setFactLoading(false);
    }
  };

  // Section 2 Trigger: Final Editor Review
  const handleRunEditorReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) {
      setEditorError('Please paste your article draft above first.');
      return;
    }
    if (!guidelines.trim()) {
      setEditorError('Please enter the publication guidelines to compare against.');
      return;
    }

    if (!hasApiKey) {
      onOpenSettings();
      setEditorError('Please enter your Gemini API key in Settings first.');
      return;
    }

    setEditorLoading(true);
    setEditorError(null);

    try {
      const data = await finalEditorReview(draft, guidelines);
      setEditorResult(data);
    } catch (err: any) {
      if (err.message?.includes('MISSING_KEY')) {
        onOpenSettings();
      }
      setEditorError(err?.message || 'Failed to run editorial review. Please check your API key.');
    } finally {
      setEditorLoading(false);
    }
  };

  // Risk badge helper
  const riskBadge = (risk: ClaimRisk) => {
    switch (risk) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-3 h-3 text-amber-500" />
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Low
          </span>
        );
    }
  };

  // Category review status badge helper
  const statusBadge = (status: 'pass' | 'needs-fix' | 'warning') => {
    switch (status) {
      case 'pass':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Pass
          </span>
        );
      case 'needs-fix':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            Needs Fix
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-3 h-3 text-amber-500" />
            Review Needed
          </span>
        );
    }
  };

  const draftWordCount = draft.trim() ? draft.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-teal-500/10 dark:from-sky-950/40 dark:via-indigo-950/30 dark:to-teal-950/30 border border-sky-100 dark:border-sky-900/50 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Tab 4: Quality Check
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Two focused pre-submission reviews: extract every factual claim with risk verification, and compare your draft against editorial guidelines.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </button>
          </div>
        </div>
      </div>

      {/* Shared Draft Input Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Article Draft
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Paste your technical draft to audit claims and verify guideline compliance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {draftWordCount} words
            </span>
            <button
              type="button"
              onClick={handleLoadSampleDraft}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              Load Sample Draft
            </button>
          </div>
        </div>

        <textarea
          rows={7}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Paste your technical article draft here (including version numbers, code assertions, release dates, and benchmark stats)..."
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all font-sans leading-relaxed"
        />
      </div>

      {/* SECTION 1: Fact Check */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <SearchCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
                Section 1
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Fact Check &amp; Technical Claims Audit
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunFactCheck}
            disabled={factLoading || !draft.trim()}
            className="py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
          >
            {factLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Auditing Claims...
              </>
            ) : (
              <>
                <SearchCheck className="w-4 h-4" />
                Check Facts &amp; Claims
              </>
            )}
          </button>
        </div>

        {/* Mandatory Note Banner */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 font-medium">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            AI can make mistakes. Verify risky claims in official docs.
          </span>
        </div>

        {factError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs text-rose-800 dark:text-rose-300">
            {factError}
          </div>
        )}

        {/* Fact Check Results Table */}
        {factResult && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Identified Claims ({factResult.claims.length})
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Categorized by verification risk
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const tableMarkdown = [
                    '| Claim | Risk | What to verify |',
                    '|---|---|---|',
                    ...factResult.claims.map(
                      (c) => `| ${c.claim.replace(/\|/g, '\\|')} | ${c.risk.toUpperCase()} | ${c.whatToVerify.replace(/\|/g, '\\|')} |`
                    ),
                    '',
                    '> Note: AI can make mistakes. Verify risky claims in official docs.',
                  ].join('\n');
                  copyToClipboard(tableMarkdown, 'fact-table');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                {copiedSection === 'fact-table' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied Table!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Claims Table</span>
                  </>
                )}
              </button>
            </div>

            {factResult.claims.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800">
                No specific dates, version numbers, or statistical benchmarks detected in this draft.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      <th className="py-3 px-4 w-5/12">Claim</th>
                      <th className="py-3 px-3 w-2/12">Risk</th>
                      <th className="py-3 px-4 w-5/12">What to verify</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {factResult.claims.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 align-top font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                          {item.claim}
                        </td>
                        <td className="py-3 px-3 align-top whitespace-nowrap">
                          {riskBadge(item.risk)}
                        </td>
                        <td className="py-3 px-4 align-top text-slate-600 dark:text-slate-300 leading-relaxed">
                          {item.whatToVerify}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {/* SECTION 2: Final Editor Review */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
                Section 2
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Final Editor Review &amp; Guidelines Audit
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunEditorReview}
            disabled={editorLoading || !draft.trim() || !guidelines.trim()}
            className="py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
          >
            {editorLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Evaluating Guidelines...
              </>
            ) : (
              <>
                <FileCheck2 className="w-4 h-4" />
                Run Final Editor Review
              </>
            )}
          </button>
        </div>

        {/* Guidelines Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Publication Guidelines / Submission Requirements
            </label>
            <button
              type="button"
              onClick={handleLoadSampleGuidelines}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              Load Sample Guidelines
            </button>
          </div>
          <textarea
            rows={4}
            value={guidelines}
            onChange={(e) => setGuidelines(e.target.value)}
            placeholder="Paste the site's author guidelines, word count targets, style rules, heading expectations, and link requirements..."
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-all font-sans leading-relaxed"
          />
        </div>

        {editorError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs text-rose-800 dark:text-rose-300">
            {editorError}
          </div>
        )}

        {/* Editor Review Output */}
        {editorResult && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Editorial Audit Results
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {editorResult.overallSummary}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const reviewMarkdown = [
                    '# Editorial Review vs Guidelines',
                    '',
                    `**Overall Summary**: ${editorResult.overallSummary}`,
                    '',
                    '### 1. Word Count',
                    `- **Status**: ${editorResult.wordCount.status.toUpperCase()}`,
                    `- **Finding**: ${editorResult.wordCount.finding}`,
                    `- **What to fix**: ${editorResult.wordCount.recommendation}`,
                    '',
                    '### 2. Headings & Hierarchy',
                    `- **Status**: ${editorResult.headings.status.toUpperCase()}`,
                    `- **Finding**: ${editorResult.headings.finding}`,
                    `- **What to fix**: ${editorResult.headings.recommendation}`,
                    '',
                    '### 3. Tone & Voice',
                    `- **Status**: ${editorResult.tone.status.toUpperCase()}`,
                    `- **Finding**: ${editorResult.tone.finding}`,
                    `- **What to fix**: ${editorResult.tone.recommendation}`,
                    '',
                    '### 4. Technical Links & Citations',
                    `- **Status**: ${editorResult.links.status.toUpperCase()}`,
                    `- **Finding**: ${editorResult.links.finding}`,
                    `- **What to fix**: ${editorResult.links.recommendation}`,
                    '',
                    '### 5. Formatting & Code Presentation',
                    `- **Status**: ${editorResult.formatting.status.toUpperCase()}`,
                    `- **Finding**: ${editorResult.formatting.finding}`,
                    `- **What to fix**: ${editorResult.formatting.recommendation}`,
                  ].join('\n');
                  copyToClipboard(reviewMarkdown, 'editor-review');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                {copiedSection === 'editor-review' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied Review!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Review</span>
                  </>
                )}
              </button>
            </div>

            {/* 5 Categories Grid */}
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  id: 'wordCount',
                  name: 'Word Count & Scope',
                  icon: <FileText className="w-4 h-4 text-indigo-500" />,
                  item: editorResult.wordCount,
                },
                {
                  id: 'headings',
                  name: 'Headings & Section Hierarchy',
                  icon: <Heading className="w-4 h-4 text-sky-500" />,
                  item: editorResult.headings,
                },
                {
                  id: 'tone',
                  name: 'Tone & Publication Voice',
                  icon: <MessageSquare className="w-4 h-4 text-emerald-500" />,
                  item: editorResult.tone,
                },
                {
                  id: 'links',
                  name: 'Documentation Links & Citations',
                  icon: <Link2 className="w-4 h-4 text-amber-500" />,
                  item: editorResult.links,
                },
                {
                  id: 'formatting',
                  name: 'Code Formatting & Readability',
                  icon: <FileCode2 className="w-4 h-4 text-purple-500" />,
                  item: editorResult.formatting,
                },
              ].map(({ id, name, icon, item }) => (
                <div
                  key={id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {icon}
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {name}
                      </span>
                    </div>
                    {statusBadge(item.status)}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-800 dark:text-slate-200">Finding: </strong>
                    {item.finding}
                  </p>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
                    <span className="font-bold text-teal-700 dark:text-teal-400 block mb-0.5">
                      What to fix:
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {item.recommendation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

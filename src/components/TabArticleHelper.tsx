import React, { useState } from 'react';
import {
  PenTool,
  Sparkles,
  Copy,
  Check,
  Download,
  RotateCcw,
  BookOpen,
  Hash,
  Clock,
  Layers,
  ArrowRight,
  Sliders,
  ChevronDown,
  ChevronUp,
  FileText,
  MessageSquare,
  Wand2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { ArticleInput, ArticleResult, QualityChecklist, VoiceStyle } from '../types';
import { SAMPLE_ARTICLE_INPUT, DEFAULT_CHECKLIST } from '../utils/samples';
import { generateArticleHelper, rewriteDraftInVoice } from '../services/gemini';
import { ChecklistCard } from './ChecklistCard';

interface Props {
  hasApiKey: boolean;
  onOpenSettings: () => void;
}

const PUBLICATION_PRESETS = [
  'Smashing Magazine',
  'CSS-Tricks',
  'LogRocket Blog',
  'Dev.to',
  'freeCodeCamp',
  'Hackernoon',
  'Better Programming',
];

const WORD_COUNT_PRESETS = [
  { label: 'Short Tutorial (~800w)', count: 800 },
  { label: 'Standard Guide (~1,200w)', count: 1200 },
  { label: 'In-Depth Walkthrough (~1,500w)', count: 1500 },
  { label: 'Comprehensive Pillar (~2,000w)', count: 2000 },
];

export const TabArticleHelper: React.FC<Props> = ({ hasApiKey, onOpenSettings }) => {
  const [input, setInput] = useState<ArticleInput>({
    topic: '',
    targetSite: 'Smashing Magazine',
    wordCount: 1200,
    targetKeyword: '',
    personalExperience: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ArticleResult | null>(null);

  // Active view: 'rendered' or 'markdown'
  const [draftTab, setDraftTab] = useState<'rendered' | 'raw'>('rendered');
  const [activeSection, setActiveSection] = useState<'outline' | 'draft'>('draft');

  // Checklist state
  const [checklist, setChecklist] = useState<QualityChecklist>(DEFAULT_CHECKLIST);

  // Voice Rewrite State
  const [userVoiceEdits, setUserVoiceEdits] = useState('');
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>('dev-advocate');
  const [rewriting, setRewriting] = useState(false);
  const [rewriteResult, setRewriteResult] = useState<{ rewrittenDraft: string; changesSummary: string } | null>(null);

  // Copy state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleLoadSample = () => {
    setInput({ ...SAMPLE_ARTICLE_INPUT });
    setError(null);
  };

  const handleResetForm = () => {
    setInput({
      topic: '',
      targetSite: 'Smashing Magazine',
      wordCount: 1200,
      targetKeyword: '',
      personalExperience: '',
    });
    setResult(null);
    setRewriteResult(null);
    setError(null);
    setChecklist(DEFAULT_CHECKLIST);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.topic.trim()) {
      setError('Please enter an article topic or working title.');
      return;
    }

    if (!hasApiKey) {
      onOpenSettings();
      setError('Please enter your Gemini API key in Settings first.');
      return;
    }

    setLoading(true);
    setError(null);
    setRewriteResult(null);

    try {
      const data = await generateArticleHelper(input);
      setResult(data);
      setActiveSection('outline'); // show outline first as required!
    } catch (err: any) {
      if (err.message?.includes('MISSING_KEY')) {
        onOpenSettings();
      }
      setError(err?.message || 'Failed to generate article. Please check your API key and connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRewrite = async () => {
    const currentDraft = rewriteResult?.rewrittenDraft || result?.draft;
    if (!currentDraft) return;

    if (!userVoiceEdits.trim() && voiceStyle === 'custom') {
      setError('Please type your edits, voice notes, or sample writing in the voice box.');
      return;
    }

    setRewriting(true);
    setError(null);

    try {
      const rewritten = await rewriteDraftInVoice(currentDraft, userVoiceEdits, voiceStyle);
      setRewriteResult(rewritten);
    } catch (err: any) {
      setError(err?.message || 'Failed to rewrite in your voice.');
    } finally {
      setRewriting(false);
    }
  };

  const downloadMarkdown = () => {
    const content = rewriteResult?.rewrittenDraft || result?.draft;
    if (!content) return;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = (input.topic || 'guest-post')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    link.href = url;
    link.download = `${safeTitle}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Context */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-indigo-500/5 dark:from-indigo-950/40 dark:via-sky-950/30 dark:to-slate-900/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PenTool className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Article Helper for Tech Guest Posts
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Create editor-approved outlines and full drafts infused with your genuine hands-on experience, real code snippets, and conversational warmth.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700/60 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Sample Post
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form on Left, Output & Checklist on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Article Specification
              </h3>
              <span className="text-[11px] font-medium text-slate-400">Step 1 of 2</span>
            </div>

            {/* Topic Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Article Topic / Working Title <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                required
                value={input.topic}
                onChange={(e) => setInput({ ...input, topic: e.target.value })}
                placeholder="e.g. Migrating from REST to tRPC in Full-Stack Next.js 15"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Target Website / Niche */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Website / Publication Niche
              </label>
              <input
                type="text"
                value={input.targetSite}
                onChange={(e) => setInput({ ...input, targetSite: e.target.value })}
                placeholder="e.g. Smashing Magazine, CSS-Tricks, LogRocket"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
              />
              {/* Presets chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PUBLICATION_PRESETS.map((site) => (
                  <button
                    key={site}
                    type="button"
                    onClick={() => setInput({ ...input, targetSite: site })}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded-lg border transition-colors ${
                      input.targetSite === site
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {site}
                  </button>
                ))}
              </div>
            </div>

            {/* Word Count & SEO Keyword Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  Word Count Target
                </label>
                <select
                  value={input.wordCount}
                  onChange={(e) => setInput({ ...input, wordCount: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {WORD_COUNT_PRESETS.map((p) => (
                    <option key={p.count} value={p.count}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  Target SEO Keyword
                </label>
                <input
                  type="text"
                  value={input.targetKeyword}
                  onChange={(e) => setInput({ ...input, targetKeyword: e.target.value })}
                  placeholder="e.g. tRPC Next.js 15"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Critical Field: User's own experience or opinion */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Your own experience or opinion on this topic
                </label>
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                  Crucial for acceptance
                </span>
              </div>
              <textarea
                rows={4}
                value={input.personalExperience}
                onChange={(e) => setInput({ ...input, personalExperience: e.target.value })}
                placeholder="What personal anecdotes, debugging sessions, benchmarks, or contrarian opinions do you have? E.g.: 'We reduced payload by 38% after removing REST boilerplate, but struggled with RSC boundary serialization...'"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-indigo-200 dark:border-indigo-900/60 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 leading-relaxed"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tech editors discard generic summaries. Your lived experience is what turns this from generic AI text into a high-paying accepted post.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs text-rose-800 dark:text-rose-300">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Outline &amp; Draft...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Outline &amp; Full Draft
                </>
              )}
            </button>
          </form>

          {/* Checklist Card always visible on left column or below input for peace of mind */}
          <ChecklistCard checklist={checklist} onChange={setChecklist} />
        </div>

        {/* Right Column: Output Sections (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Ready to Craft Your Tech Guest Post
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Enter your topic and unique experience on the left, or click <button onClick={handleLoadSample} className="text-indigo-600 dark:text-indigo-400 font-semibold underline">Load Sample Post</button> to see the step-by-step outline, human draft, and voice rewriter in action.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 animate-pulse">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Crafting Outline and Human Tech Draft...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Synthesizing your personal insights into an editor-ready submission for {input.targetSite || 'tech blogs'}...
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Output Navigation Header */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
                {/* Tabs: Outline vs Draft */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveSection('outline')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeSection === 'outline'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>1. Outline First</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('draft')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeSection === 'draft'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>2. Full Human Draft</span>
                    {rewriteResult && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Rewritten in voice" />
                    )}
                  </button>
                </div>

                {/* Metrics & Actions */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
                    <Clock className="w-3.5 h-3.5" />
                    {result.readingTimeMinutes} min read • {result.wordCountActual} words
                  </span>
                  <button
                    type="button"
                    onClick={downloadMarkdown}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                    title="Download as Markdown (.md)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        activeSection === 'outline'
                          ? result.outline
                          : rewriteResult?.rewrittenDraft || result.draft,
                        activeSection === 'outline' ? 'outline' : 'draft'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-all"
                  >
                    {copiedField === (activeSection === 'outline' ? 'outline' : 'draft') ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy {activeSection === 'outline' ? 'Outline' : 'Draft'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* View 1: Outline */}
              {activeSection === 'outline' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                  {/* Title Options */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Suggested Publication Titles
                    </span>
                    <div className="space-y-1.5">
                      {result.titleOptions.map((title, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 group"
                        >
                          <span className="truncate pr-2">
                            <span className="text-indigo-600 dark:text-indigo-400 mr-2">#{idx + 1}</span>
                            {title}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(title, `title-${idx}`)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity"
                            title="Copy title"
                          >
                            {copiedField === `title-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Outline Content */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Structured Article Outline &amp; Word Distribution
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(result.outline, 'outline-raw')}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        {copiedField === 'outline-raw' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        Copy Outline Markdown
                      </button>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                      {result.outline}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveSection('draft')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                    >
                      Continue to Full Draft <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* View 2: Full Draft */}
              {activeSection === 'draft' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                  {/* Draft sub-toggle */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDraftTab('rendered')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          draftTab === 'rendered'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        Article Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => setDraftTab('raw')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          draftTab === 'raw'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        Raw Markdown (.md)
                      </button>
                    </div>

                    {rewriteResult && (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Voice Rewritten Active
                      </span>
                    )}
                  </div>

                  {/* Draft Text Content */}
                  {draftTab === 'rendered' ? (
                    <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      <div className="whitespace-pre-wrap font-sans">
                        {rewriteResult?.rewrittenDraft || result.draft}
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto max-h-[600px] border border-slate-800 leading-relaxed whitespace-pre-wrap">
                        {rewriteResult?.rewrittenDraft || result.draft}
                      </pre>
                    </div>
                  )}

                  {/* "Rewrite in my voice" Box */}
                  <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4 bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-2xl border">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <Wand2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Rewrite in My Voice
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Paste your own edits, writing sample, or choose a persona to reshape sentence cadence
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Voice style presets */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'dev-advocate', label: 'Dev Advocate (Punchy & Witty)' },
                        { id: 'staff-engineer', label: 'Staff Engineer (Nuanced & Arch)' },
                        { id: 'friendly-mentor', label: 'Friendly Mentor (Conversational)' },
                        { id: 'concise-direct', label: 'Concise & Direct (Zero Fluff)' },
                        { id: 'custom', label: 'Custom Voice Sample' },
                      ].map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setVoiceStyle(style.id as VoiceStyle)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                            voiceStyle === style.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>

                    {/* Text area for user's edits */}
                    <div className="space-y-1.5">
                      <textarea
                        rows={3}
                        value={userVoiceEdits}
                        onChange={(e) => setUserVoiceEdits(e.target.value)}
                        placeholder="Paste a paragraph you wrote, specific edits you prefer, or notes like: 'Make intro shorter, use shorter sentences, and sound like a seasoned Linux engineer.'"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                      />
                    </div>

                    {rewriteResult?.changesSummary && (
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200">
                        <span className="font-bold block mb-1">Voice Adjustments Made:</span>
                        <p>{rewriteResult.changesSummary}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      {rewriteResult && (
                        <button
                          type="button"
                          onClick={() => setRewriteResult(null)}
                          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline"
                        >
                          Revert to Original Draft
                        </button>
                      )}
                      <div className="ml-auto">
                        <button
                          type="button"
                          onClick={handleRewrite}
                          disabled={rewriting}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {rewriting ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Polishing Tone...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-3.5 h-3.5" />
                              Apply Voice Tuning
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

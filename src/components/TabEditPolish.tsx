import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sliders,
  Gauge,
  HelpCircle,
  ArrowRight,
  BookOpen,
  MessageSquare,
  TrendingUp,
  FileText,
  Lightbulb,
  UserCheck,
  Percent,
  CheckCheck,
  Quote,
  Activity,
  Layers,
  Wand2,
} from 'lucide-react';
import { PolishResult, PolishTone, PolishSuggestion, PersonalTouchInput } from '../types';
import { SAMPLE_POLISH_DRAFT, SAMPLE_PERSONAL_TOUCH } from '../utils/samples';
import { editAndPolishDraft, infusePersonalElements } from '../services/gemini';

interface Props {
  hasApiKey: boolean;
  onOpenSettings: () => void;
}

export const TabEditPolish: React.FC<Props> = ({ hasApiKey, onOpenSettings }) => {
  const [draft, setDraft] = useState('');
  const [tone, setTone] = useState<PolishTone>('friendly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [result, setResult] = useState<PolishResult | null>(null);
  const [workingDraft, setWorkingDraft] = useState('');

  // "Make it more yours" state
  const [personalTouch, setPersonalTouch] = useState<PersonalTouchInput>({
    personalExample: '',
    personalOpinion: '',
    realDataPoint: '',
  });
  const [infusing, setInfusing] = useState(false);
  const [personalizedDraft, setPersonalizedDraft] = useState<string | null>(null);

  // Filter suggestions by category
  const [suggestionFilter, setSuggestionFilter] = useState<'all' | 'unclear' | 'repeated' | 'long-sentence' | 'passive-voice'>('all');

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
    setDraft(SAMPLE_POLISH_DRAFT);
    setPersonalTouch({ ...SAMPLE_PERSONAL_TOUCH });
    setError(null);
  };

  const handleReset = () => {
    setDraft('');
    setResult(null);
    setWorkingDraft('');
    setPersonalizedDraft(null);
    setPersonalTouch({ personalExample: '', personalOpinion: '', realDataPoint: '' });
    setError(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) {
      setError('Please paste your written draft first.');
      return;
    }

    if (!hasApiKey) {
      onOpenSettings();
      setError('Please enter your Gemini API key in Settings first.');
      return;
    }

    setLoading(true);
    setError(null);
    setPersonalizedDraft(null);

    try {
      const data = await editAndPolishDraft(draft, tone);
      setResult(data);
      setWorkingDraft(data.correctedDraft);
    } catch (err: any) {
      if (err.message?.includes('MISSING_KEY')) {
        onOpenSettings();
      }
      setError(err?.message || 'Failed to edit and polish draft. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  // Suggestion actions: Accept or Reject
  const handleAcceptSuggestion = (suggestion: PolishSuggestion) => {
    if (!result) return;

    // Apply the replacement into workingDraft only if snippet is present
    let updatedText = workingDraft;
    if (suggestion.originalSnippet && updatedText.includes(suggestion.originalSnippet)) {
      updatedText = updatedText.replace(suggestion.originalSnippet, suggestion.suggestedFix);
      setWorkingDraft(updatedText);
    }

    const updatedSuggestions = result.suggestions.map((s) =>
      s.id === suggestion.id ? { ...s, status: 'accepted' as const } : s
    );

    setResult({
      ...result,
      suggestions: updatedSuggestions,
    });
  };

  const handleRejectSuggestion = (suggestionId: string) => {
    if (!result) return;
    const updatedSuggestions = result.suggestions.map((s) =>
      s.id === suggestionId ? { ...s, status: 'rejected' as const } : s
    );
    setResult({
      ...result,
      suggestions: updatedSuggestions,
    });
  };

  const handleResetSuggestions = () => {
    if (!result) return;
    setWorkingDraft(result.correctedDraft);
    const resetList = result.suggestions.map((s) => ({ ...s, status: 'pending' as const }));
    setResult({
      ...result,
      suggestions: resetList,
    });
  };

  // Infuse Personal Elements
  const handleInfusePersonalTouch = async () => {
    const baseText = workingDraft || result?.correctedDraft || draft;
    if (!baseText.trim()) return;

    if (!personalTouch.personalExample.trim() && !personalTouch.personalOpinion.trim() && !personalTouch.realDataPoint.trim()) {
      setError('Please fill in at least one of the personal fields (example, opinion, or data point).');
      return;
    }

    setInfusing(true);
    setError(null);

    try {
      const infused = await infusePersonalElements(baseText, personalTouch, tone);
      setPersonalizedDraft(infused);
    } catch (err: any) {
      setError(err?.message || 'Failed to infuse personal elements.');
    } finally {
      setInfusing(false);
    }
  };

  const filteredSuggestions = result?.suggestions.filter((s) => {
    if (suggestionFilter === 'all') return true;
    return s.category === suggestionFilter;
  }) || [];

  const pendingCount = result?.suggestions.filter((s) => s.status === 'pending').length || 0;
  const acceptedCount = result?.suggestions.filter((s) => s.status === 'accepted').length || 0;

  // Category labels and colors
  const categoryBadge = (cat: PolishSuggestion['category']) => {
    switch (cat) {
      case 'unclear':
        return { label: 'Unclear Phrasing', color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
      case 'repeated':
        return { label: 'Repeated Words', color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' };
      case 'long-sentence':
        return { label: 'Long / Run-on Sentence', color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
      case 'passive-voice':
        return { label: 'Passive Voice', color: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-indigo-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Edit &amp; Polish: Copyeditor &amp; Voice Enhancer
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Preserve your authentic authorial voice while eliminating grammar errors, reviewing sentence suggestions, and injecting lived experience.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-700/60 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Load Sample Draft
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Input Draft (5 cols) vs Polish Outputs (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Draft Input & Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleAnalyze} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Paste Your Article Draft
              </h3>
              <span className="text-[11px] font-medium text-slate-400">Preserves Your Style</span>
            </div>

            {/* Tone Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Target Tone</span>
                <span className="text-[11px] font-normal text-slate-400">Sets vocabulary &amp; cadence</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'simple', label: 'Simple', desc: 'Plain English' },
                  { id: 'professional', label: 'Professional', desc: 'Authoritative' },
                  { id: 'friendly', label: 'Friendly', desc: 'Conversational' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id as PolishTone)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      tone === t.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold block">{t.label}</span>
                    <span className="text-[10px] text-slate-400 block">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Draft Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Article / Section Text <span className="text-rose-500">*</span></span>
                <span className="text-[11px] text-slate-400">
                  {draft.trim() ? `${draft.trim().split(/\s+/).filter(Boolean).length} words` : '0 words'}
                </span>
              </label>
              <textarea
                rows={10}
                required
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Paste your draft or article section here. We'll fix grammar without stripping away your natural writing style..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400 leading-relaxed font-sans"
              />
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
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Grammar &amp; Readability...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Edit &amp; Polish Draft
                </>
              )}
            </button>
          </form>

          {/* "Make it more yours" Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    "Make It More Yours" Panel
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Add 3 personal anchors that turn generic articles into accepted posts
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPersonalTouch({ ...SAMPLE_PERSONAL_TOUCH })}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Sample Data
              </button>
            </div>

            <div className="space-y-3">
              {/* 1. One Personal Example */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center">1</span>
                  One Personal Example / Anecdote
                </label>
                <textarea
                  rows={2}
                  value={personalTouch.personalExample}
                  onChange={(e) => setPersonalTouch({ ...personalTouch, personalExample: e.target.value })}
                  placeholder="e.g. When debugging our checkout modal in sprint 12, our INP spiked to 520ms..."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* 2. One Opinion */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center">2</span>
                  One Opinion / Strong Take
                </label>
                <textarea
                  rows={2}
                  value={personalTouch.personalOpinion}
                  onChange={(e) => setPersonalTouch({ ...personalTouch, personalOpinion: e.target.value })}
                  placeholder="e.g. Most startups adopt micro-frontends 3 years too early without needing them..."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* 3. One Real Data Point */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center">3</span>
                  One Real Data Point / Benchmark
                </label>
                <input
                  type="text"
                  value={personalTouch.realDataPoint}
                  onChange={(e) => setPersonalTouch({ ...personalTouch, realDataPoint: e.target.value })}
                  placeholder="e.g. Bundle size decreased by 34kB (41%) after swapping Lodash for native ES methods."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleInfusePersonalTouch}
                disabled={infusing || (!draft && !workingDraft)}
                className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {infusing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Weaving Personal Elements...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    Infuse 3 Elements Into Draft
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Output 1 (Corrected Draft) + Output 2 (Suggestions) + Readability Score (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Paste Your Draft to Edit &amp; Polish
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  We'll fix objective grammar errors while keeping your personal voice intact. You'll receive accept/reject suggestions, readability diagnostics, and an interactive "Make it more yours" personal touch builder.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors"
                  >
                    Load Sample Draft to Try
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 animate-pulse">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Analyzing Sentence Flow, Grammar &amp; Readability...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Preserving your exact authorial voice while inspecting for unclear phrases, passive voice, and word repetition...
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Readability Scorecard */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Gauge className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Readability Diagnostics
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {result.readability.gradeLevel} • {result.readability.readingTimeMinutes} min read
                      </p>
                    </div>
                  </div>

                  {/* Flesch Score Pill */}
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Flesch Reading Ease</span>
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {result.readability.fleschScore} / 100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400 block">Words</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{result.readability.wordCount}</span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400 block">Sentences</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{result.readability.sentenceCount}</span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400 block">Avg Words/Sentence</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{result.readability.avgWordsPerSentence}</span>
                  </div>
                </div>

                {/* Simple Tips */}
                {result.readability.simpleTips && result.readability.simpleTips.length > 0 && (
                  <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Simple Editorial Tips for This Draft:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                      {result.readability.simpleTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Output 1: Corrected Draft (Grammar & Spelling Fixed) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                      Output 1
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Corrected Grammar &amp; Spelling
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Original phrasing and voice preserved; linguistic mistakes corrected
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(workingDraft, 'corrected-draft')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                    >
                      {copiedField === 'corrected-draft' ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied Draft!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Corrected Draft
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Draft Content with in-place editing */}
                <div className="relative">
                  <textarea
                    rows={8}
                    value={workingDraft}
                    onChange={(e) => setWorkingDraft(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-y"
                  />
                  {acceptedCount > 0 && (
                    <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300">
                      <span>{acceptedCount} suggestion{acceptedCount > 1 ? 's' : ''} incorporated into this text.</span>
                      <button
                        type="button"
                        onClick={handleResetSuggestions}
                        className="text-slate-500 hover:underline"
                      >
                        Reset to original grammar fix
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Output 2: Suggestions List (Accept / Reject items, never auto-replaced) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                      Output 2
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Editorial Suggestions
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Unclear sentences, repeated words, run-ons &amp; passive voice (Never auto-replaced)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {pendingCount} Pending
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const summaryText = result.suggestions
                          .map((s) => `[${s.category}] "${s.originalSnippet}" -> "${s.suggestedFix}" (${s.explanation})`)
                          .join('\n\n');
                        copyToClipboard(summaryText, 'suggestions-list');
                      }}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                      title="Copy all suggestions as text"
                    >
                      {copiedField === 'suggestions-list' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: `All (${result.suggestions.length})` },
                    { id: 'unclear', label: 'Unclear' },
                    { id: 'repeated', label: 'Repeated Words' },
                    { id: 'long-sentence', label: 'Long Sentences' },
                    { id: 'passive-voice', label: 'Passive Voice' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSuggestionFilter(tab.id as any)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${
                        suggestionFilter === tab.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Suggestions List */}
                {filteredSuggestions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
                    No suggestions in this category. Your draft is clean!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSuggestions.map((sug) => {
                      const badge = categoryBadge(sug.category);
                      const isPending = sug.status === 'pending';
                      const isAccepted = sug.status === 'accepted';
                      const isRejected = sug.status === 'rejected';

                      return (
                        <div
                          key={sug.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isAccepted
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 opacity-80'
                              : isRejected
                              ? 'bg-slate-100/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60'
                              : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${badge.color}`}>
                              {badge.label}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {isAccepted && (
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Accepted &amp; Applied
                                </span>
                              )}
                              {isRejected && (
                                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5" /> Rejected
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => copyToClipboard(sug.suggestedFix, `sug-fix-${sug.id}`)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                title="Copy suggested fix"
                              >
                                {copiedField === `sug-fix-${sug.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>

                          {/* Original vs Suggested Snippet */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono mb-2">
                            <div className="p-2.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-lg text-rose-900 dark:text-rose-200">
                              <span className="text-[10px] font-sans font-bold text-rose-600 block mb-0.5">Original:</span>
                              <span className="line-through">{sug.originalSnippet}</span>
                            </div>
                            <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-lg text-emerald-900 dark:text-emerald-200">
                              <span className="text-[10px] font-sans font-bold text-emerald-600 block mb-0.5">Suggested Fix:</span>
                              <span>{sug.suggestedFix}</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">
                            <strong className="text-slate-700 dark:text-slate-300">Rationale: </strong>
                            {sug.explanation}
                          </p>

                          {/* Accept / Reject Buttons */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                            <button
                              type="button"
                              onClick={() => handleAcceptSuggestion(sug)}
                              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                isAccepted
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Accept Fix
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectSuggestion(sug.id)}
                              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                isRejected
                                  ? 'bg-slate-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Personalized Draft Output (if Infused from "Make It More Yours") */}
              {personalizedDraft && (
                <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 dark:border-indigo-900/40 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Wand2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Personalized Draft (3 Anchors Infused)
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Weaves your personal example, opinion, and real data point into the narrative
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(personalizedDraft, 'personalized-draft')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                    >
                      {copiedField === 'personalized-draft' ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Personalized Draft
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <textarea
                      rows={8}
                      value={personalizedDraft}
                      onChange={(e) => setPersonalizedDraft(e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-y"
                    />
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

import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  FileCode,
  Link2,
  User,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { ProposalInput, ProposalResult, ProposalVersion } from '../types';
import { SAMPLE_PROPOSAL_INPUT } from '../utils/samples';
import { generateProposals } from '../services/gemini';

interface Props {
  hasApiKey: boolean;
  onOpenSettings: () => void;
}

const COMMON_SKILL_TAGS = [
  'React 19',
  'Next.js 15',
  'TypeScript',
  'Node.js',
  'Technical Writing',
  'API Documentation',
  'DevRel',
  'System Architecture',
  'PostgreSQL',
  'Tailwind CSS',
  'Docker',
];

export const TabProposalWriter: React.FC<Props> = ({ hasApiKey, onOpenSettings }) => {
  const [input, setInput] = useState<ProposalInput>({
    jobDescription: '',
    freelancerSkills: '',
    sample1Url: '',
    sample1Title: '',
    sample2Url: '',
    sample2Title: '',
    freelancerName: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProposalResult | null>(null);

  // Allow in-place editing for fine-tuning
  const [editedProposals, setEditedProposals] = useState<{ [key: string]: string }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleLoadSample = () => {
    setInput({ ...SAMPLE_PROPOSAL_INPUT });
    setError(null);
  };

  const handleReset = () => {
    setInput({
      jobDescription: '',
      freelancerSkills: '',
      sample1Url: '',
      sample1Title: '',
      sample2Url: '',
      sample2Title: '',
      freelancerName: '',
    });
    setResult(null);
    setEditedProposals({});
    setError(null);
  };

  const handleAddSkill = (skill: string) => {
    const current = input.freelancerSkills.split(',').map((s) => s.trim()).filter(Boolean);
    if (!current.includes(skill)) {
      current.push(skill);
      setInput({ ...input, freelancerSkills: current.join(', ') });
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.jobDescription.trim()) {
      setError('Please paste the client’s job description.');
      return;
    }
    if (!input.freelancerName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!input.sample1Url.trim() && !input.sample2Url.trim()) {
      setError('Please provide at least 1 work sample link to back up your pitch.');
      return;
    }

    if (!hasApiKey) {
      onOpenSettings();
      setError('Please enter your Gemini API key in Settings first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await generateProposals(input);
      setResult(data);
      setEditedProposals({
        version1: data.version1.fullProposal,
        version2: data.version2.fullProposal,
        version3: data.version3.fullProposal,
      });
    } catch (err: any) {
      if (err.message?.includes('MISSING_KEY')) {
        onOpenSettings();
      }
      setError(err?.message || 'Failed to write proposals. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const renderProposalCard = (
    versionKey: 'version1' | 'version2' | 'version3',
    rawVersion: ProposalVersion,
    cardBadge: string,
    badgeColor: string
  ) => {
    const text = editedProposals[versionKey] ?? rawVersion.fullProposal;
    const words = getWordCount(text);
    const isUnderLimit = words <= 150;

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md ${badgeColor}`}>
                {cardBadge}
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {rawVersion.title}
              </h4>
            </div>

            {/* Word Count Indicator */}
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  isUnderLimit
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50'
                }`}
              >
                {isUnderLimit && <Check className="w-3 h-3 text-emerald-500" />}
                {words} words {isUnderLimit ? '(Under 150w goal)' : '(Over 150w)'}
              </span>
            </div>
          </div>

          {/* Core Elements Checklist */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
              <CheckCircle2 className="w-3 h-3 text-indigo-500 shrink-0" />
              <span className="truncate">Hook: Job-specific</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
              <CheckCircle2 className="w-3 h-3 text-indigo-500 shrink-0" />
              <span className="truncate">Sample: Cited</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
              <CheckCircle2 className="w-3 h-3 text-indigo-500 shrink-0" />
              <span className="truncate">1 Smart Question</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
              <CheckCircle2 className="w-3 h-3 text-indigo-500 shrink-0" />
              <span className="truncate">Next Step CTA</span>
            </div>
          </div>

          {/* Proposal Text with in-place editing */}
          <div className="relative group">
            <textarea
              rows={8}
              value={text}
              onChange={(e) =>
                setEditedProposals({
                  ...editedProposals,
                  [versionKey]: e.target.value,
                })
              }
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-y"
            />
            <span className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-slate-400 flex items-center gap-1 pointer-events-none">
              <Edit3 className="w-3 h-3" /> Editable in-place
            </span>
          </div>

          {/* Key Breakdown Info */}
          {rawVersion.smartQuestion && (
            <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
              <span className="font-bold text-indigo-900 dark:text-indigo-300 block">
                Targeted Question Included:
              </span>
              <p className="italic">"{rawVersion.smartQuestion}"</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Ready to paste on Upwork</span>
          <button
            type="button"
            onClick={() => copyToClipboard(text, versionKey)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all shadow-indigo-500/20"
          >
            {copiedKey === versionKey ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied Proposal!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Proposal
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-emerald-500/10 dark:from-sky-950/40 dark:via-indigo-950/30 dark:to-emerald-950/30 border border-sky-100 dark:border-sky-900/50 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              High-Converting Proposal Writer (Under 150 Words)
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Generates 3 punchy, honest pitches tailored for Upwork and Freelancer. Starts with a tailored hook, cites your real work, asks 1 smart project question, and closes cleanly.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700/60 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Sample Job &amp; Pitch
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

      {/* Main Grid: Form Left, 3 Output Cards Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Job &amp; Freelancer Credentials
              </h3>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Zero Fake Claims
              </span>
            </div>

            {/* Freelancer Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Your Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={input.freelancerName}
                onChange={(e) => setInput({ ...input, freelancerName: e.target.value })}
                placeholder="e.g. Alex Morgan"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Job Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Pasted Job Description <span className="text-rose-500">*</span></span>
              </label>
              <textarea
                rows={5}
                required
                value={input.jobDescription}
                onChange={(e) => setInput({ ...input, jobDescription: e.target.value })}
                placeholder="Paste the full Upwork or Freelancer job posting here..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 leading-relaxed"
              />
            </div>

            {/* Freelancer Skills */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Your Skills &amp; Specialties
              </label>
              <input
                type="text"
                value={input.freelancerSkills}
                onChange={(e) => setInput({ ...input, freelancerSkills: e.target.value })}
                placeholder="e.g. React 19, TypeScript, Technical Writing, Performance Benchmarks"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <div className="flex flex-wrap gap-1">
                {COMMON_SKILL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddSkill(tag)}
                    className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 rounded-md transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 2 Work Samples */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-indigo-500" />
                  2 Past Work Samples (Real URLs)
                </label>
                <span className="text-[10px] text-slate-400">Strictly no fabricated links</span>
              </div>

              {/* Sample 1 */}
              <div className="space-y-1 bg-slate-50/50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Sample 1</span>
                <input
                  type="url"
                  value={input.sample1Url}
                  onChange={(e) => setInput({ ...input, sample1Url: e.target.value })}
                  placeholder="https://dev.to/username/my-article-link"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={input.sample1Title}
                  onChange={(e) => setInput({ ...input, sample1Title: e.target.value })}
                  placeholder="Title or focus: e.g. Benchmarking React 19 Hydration"
                  className="w-full px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Sample 2 */}
              <div className="space-y-1 bg-slate-50/50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Sample 2</span>
                <input
                  type="url"
                  value={input.sample2Url}
                  onChange={(e) => setInput({ ...input, sample2Url: e.target.value })}
                  placeholder="https://blog.logrocket.com/mastering-typescript/"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={input.sample2Title}
                  onChange={(e) => setInput({ ...input, sample2Title: e.target.value })}
                  placeholder="Title or focus: e.g. Mastering Advanced TypeScript Patterns"
                  className="w-full px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
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
                  Generating 3 Targeted Proposals...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Generate 3 Proposals (&lt; 150 Words)
                </>
              )}
            </button>
          </form>

          {/* Upwork Pitch Strategy Rules */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              The 4 Rules of High-Converting Upwork Pitches
            </h4>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 list-disc pl-4 leading-relaxed">
              <li><strong className="text-slate-800 dark:text-slate-200">First 2 lines are previewed on mobile:</strong> Never waste them with "Dear Hiring Manager". Jump straight to their specific stack or problem.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Always under 150 words:</strong> Clients get 40+ proposals. Short, punchy pitches get read in full while long walls of text get skipped.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Ask 1 insightful technical question:</strong> This forces a conversation and boosts response rate by 3x.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Single, hyper-relevant sample:</strong> Don't dump 10 links; name the one closest to their project.</li>
            </ul>
          </div>
        </div>

        {/* Proposals Output Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <Send className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Generate 3 Tailored Pitch Versions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Paste a real job posting from Upwork or Freelancer, or click <button onClick={handleLoadSample} className="text-indigo-600 dark:text-indigo-400 font-semibold underline">Load Sample Job</button> to see 3 high-converting pitches that strictly adhere to the &lt; 150-word rule.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 animate-pulse">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Crafting 3 Hyper-Targeted Proposals...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enforcing strict &lt; 150-word constraint, tailoring hook to job specifics, selecting top work sample, and inserting high-signal technical question...
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-5">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>3 Tailored Proposals</span>
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    (Click any box to edit text before copying)
                  </span>
                </h3>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                  All &lt; 150 words
                </span>
              </div>

              {/* Proposal 1 */}
              {renderProposalCard(
                'version1',
                result.version1,
                'Version 1: Direct Impact',
                'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80'
              )}

              {/* Proposal 2 */}
              {renderProposalCard(
                'version2',
                result.version2,
                'Version 2: Tech Teaser',
                'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80'
              )}

              {/* Proposal 3 */}
              {renderProposalCard(
                'version3',
                result.version3,
                'Version 3: Fast Collaborator',
                'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80'
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

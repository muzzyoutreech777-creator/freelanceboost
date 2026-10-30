import React from 'react';
import { CheckSquare, Square, ShieldCheck, AlertCircle, Sparkles, CheckCircle2, Info } from 'lucide-react';
import { QualityChecklist } from '../types';
import { CHECKLIST_ITEMS } from '../utils/samples';

interface Props {
  checklist: QualityChecklist;
  onChange: (updated: QualityChecklist) => void;
}

export const ChecklistCard: React.FC<Props> = ({ checklist, onChange }) => {
  const items = CHECKLIST_ITEMS;
  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = items.length;
  const allCompleted = completedCount === totalCount;

  const toggleItem = (id: keyof QualityChecklist) => {
    onChange({
      ...checklist,
      [id]: !checklist[id],
    });
  };

  const handleCheckAll = () => {
    const allTrue: QualityChecklist = {
      originalIdeas: true,
      factsVerified: true,
      sourcesLinked: true,
      noCopiedText: true,
      readsNaturally: true,
      followsGuidelines: true,
    };
    onChange(allTrue);
  };

  const handleReset = () => {
    const allFalse: QualityChecklist = {
      originalIdeas: false,
      factsVerified: false,
      sourcesLinked: false,
      noCopiedText: false,
      readsNaturally: false,
      followsGuidelines: false,
    };
    onChange(allFalse);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              Guest Post Quality & Acceptance Checklist
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Verify these 6 criteria before sending your draft to tech blog editors
            </p>
          </div>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center gap-1 ${
              allCompleted
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            {allCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
            {completedCount} / {totalCount} Verified
          </span>
          <button
            type="button"
            onClick={allCompleted ? handleReset : handleCheckAll}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-1 py-0.5"
          >
            {allCompleted ? 'Reset' : 'Check All'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            allCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
          }`}
          style={{ width: `${(completedCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {items.map((item) => {
          const isChecked = checklist[item.id as keyof QualityChecklist];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(item.id as keyof QualityChecklist)}
              className={`flex items-start gap-3 p-3 text-left rounded-xl border transition-all ${
                isChecked
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-slate-900 dark:text-slate-100'
                  : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400">
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                )}
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className={`text-xs font-semibold block ${isChecked ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
                  {item.label}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
        <Info className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
        <span>A strong guest post has original insight, verified facts and clear sources. Use this checklist to review your draft before submitting.</span>
      </div>
    </div>
  );
};

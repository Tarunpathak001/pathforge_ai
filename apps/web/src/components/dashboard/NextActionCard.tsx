import React from 'react';
import type { NextAction } from '@pathforge/shared';

interface NextActionCardProps {
  nextAction: NextAction | null;
  onExecuteAction: (action: NextAction) => void;
}

export const NextActionCard: React.FC<NextActionCardProps> = ({
  nextAction,
  onExecuteAction,
}) => {
  if (!nextAction) {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
        <h3 className="text-sm font-semibold text-slate-300">All caught up!</h3>
        <p className="text-xs text-slate-400">
          You have completed all immediate recommendations. Generate a new roadmap or verify more skills.
        </p>
      </div>
    );
  }

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'ASSESSMENT':
        return { label: 'Verification Quiz', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
      case 'PROJECT':
        return { label: 'Capstone Project', bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30' };
      case 'RESOURCE':
      default:
        return { label: 'Primary Learning Resource', bg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' };
    }
  };

  const badge = getActionBadge(nextAction.type);

  return (
    <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-slate-900/90 border border-indigo-500/30 hover:border-indigo-500/50 rounded-2xl p-6 sm:p-7 shadow-xl shadow-indigo-950/20 space-y-5 transition-all relative overflow-hidden">
      {/* Glow Accent */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
            Next Best Action
          </span>
        </div>

        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${badge.bg}`}>
          {badge.label}
        </span>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
          {nextAction.title}
        </h2>
        {nextAction.skillName && (
          <div className="text-xs text-indigo-300 font-medium">
            Target Competency: <span className="text-white font-semibold">{nextAction.skillName}</span>
          </div>
        )}
      </div>

      {/* Why now rationale */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-1">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
          Why this action now?
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{nextAction.reason}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>⏱</span>
            <span>Est. Time: <strong className="text-slate-200">{nextAction.estimatedMinutes >= 60 ? `${Math.round(nextAction.estimatedMinutes / 60)} hrs` : `${nextAction.estimatedMinutes} mins`}</strong></span>
          </div>
          {nextAction.subtitle && (
            <div className="flex items-center gap-1.5">
              <span>⚡</span>
              <span><strong className="text-slate-200">{nextAction.subtitle}</strong></span>
            </div>
          )}
        </div>

        <button
          onClick={() => onExecuteAction(nextAction)}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center gap-2 transform active:scale-98"
        >
          <span>{nextAction.type === 'ASSESSMENT' ? 'Start Assessment' : 'Continue Activity'}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

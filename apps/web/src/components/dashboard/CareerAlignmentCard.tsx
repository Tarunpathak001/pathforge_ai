import React from 'react';
import type { DashboardCareerAlignment } from '@pathforge/shared';

interface CareerAlignmentCardProps {
  careerName: string;
  alignment: DashboardCareerAlignment | null;
  onViewAnalysis: () => void;
}

export const CareerAlignmentCard: React.FC<CareerAlignmentCardProps> = ({
  careerName,
  alignment,
  onViewAnalysis,
}) => {
  if (!alignment) {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
        <h3 className="text-base font-bold text-white">Target Career Alignment</h3>
        <p className="text-xs text-slate-400">
          Run your career analysis to determine how your skills match {careerName}.
        </p>
        <button
          onClick={onViewAnalysis}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
        >
          Analyze Alignment
        </button>
      </div>
    );
  }

  const score = alignment.score;
  const delta = alignment.delta;

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Target Career
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">{careerName}</h3>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {alignment.band}
        </span>
      </div>

      {/* Main Score Radial / Progress Bar */}
      <div className="space-y-3 pt-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-slate-300">Career Alignment</span>
          <span className="text-3xl font-black text-white">{score}%</span>
        </div>

        {/* Multi-tier progress bar */}
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${score}%` }}
          ></div>
        </div>

        {delta !== 0 && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <span>{delta > 0 ? `↑ +${delta}%` : `↓ ${delta}%`}</span>
            <span className="text-slate-400 font-normal">{alignment.deltaReason}</span>
          </div>
        )}
      </div>

      {/* Breakdown Pills */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
        <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-800">
          <div className="text-lg font-bold text-emerald-400">{alignment.strongCount}</div>
          <div className="text-[11px] text-slate-400">Strong</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-800">
          <div className="text-lg font-bold text-amber-400">{alignment.developingCount}</div>
          <div className="text-[11px] text-slate-400">Developing</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-800">
          <div className="text-lg font-bold text-rose-400">{alignment.gapCount}</div>
          <div className="text-[11px] text-slate-400">Critical Gaps</div>
        </div>
      </div>

      {/* Explanation Footnote */}
      <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3">
        {alignment.explanation}
      </p>

      <button
        onClick={onViewAnalysis}
        className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/60 hover:border-slate-600 transition-all flex items-center justify-center gap-1.5"
      >
        <span>View Full Skill Gap Analysis</span>
        <span>→</span>
      </button>
    </div>
  );
};

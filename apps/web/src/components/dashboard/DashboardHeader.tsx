import React from 'react';
import type { DashboardSummary } from '@pathforge/shared';

interface DashboardHeaderProps {
  data: DashboardSummary;
  onOpenCareerSwitch: () => void;
  onContinueLearning: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  data,
  onOpenCareerSwitch,
  onContinueLearning,
}) => {
  const greeting = 'Welcome back';
  const userName = data.user?.name ? `, ${data.user.name.split(' ')[0]}` : '';
  const careerName = data.career?.name || 'Your Target Career';
  const score = data.alignment?.score ?? 0;

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-800">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
            Career Command Center
          </span>
          {data.isStale && (
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
              Needs Update
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {greeting}
          {userName}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <span className="text-slate-400">Your path to:</span>
          <span className="font-semibold text-white bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700">
            {careerName}
          </span>
          <button
            onClick={onOpenCareerSwitch}
            className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-4 flex items-center gap-1 transition-colors"
          >
            Change Target
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {/* Compact Alignment Meter */}
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Career Alignment</div>
            <div className="text-xs text-emerald-400 font-semibold">
              {data.alignment?.band || 'Calculating'}
            </div>
          </div>
          <div className="text-2xl font-black text-white bg-indigo-950/60 border border-indigo-500/30 rounded-lg px-2.5 py-1">
            {score}%
          </div>
        </div>

        {/* Primary CTA */}
        {data.nextAction && (
          <button
            onClick={onContinueLearning}
            className="px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center gap-2 transform active:scale-98"
          >
            <span>▶</span> Continue Learning
          </button>
        )}
      </div>
    </div>
  );
};

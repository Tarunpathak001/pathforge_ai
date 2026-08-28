import React from 'react';
import type { DashboardWeeklySummary } from '@pathforge/shared';

interface WeeklyProgressCardProps {
  summary: DashboardWeeklySummary;
}

export const WeeklyProgressCard: React.FC<WeeklyProgressCardProps> = ({ summary }) => {
  const completed = summary?.completedHours || 0;
  const target = summary?.targetWeeklyHours || 10;
  const progressPercent = Math.min(100, Math.round((completed / target) * 100));

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Commitment
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">This Week</h3>
        </div>
        <span className="text-xs font-bold text-indigo-400">
          {completed} / {target} hrs
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/40">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="text-[11px] text-slate-400 text-right">
          {progressPercent}% of weekly target met
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
        <div className="p-2 bg-slate-800/40 rounded-lg">
          <div className="text-sm font-bold text-white">{summary.completedResources}</div>
          <div className="text-[10px] text-slate-400">Resources</div>
        </div>
        <div className="p-2 bg-slate-800/40 rounded-lg">
          <div className="text-sm font-bold text-white">{summary.completedAssessments}</div>
          <div className="text-[10px] text-slate-400">Quizzes</div>
        </div>
        <div className="p-2 bg-slate-800/40 rounded-lg">
          <div className="text-sm font-bold text-white">{summary.skillsImproved}</div>
          <div className="text-[10px] text-slate-400">Skills Up</div>
        </div>
      </div>
    </div>
  );
};

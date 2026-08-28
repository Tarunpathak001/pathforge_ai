import React from 'react';
import type { DashboardCurrentMilestone } from '@pathforge/shared';

interface CurrentMilestoneCardProps {
  milestone: DashboardCurrentMilestone | null;
  onOpenMilestone: () => void;
}

export const CurrentMilestoneCard: React.FC<CurrentMilestoneCardProps> = ({
  milestone,
  onOpenMilestone,
}) => {
  if (!milestone) {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">No active learning milestone</h3>
        <p className="text-xs text-slate-400">
          Generate your personalized learning roadmap to start progressing through milestones.
        </p>
      </div>
    );
  }

  const progress = milestone.progressPercent || 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Current Roadmap Milestone
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Milestone {milestone.order}: {milestone.title}
          </h3>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          {progress}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Milestone Progress</span>
          <span>
            {milestone.completedHours} / {milestone.totalHours} hrs
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/40">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Skills Checklist */}
      {milestone.skills && milestone.skills.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-slate-800/80">
          <div className="text-xs font-medium text-slate-400">Milestone Skills Checklist:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {milestone.skills.map((s, idx) => {
              const isCompleted = s.status === 'COMPLETED' || s.isMastered;
              const isInProgress = s.status === 'IN_PROGRESS';
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2 text-xs p-2 rounded-lg border ${
                    isCompleted
                      ? 'bg-emerald-950/20 text-emerald-300 border-emerald-800/40'
                      : isInProgress
                      ? 'bg-indigo-950/20 text-indigo-200 border-indigo-800/40'
                      : 'bg-slate-800/40 text-slate-400 border-slate-800'
                  }`}
                >
                  <span className="font-bold">
                    {isCompleted ? '✓' : isInProgress ? '→' : '○'}
                  </span>
                  <span className="truncate">{s.skillName}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={onOpenMilestone}
        className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/60 transition-all flex items-center justify-center gap-1.5"
      >
        <span>Open Milestone in Learning Path</span>
        <span>→</span>
      </button>
    </div>
  );
};

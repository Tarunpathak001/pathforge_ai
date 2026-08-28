import React from 'react';
import type { DashboardRoadmapPreview } from '@pathforge/shared';

interface RoadmapPreviewProps {
  roadmap: DashboardRoadmapPreview | null;
  onViewFullPath: () => void;
}

export const RoadmapPreview: React.FC<RoadmapPreviewProps> = ({
  roadmap,
  onViewFullPath,
}) => {
  if (!roadmap) {
    return null;
  }

  const milestones = roadmap.milestones || [];

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Roadmap Sequence
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">{roadmap.title}</h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400 font-medium">Overall Progress</div>
          <div className="text-sm font-bold text-indigo-400">
            {roadmap.overallProgressPercent}%
          </div>
        </div>
      </div>

      {/* Milestone Step Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {milestones.map((m, idx) => {
          const isCompleted = m.status === 'COMPLETED';
          const isInProgress = m.status === 'IN_PROGRESS';
          const isAvailable = m.status === 'AVAILABLE';

          return (
            <div
              key={m.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                isCompleted
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                  : isInProgress
                  ? 'bg-indigo-950/30 border-indigo-500/50 text-white shadow-md shadow-indigo-950/30'
                  : isAvailable
                  ? 'bg-slate-800/60 border-slate-700/60 text-slate-200'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="uppercase tracking-wider">M{idx + 1}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : isInProgress
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : isAvailable
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted
                      ? 'Completed'
                      : isInProgress
                      ? 'In Progress'
                      : isAvailable
                      ? 'Ready'
                      : 'Locked'}
                  </span>
                </div>
                <div className="font-semibold text-xs line-clamp-2 mt-1">{m.title}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>{m.estimatedHours} hrs</span>
                <span>{m.progressPercent}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onViewFullPath}
        className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/60 transition-all flex items-center justify-center gap-1.5"
      >
        <span>View Full Interactive Roadmap</span>
        <span>→</span>
      </button>
    </div>
  );
};

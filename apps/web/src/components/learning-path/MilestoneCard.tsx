import React from 'react';
import type { LearningMilestoneItem } from '@pathforge/shared';

interface MilestoneCardProps {
  milestone: LearningMilestoneItem;
  index: number;
  totalMilestones: number;
  onSelect: (milestone: LearningMilestoneItem) => void;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  index,
  totalMilestones,
  onSelect,
}) => {
  const isCompleted = milestone.status === 'COMPLETED';
  const isInProgress = milestone.status === 'IN_PROGRESS';
  const isCapstone = milestone.title.toLowerCase().includes('capstone');

  return (
    <div className="relative flex items-start gap-4 md:gap-6 group">
      {/* Step Circle & Connector Node */}
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all duration-300 shadow-md ${
            isCompleted
              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
              : isInProgress
              ? 'bg-blue-600 text-white shadow-blue-500/30 ring-4 ring-blue-500/20 animate-pulse'
              : isCapstone
              ? 'bg-purple-600 text-white shadow-purple-500/30'
              : 'bg-slate-700 text-slate-300 border border-slate-600 group-hover:border-blue-500'
          }`}
        >
          {isCompleted ? '✓' : milestone.order}
        </div>
        {index < totalMilestones - 1 && (
          <div
            className={`w-0.5 h-full min-h-[40px] my-1 ${
              isCompleted ? 'bg-emerald-500/50' : 'bg-slate-700'
            }`}
          />
        )}
      </div>

      {/* Card Body */}
      <div
        onClick={() => onSelect(milestone)}
        className={`flex-1 mb-6 p-5 md:p-6 rounded-xl border transition-all duration-300 cursor-pointer text-left ${
          isInProgress
            ? 'bg-slate-800/90 border-blue-500/50 shadow-lg shadow-blue-950/40 hover:border-blue-400'
            : isCapstone
            ? 'bg-gradient-to-r from-purple-950/30 to-slate-800/80 border-purple-500/40 hover:border-purple-400 shadow-lg shadow-purple-950/20'
            : 'bg-slate-800/60 border-slate-700 hover:border-slate-500 hover:bg-slate-800/80'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Milestone {milestone.order}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isCompleted
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                  : isInProgress
                  ? 'bg-blue-950/80 text-blue-300 border border-blue-700/50'
                  : isCapstone
                  ? 'bg-purple-950/80 text-purple-300 border border-purple-800/50'
                  : 'bg-slate-700/60 text-slate-400 border border-slate-600/40'
              }`}
            >
              {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : isCapstone ? 'Final Capstone' : 'Upcoming'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              ⏱️ {milestone.estimatedHours} hrs
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              📅 ~{milestone.estimatedWeeks} {milestone.estimatedWeeks === 1 ? 'week' : 'weeks'}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
          {milestone.title}
        </h3>
        <p className="text-sm text-slate-300 mb-4 leading-relaxed line-clamp-2">
          {milestone.description}
        </p>

        {/* Skills Covered Pills */}
        {milestone.skills && milestone.skills.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1">Skills:</span>
            {milestone.skills.map(s => (
              <span
                key={s.skillId}
                className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-700/80 text-slate-200 border border-slate-600/50"
              >
                {s.skillName} (Lvl {s.targetLevel})
              </span>
            ))}
          </div>
        )}

        {/* Objectives & Resources Count Snippet */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/60 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              🎯 {milestone.learningObjectives?.length || 0} Objectives
            </span>
            <span className="flex items-center gap-1">
              📚 {milestone.resources?.length || 0} Curated Resources
            </span>
          </div>
          <span className="text-blue-400 font-medium group-hover:translate-x-0.5 transition-transform">
            View Details & Resources →
          </span>
        </div>
      </div>
    </div>
  );
};

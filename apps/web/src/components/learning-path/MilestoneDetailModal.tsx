import React from 'react';
import type { LearningMilestoneItem } from '@pathforge/shared';

interface MilestoneDetailModalProps {
  milestone: LearningMilestoneItem | null;
  onClose: () => void;
}

export const MilestoneDetailModal: React.FC<MilestoneDetailModalProps> = ({
  milestone,
  onClose,
}) => {
  if (!milestone) return null;

  const isCompleted = milestone.status === 'COMPLETED';
  const isInProgress = milestone.status === 'IN_PROGRESS';
  const isCapstone = milestone.title.toLowerCase().includes('capstone');

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'PRIMARY':
        return 'bg-blue-900/60 text-blue-300 border-blue-600/50';
      case 'PROJECT':
        return 'bg-purple-900/60 text-purple-300 border-purple-600/50';
      case 'PRACTICE':
        return 'bg-amber-900/60 text-amber-300 border-amber-600/50';
      default:
        return 'bg-slate-700/60 text-slate-300 border-slate-600/50';
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'BEGINNER':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800/50';
      case 'INTERMEDIATE':
        return 'bg-amber-950 text-amber-400 border-amber-800/50';
      case 'ADVANCED':
        return 'bg-rose-950 text-rose-400 border-rose-800/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Milestone {milestone.order}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isCompleted
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                    : isInProgress
                    ? 'bg-blue-950 text-blue-300 border border-blue-700/60 ring-2 ring-blue-500/20'
                    : isCapstone
                    ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isCompleted ? '✓ Completed' : isInProgress ? '⚡ In Progress' : isCapstone ? '👑 Capstone Project' : '⏳ Upcoming'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
              {milestone.title}
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
              <span>⏱️ <strong>{milestone.estimatedHours}</strong> total hours</span>
              <span>•</span>
              <span>📅 Estimated duration: <strong>{milestone.estimatedWeeks}</strong> {milestone.estimatedWeeks === 1 ? 'week' : 'weeks'}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Why This Order Explanation Box */}
          {milestone.whyThisOrder && (
            <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 text-blue-200">
              <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-blue-400 mb-1">
                <span>💡 Prerequisite & Progression Logic</span>
              </div>
              <p className="text-sm leading-relaxed text-blue-200/90">
                {milestone.whyThisOrder}
              </p>
            </div>
          )}

          {/* Target Skills */}
          {milestone.skills && milestone.skills.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-200 mb-2.5 flex items-center gap-2">
                <span>🎯 Target Competencies to Master</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {milestone.skills.map(s => (
                  <div
                    key={s.skillId}
                    className="p-3 rounded-lg bg-slate-800/70 border border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{s.skillName}</div>
                      <div className="text-xs text-slate-400">{s.category || 'Core Skill'}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800/50">
                        Target Lvl {s.targetLevel}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Objectives */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-2.5 flex items-center gap-2">
              <span>📋 Measurable Learning Objectives</span>
            </h4>
            <div className="space-y-2">
              {milestone.learningObjectives.map((obj, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/40"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-900/50 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed">{obj}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Learning Resources */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-2.5 flex items-center gap-2">
              <span>📚 Assigned Learning Resources</span>
            </h4>

            {milestone.resources && milestone.resources.length > 0 ? (
              <div className="space-y-3">
                {milestone.resources.map(resItem => {
                  const res = resItem.resource;
                  return (
                    <div
                      key={resItem.resourceId}
                      className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${getRoleBadgeColor(
                              resItem.role
                            )}`}
                          >
                            {resItem.role}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300">
                            {res.resourceType}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium border ${getDifficultyColor(
                              res.difficulty
                            )}`}
                          >
                            {res.difficulty}
                          </span>
                          <span className="text-xs text-slate-400">
                            • {res.provider}
                          </span>
                        </div>

                        <h5 className="text-base font-bold text-white mb-1">
                          {res.title}
                        </h5>
                        <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                          {res.description}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>⏱️ {resItem.estimatedHours} hrs study time</span>
                          <span>•</span>
                          <span>{res.isFree ? '🟢 Free Resource' : '🔵 Paid / Subscription'}</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm"
                        >
                          Launch Resource ↗
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 text-xs text-slate-400">
                Self-directed portfolio capstone implementation. Synthesize learning from previous milestones.
              </div>
            )}
          </div>

          {/* Completion Criteria */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-2.5 flex items-center gap-2">
              <span>🏆 Milestone Completion Criteria</span>
            </h4>
            <div className="p-4 rounded-xl bg-slate-800/90 border border-emerald-500/30 text-slate-300 space-y-2">
              {milestone.completionCriteria.map((crit, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-emerald-300/90">
                  <span>✓</span>
                  <span>{crit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

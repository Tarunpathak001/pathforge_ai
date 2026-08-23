import React from 'react';
import type { SkillGapItem } from '@pathforge/shared';

interface SkillGapExplanationModalProps {
  item: SkillGapItem | null;
  onClose: () => void;
  onSelectPrerequisite?: (slug: string) => void;
}

export const SkillGapExplanationModal: React.FC<SkillGapExplanationModalProps> = ({
  item,
  onClose,
  onSelectPrerequisite,
}) => {
  if (!item) return null;

  const getImportanceBadge = (importance: string) => {
    switch (importance.toUpperCase()) {
      case 'CORE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  const getReadinessBadge = (readiness: string) => {
    switch (readiness) {
      case 'READY':
        return {
          label: 'Ready to Learn',
          classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          desc: 'All foundational prerequisites are satisfied.',
        };
      case 'PARTIALLY_READY':
        return {
          label: 'Partially Ready',
          classes: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          desc: 'Some foundational prerequisites are still in progress.',
        };
      case 'BLOCKED':
        return {
          label: 'Prerequisites Blocked',
          classes: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          desc: 'Missing key foundational skills. Complete prerequisites first for efficient learning.',
        };
      default:
        return {
          label: readiness,
          classes: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
          desc: '',
        };
    }
  };

  const readinessInfo = getReadinessBadge(item.readiness);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-cyan-950/40 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 flex items-start justify-between">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getImportanceBadge(
                  item.importance.toString()
                )}`}
              >
                {item.importance} ROLE IMPORTANCE
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {item.categoryName}
              </span>
              {item.isCritical && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                  CRITICAL GAP
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              {item.skillName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Level Discrepancy & Priority Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-xs text-slate-400 font-medium mb-1">Your Proficiency</div>
              <div className="text-2xl font-bold text-cyan-400 flex items-baseline gap-1">
                {item.learnerLevel}
                <span className="text-xs text-slate-500">/ 5</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {item.learnerLevel === 0 ? 'No recorded evidence' : 'Self-reported level'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-xs text-slate-400 font-medium mb-1">Career Requirement</div>
              <div className="text-2xl font-bold text-indigo-400 flex items-baseline gap-1">
                {item.requiredLevel}
                <span className="text-xs text-slate-500">/ 5</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">Modeled benchmark</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-xs text-slate-400 font-medium mb-1">Learning Priority</div>
              <div className="text-2xl font-bold text-amber-400 flex items-baseline gap-1">
                {item.displayPriority}
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">Deterministic Rank</div>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Competency Alignment</span>
              <span className="font-semibold text-slate-300">
                {item.learnerLevel >= item.requiredLevel
                  ? 'Requirement Satisfied (100%)'
                  : `Gap: ${item.gap} level${item.gap > 1 ? 's' : ''}`}
              </span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden relative">
              {/* Target Marker */}
              <div
                className="absolute top-0 bottom-0 bg-indigo-500/30 border-r-2 border-indigo-400 z-10"
                style={{ width: `${(item.requiredLevel / 5) * 100}%` }}
              />
              {/* Learner Progress */}
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  item.learnerLevel >= item.requiredLevel
                    ? 'bg-emerald-500'
                    : item.learnerLevel > 0
                      ? 'bg-cyan-500'
                      : 'bg-transparent'
                }`}
                style={{ width: `${(item.learnerLevel / 5) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 pt-1">
              <span>0 (None)</span>
              <span>1 (Beginner)</span>
              <span>2 (Basic)</span>
              <span>3 (Intermediate)</span>
              <span>4 (Advanced)</span>
              <span>5 (Expert)</span>
            </div>
          </div>

          {/* Why This Matters — Structured Explanation */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/30 to-slate-900 border border-cyan-800/40 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs uppercase tracking-wider">
              <span>💡</span>
              <span>Why This Gap Matters</span>
            </div>
            <p className="text-slate-200 leading-relaxed">{item.explanation}</p>
          </div>

          {/* Prerequisite Readiness Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <span>Prerequisite Status & Dependencies</span>
              </h3>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${readinessInfo.classes}`}
              >
                {readinessInfo.label}
              </span>
            </div>
            <p className="text-xs text-slate-400">{readinessInfo.desc}</p>

            {item.prerequisites && item.prerequisites.length > 0 ? (
              <div className="space-y-2">
                {item.prerequisites.map(p => (
                  <div
                    key={p.prerequisiteSkillId}
                    className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          p.isMet
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {p.isMet ? '✓' : '✗'}
                      </span>
                      <div>
                        <div className="text-slate-200 font-medium">{p.prerequisiteSkillName}</div>
                        <div className="text-xs text-slate-400">
                          Your level: {p.learnerLevel}/5 • Recommended minimum: {p.requiredLevel}/5
                        </div>
                      </div>
                    </div>
                    {onSelectPrerequisite && (
                      <button
                        onClick={() => onSelectPrerequisite(p.prerequisiteSlug)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        View Skill →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-800 text-xs text-slate-400">
                This skill is foundational and has no prerequisite blockers in this career path.
              </div>
            )}
          </div>

          {/* Downstream Unlocked Skills */}
          {item.downstreamImpactCount > 0 && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs uppercase tracking-wider">
                <span>🚀</span>
                <span>Downstream Architecture Impact</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mastering <strong>{item.skillName}</strong> unlocks{' '}
                <strong>{item.downstreamImpactCount}</strong> dependent concepts and advanced
                systems within the {item.categoryName} track.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillGapExplanationModal;

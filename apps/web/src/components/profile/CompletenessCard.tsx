import React from 'react';
import { CheckCircle2, Circle, TrendingUp } from 'lucide-react';
import type { ProfileCompleteness } from '@pathforge/shared';

interface CompletenessCardProps {
  completeness: ProfileCompleteness | null;
}

export const CompletenessCard: React.FC<CompletenessCardProps> = ({ completeness }) => {
  if (!completeness) return null;

  const { score, breakdown, summary } = completeness;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary-400" />
          <h3 className="text-sm font-semibold text-white">Profile Readiness</h3>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-primary-500/20 border border-primary-500/40 text-primary-300 text-xs font-bold font-mono">
          {score}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-primary-500 to-accent-teal h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="text-xs text-slate-400 leading-snug">{summary}</p>

      {/* Checklist items */}
      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          {breakdown.careerGoal ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          ) : (
            <Circle className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          )}
          <span>Career Goal</span>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          {breakdown.experience ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          ) : (
            <Circle className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          )}
          <span>Experience</span>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          {breakdown.skills ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          ) : (
            <Circle className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          )}
          <span>Skills Matrix</span>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          {breakdown.projects ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          ) : (
            <Circle className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          )}
          <span>Projects</span>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          {breakdown.interests ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          ) : (
            <Circle className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          )}
          <span>Interests</span>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          {breakdown.learningPreferences ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          ) : (
            <Circle className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          )}
          <span>Preferences</span>
        </div>
      </div>
    </div>
  );
};

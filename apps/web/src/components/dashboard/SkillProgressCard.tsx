import React from 'react';
import type { DashboardSkillProgressItem } from '@pathforge/shared';

interface SkillProgressCardProps {
  progressItems: DashboardSkillProgressItem[];
}

export const SkillProgressCard: React.FC<SkillProgressCardProps> = ({ progressItems }) => {
  if (!progressItems || progressItems.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Evidence Tracker
        </span>
        <h3 className="text-base font-bold text-white">Recent Skill Improvement</h3>
        <p className="text-xs text-slate-400">
          Take verification quizzes or submit capstone projects to observe authoritative level progression.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Evidence Tracker
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Recent Skill Improvements
          </h3>
        </div>
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Verified Gains
        </span>
      </div>

      <div className="space-y-3">
        {progressItems.slice(0, 3).map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="font-bold text-xs text-white flex items-center gap-2">
                <span>{item.skillName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/40 text-indigo-300 font-medium border border-indigo-700/40">
                  {item.evidenceType === 'ASSESSMENT' ? 'Quiz Verified' : 'Practice'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Confidence: {Math.round(item.confidence * 100)}%
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-300">
                  {item.fromLevel}/5 → <strong className="text-emerald-400 text-sm">{item.toLevel}/5</strong>
                </div>
                <div className="text-[11px] font-bold text-emerald-400">
                  ↑ +{item.delta} {item.delta === 1 ? 'level' : 'levels'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

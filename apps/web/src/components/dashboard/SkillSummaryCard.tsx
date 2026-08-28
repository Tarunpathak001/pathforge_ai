import React, { useState } from 'react';
import type { DashboardSkillSummary } from '@pathforge/shared';

interface SkillSummaryCardProps {
  summary: DashboardSkillSummary;
  onViewAnalysis: () => void;
}

export const SkillSummaryCard: React.FC<SkillSummaryCardProps> = ({
  summary,
  onViewAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<'strong' | 'developing' | 'gaps'>('gaps');

  const strong = summary?.strong || [];
  const developing = summary?.developing || [];
  const criticalGaps = summary?.criticalGaps || [];

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Competency Breakdown
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">Your Skill Profile</h3>
        </div>
        <button
          onClick={onViewAnalysis}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
        >
          Full Analysis →
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('gaps')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'gaps'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Priority Gaps ({criticalGaps.length})
        </button>
        <button
          onClick={() => setActiveTab('developing')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'developing'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Developing ({developing.length})
        </button>
        <button
          onClick={() => setActiveTab('strong')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'strong'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Strong ({strong.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {activeTab === 'gaps' && (
          criticalGaps.length > 0 ? (
            criticalGaps.map(s => (
              <div
                key={s.skillId}
                className="p-3 bg-rose-950/10 border border-rose-900/30 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-rose-200">{s.name}</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">{s.category}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-rose-900/40 text-rose-300 font-bold text-[10px] border border-rose-800/50">
                    Gap: -{s.gap}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Level {s.level} / {s.targetLevel}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              No critical skill gaps identified! You are meeting core requirements.
            </div>
          )
        )}

        {activeTab === 'developing' && (
          developing.length > 0 ? (
            developing.map(s => (
              <div
                key={s.skillId}
                className="p-3 bg-amber-950/10 border border-amber-900/30 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-amber-200">{s.name}</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">{s.category}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 font-bold text-[10px] border border-amber-800/50">
                    In Progress
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Level {s.level} / {s.targetLevel}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              No skills in developing status.
            </div>
          )
        )}

        {activeTab === 'strong' && (
          strong.length > 0 ? (
            strong.map(s => (
              <div
                key={s.skillId}
                className="p-3 bg-emerald-950/10 border border-emerald-900/30 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-emerald-200">{s.name}</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">{s.category}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 font-bold text-[10px] border border-emerald-800/50">
                    Mastered ({s.level}/5)
                  </span>
                  <div className="text-[10px] text-emerald-400/80 mt-0.5">
                    {Math.round((s.confidence || 0.85) * 100)}% confidence
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              Complete assessments to verify your strong skills.
            </div>
          )
        )}
      </div>
    </div>
  );
};

import React from 'react';
import type { DashboardRecommendationItem } from '@pathforge/shared';

interface RecommendationsPreviewProps {
  recommendations: DashboardRecommendationItem[];
  onViewAll: () => void;
  onLaunchResource: (url: string) => void;
}

export const RecommendationsPreview: React.FC<RecommendationsPreviewProps> = ({
  recommendations,
  onViewAll,
  onLaunchResource,
}) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Resource Intelligence
        </span>
        <h3 className="text-base font-bold text-white">Recommended For You</h3>
        <p className="text-xs text-slate-400">
          Recommendations will appear after your career skill gap analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Curated Resources
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">Recommended For You</h3>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
        >
          View All ({recommendations.length}) →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {recommendations.slice(0, 3).map(rec => (
          <div
            key={rec.id}
            className="p-4 bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 hover:border-slate-600 rounded-xl flex flex-col justify-between transition-all space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1 text-[11px]">
                <span className="font-semibold text-indigo-300 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-800/40">
                  {rec.matchScore}% Match
                </span>
                <span className="text-slate-400">{rec.provider}</span>
              </div>
              <h4 className="font-bold text-xs text-white line-clamp-2">{rec.title}</h4>
              <div className="text-[11px] text-slate-400">
                Covers: <span className="text-slate-300 font-medium">{rec.primarySkillName}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{rec.estimatedHours} hrs · {rec.difficulty}</span>
              <button
                onClick={() => onLaunchResource(rec.url)}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
              >
                <span>Launch</span>
                <span>↗</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

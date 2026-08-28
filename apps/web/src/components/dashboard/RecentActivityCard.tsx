import React from 'react';
import type { DashboardActivityItem } from '@pathforge/shared';

interface RecentActivityCardProps {
  activity: DashboardActivityItem[];
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ activity }) => {
  if (!activity || activity.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Timeline
        </span>
        <h3 className="text-base font-bold text-white">Recent Activity</h3>
        <p className="text-xs text-slate-400">
          Your learning accomplishments and quiz completions will appear here.
        </p>
      </div>
    );
  }

  const formatTime = (ts: Date) => {
    const d = new Date(ts);
    const diffHours = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const days = Math.floor(diffHours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ASSESSMENT_COMPLETED':
        return '📝';
      case 'RESOURCE_COMPLETED':
        return '✓';
      case 'SKILL_IMPROVED':
        return '↑';
      case 'FEEDBACK_SUBMITTED':
        return '★';
      case 'PATH_ADAPTED':
      default:
        return '↗';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Verified Stream
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">Recent Activity</h3>
        </div>
      </div>

      <div className="space-y-3">
        {activity.slice(0, 4).map(act => (
          <div
            key={act.id}
            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-800/40 transition-colors"
          >
            <div className="h-7 w-7 rounded-lg bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-xs text-indigo-300 font-bold shrink-0 mt-0.5">
              {getIcon(act.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{act.title}</div>
              <div className="text-[11px] text-slate-400 truncate">{act.description}</div>
            </div>
            <div className="text-[10px] text-slate-500 shrink-0 mt-0.5">
              {formatTime(act.timestamp)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

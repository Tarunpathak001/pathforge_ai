import React, { useState } from 'react';
import type { AdaptiveChangeSummary } from '@pathforge/shared';

interface AdaptiveChangeCardProps {
  changeSummary: AdaptiveChangeSummary | null;
  onViewChanges: () => void;
}

export const AdaptiveChangeCard: React.FC<AdaptiveChangeCardProps> = ({
  changeSummary,
  onViewChanges,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (!changeSummary || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/40 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-lg shrink-0">
          ⚡
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">Your Learning Path Adapted</h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
              Closed-Loop Update
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {changeSummary.milestonesUnlocked.length > 0
              ? `New milestone "${changeSummary.milestonesUnlocked[0]}" unlocked based on your verified performance.`
              : 'Your skill estimates and recommendations updated to reflect recent evidence.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          onClick={onViewChanges}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-all"
        >
          View Roadmap
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

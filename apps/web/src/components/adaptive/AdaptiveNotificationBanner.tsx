import React from 'react';

export interface AdaptiveNotificationBannerProps {
  changeSummary: {
    skillsUpdated?: Array<{ skillName: string; fromLevel: number; toLevel: number; confidence: number }>;
    gapsResolved?: string[];
    gapsReduced?: string[];
    milestonesUnlocked?: string[];
    careerAlignment?: { before: number; after: number };
    explanationNarrative?: string[];
  };
  onDismiss: () => void;
}

export const AdaptiveNotificationBanner: React.FC<AdaptiveNotificationBannerProps> = ({
  changeSummary,
  onDismiss,
}) => {
  const {
    careerAlignment,
    gapsResolved = [],
    milestonesUnlocked = [],
    explanationNarrative = [],
  } = changeSummary;

  const alignmentDiff =
    careerAlignment && careerAlignment.after > careerAlignment.before
      ? careerAlignment.after - careerAlignment.before
      : 0;

  return (
    <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-slate-900 border border-indigo-500/40 rounded-2xl p-5 mb-8 shadow-xl shadow-indigo-950/40 relative overflow-hidden animate-slideDown">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-bold text-white text-base sm:text-lg">
                Roadmap Adapted to Your Performance!
              </h3>
              {alignmentDiff > 0 && (
                <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  +{alignmentDiff}% Career Alignment
                </span>
              )}
            </div>

            <div className="mt-2 space-y-1 text-xs sm:text-sm text-slate-300">
              {explanationNarrative.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Badges for gaps resolved and milestones unlocked */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {gapsResolved.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-emerald-900/40 border border-emerald-600/30 text-emerald-300 text-xs px-2.5 py-1 rounded-lg font-medium"
                >
                  ✓ {skill} Mastered
                </span>
              ))}
              {milestonesUnlocked.map((milestone, idx) => (
                <span
                  key={idx}
                  className="bg-indigo-900/40 border border-indigo-600/30 text-indigo-300 text-xs px-2.5 py-1 rounded-lg font-medium"
                >
                  🔓 {milestone} Unlocked
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/80 transition text-sm"
          title="Dismiss banner"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AdaptiveNotificationBanner;

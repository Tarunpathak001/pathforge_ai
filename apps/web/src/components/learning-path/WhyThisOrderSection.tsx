import React, { useState } from 'react';
import type { LearningMilestoneItem } from '@pathforge/shared';

interface WhyThisOrderSectionProps {
  milestones: LearningMilestoneItem[];
  careerName: string;
}

export const WhyThisOrderSection: React.FC<WhyThisOrderSectionProps> = ({
  milestones,
  careerName,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mt-10 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-blue-900/30 p-6 md:p-8 text-left shadow-xl">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-lg">
            🧠
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white">
              Why This Order? (Prerequisite Intelligence)
            </h3>
            <p className="text-xs md:text-sm text-slate-400">
              Deterministic sequencing logic based on skill dependencies and your starting competencies for {careerName}
            </p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-white transition-transform duration-200">
          <span className={`inline-block transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
      </div>

      {isOpen && (
        <div className="mt-6 space-y-4 pt-4 border-t border-slate-800 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300">
              <span className="font-semibold text-blue-400 block mb-1">📐 Strict Prerequisite Satisfaction:</span>
              Upstream foundational topics (such as REST API fundamentals and core protocols) are scheduled before dependent frameworks and architecture layers.
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300">
              <span className="font-semibold text-emerald-400 block mb-1">🎯 Mastered Competencies Skipped:</span>
              Skills where you already meet or exceed career requirements are eliminated from your roadmap to maximize efficiency.
            </div>
          </div>

          <div className="space-y-3">
            {milestones.map(m => (
              <div
                key={m.order}
                className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/70 hover:border-slate-600 transition-colors flex items-start gap-4"
              >
                <span className="w-7 h-7 rounded-lg bg-blue-900/60 border border-blue-700/50 text-blue-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {m.order}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{m.title}</span>
                    <span className="text-xs text-slate-400">• {m.estimatedHours} hrs</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {m.whyThisOrder}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Sparkles, HelpCircle, Route, Zap, Clock, ShieldCheck } from 'lucide-react';

interface CopilotStarterChipsProps {
  onSelectPrompt: (prompt: string) => void;
}

const STARTER_PROMPTS = [
  {
    icon: Zap,
    label: 'What should I learn today?',
    prompt: 'What should I learn today and why?',
    color: 'text-amber-400 border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/40',
  },
  {
    icon: HelpCircle,
    label: 'Why is System Design a gap?',
    prompt: 'Why is System Design still a gap for me?',
    color: 'text-rose-400 border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40',
  },
  {
    icon: Clock,
    label: 'I only have 5 hours this week',
    prompt: 'I only have 5 hours this week. What should I focus on?',
    color: 'text-blue-400 border-blue-500/30 bg-blue-950/20 hover:bg-blue-950/40',
  },
  {
    icon: Route,
    label: 'Why did my roadmap change?',
    prompt: 'Why did my roadmap change?',
    color: 'text-purple-400 border-purple-500/30 bg-purple-950/20 hover:bg-purple-950/40',
  },
  {
    icon: Sparkles,
    label: 'Why this course recommendation?',
    prompt: 'Why did you recommend Spring Boot Fundamentals?',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40',
  },
  {
    icon: ShieldCheck,
    label: 'How close to Backend Engineer?',
    prompt: 'How much progress have I made toward Backend Engineer?',
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-950/40',
  },
];

export const CopilotStarterChips: React.FC<CopilotStarterChipsProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto py-8 text-center space-y-6">
      <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-600/20">
        <Sparkles className="w-6 h-6 animate-pulse" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-xl font-bold text-white tracking-tight">PathForge Career Copilot</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Grounded in your real skill states, career alignment, active roadmap milestones, and verified assessments.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-2">
        {STARTER_PROMPTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-medium transition-all group ${item.color}`}
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              <span className="text-slate-200 group-hover:text-white line-clamp-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

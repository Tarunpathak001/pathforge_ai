import React from 'react';
import { Sparkles, ArrowRight, Compass, Cpu, Layers } from 'lucide-react';

interface StepWelcomeProps {
  onStart: () => void;
}

export const StepWelcome: React.FC<StepWelcomeProps> = ({ onStart }) => {
  return (
    <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in py-6">
      {/* Brand Icon & Pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-semibold tracking-wide uppercase">
        <Sparkles className="w-3.5 h-3.5 text-primary-400" />
        Intelligent Career Intelligence
      </div>

      {/* Main Title */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Build a career path that <br />
          <span className="bg-gradient-to-r from-primary-400 via-accent-cyan to-accent-teal bg-clip-text text-transparent">
            actually fits you.
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
          Tell PathForge what you know, what you've built, and where you want to go. Our AI analyzes
          your unique background to build your structured learner profile.
        </p>
      </div>

      {/* Feature Value Props Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left my-8">
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition">
          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white text-sm">Targeted Direction</h3>
          <p className="text-xs text-slate-400">
            Express your career ambition naturally or pick from curated industry tracks.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition">
          <div className="w-10 h-10 rounded-lg bg-accent-teal/20 flex items-center justify-center text-accent-teal">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white text-sm">AI Skill Intelligence</h3>
          <p className="text-xs text-slate-400">
            Smart NLP extracts and normalizes your skills, experience, and practical evidence.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition">
          <div className="w-10 h-10 rounded-lg bg-accent-cyan/20 flex items-center justify-center text-accent-cyan">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white text-sm">Transparent Control</h3>
          <p className="text-xs text-slate-400">
            Review, adjust, and refine extracted data before it shapes your roadmap.
          </p>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          onClick={onStart}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-semibold shadow-lg glow-primary transition duration-200 text-base group cursor-pointer"
        >
          <span>Start My Profile</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-xs text-slate-500 mt-3">Takes approximately 2–4 minutes to complete</p>
      </div>
    </div>
  );
};

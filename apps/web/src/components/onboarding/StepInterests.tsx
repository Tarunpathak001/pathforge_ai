import React, { useState } from 'react';
import { Compass, Plus, X } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

const PRESET_INTERESTS: Array<{
  topic: string;
  category: 'TECHNICAL' | 'CAREER' | 'PROBLEM_TYPE';
}> = [
  { topic: 'Distributed Systems', category: 'TECHNICAL' },
  { topic: 'Cloud Computing', category: 'TECHNICAL' },
  { topic: 'AI & Machine Learning', category: 'TECHNICAL' },
  { topic: 'Backend Systems', category: 'TECHNICAL' },
  { topic: 'Web Development', category: 'TECHNICAL' },
  { topic: 'Database Architecture', category: 'TECHNICAL' },
  { topic: 'Microservices Architecture', category: 'TECHNICAL' },
  { topic: 'DevOps & CI/CD', category: 'TECHNICAL' },
  { topic: 'Cybersecurity', category: 'TECHNICAL' },
  { topic: 'High-Concurrency Systems', category: 'PROBLEM_TYPE' },
  { topic: 'API Design & Protocols', category: 'TECHNICAL' },
  { topic: 'Open Source Contribution', category: 'CAREER' },
];

export const StepInterests: React.FC = () => {
  const { onboardingState, updateOnboardingData } = useProfile();
  const { interests } = onboardingState;

  const [customInterest, setCustomInterest] = useState('');

  const toggleInterest = (
    topic: string,
    category: 'TECHNICAL' | 'CAREER' | 'PROBLEM_TYPE' = 'TECHNICAL'
  ) => {
    const exists = interests.some(i => i.topic.toLowerCase() === topic.toLowerCase());
    if (exists) {
      updateOnboardingData({
        interests: interests.filter(i => i.topic.toLowerCase() !== topic.toLowerCase()),
      });
    } else {
      updateOnboardingData({
        interests: [...interests, { topic, category }],
      });
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInterest.trim()) return;

    const trimmed = customInterest.trim();
    if (!interests.some(i => i.topic.toLowerCase() === trimmed.toLowerCase())) {
      updateOnboardingData({
        interests: [...interests, { topic: trimmed, category: 'TECHNICAL' }],
      });
    }
    setCustomInterest('');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-primary-400 text-xs font-semibold uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          Step 5: Technical Interests & Domains
        </div>
        <h2 className="text-2xl font-bold text-white">What technical topics excite you most?</h2>
        <p className="text-sm text-slate-400">
          We use your interest vectors to enrich your learning recommendations with problem types
          you enjoy.
        </p>
      </div>

      {/* Preset Topics Grid */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
          Select Key Topics of Interest
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PRESET_INTERESTS.map(item => {
            const isSelected = interests.some(
              i => i.topic.toLowerCase() === item.topic.toLowerCase()
            );
            return (
              <button
                key={item.topic}
                type="button"
                onClick={() => toggleInterest(item.topic, item.category)}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-primary-500/20 border-primary-500 text-primary-300 font-medium'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span className="text-xs">{item.topic}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-primary-400' : 'bg-slate-700'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Interest Input */}
      <form onSubmit={handleAddCustom} className="space-y-2 pt-2">
        <label className="block text-xs font-medium text-slate-300">
          Add Custom Technical or Domain Interest
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customInterest}
            onChange={e => setCustomInterest(e.target.value)}
            placeholder="e.g. Distributed Consensus (Raft), Event Sourcing..."
            className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!customInterest.trim()}
            className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </form>

      {/* Active Selected Tags Display */}
      <div className="space-y-2 pt-2">
        <label className="text-xs text-slate-400">
          Active Interests Selected ({interests.length})
        </label>
        <div className="flex flex-wrap gap-2">
          {interests.map(i => (
            <span
              key={i.topic}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/15 border border-primary-500/40 text-primary-300 text-xs"
            >
              {i.topic}
              <button
                type="button"
                onClick={() => toggleInterest(i.topic)}
                className="hover:text-rose-400 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

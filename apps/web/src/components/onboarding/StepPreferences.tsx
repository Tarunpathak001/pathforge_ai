import React from 'react';
import { Sliders, Clock, Flame, BookOpen, Layers } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

const FORMAT_OPTIONS = [
  {
    id: 'MIXED',
    label: 'Mixed / Balanced',
    desc: 'Combines video lectures, documentation, and code exercises',
  },
  {
    id: 'PROJECTS',
    label: 'Hands-On Projects',
    desc: 'Prioritizes building real applications and writing code',
  },
  {
    id: 'DOCUMENTATION',
    label: 'Docs & In-Depth Reading',
    desc: 'Official documentation, technical specs, and whitepapers',
  },
  { id: 'VIDEO', label: 'Video & Courses', desc: 'Visual structured walkthroughs and screencasts' },
];

const AVAILABILITY_OPTIONS = [
  '< 5 hours/week',
  '5–10 hours/week',
  '10–15 hours/week',
  '15+ hours/week',
];

export const StepPreferences: React.FC = () => {
  const { onboardingState, updateOnboardingData } = useProfile();
  const { preference } = onboardingState;

  const handleChange = (field: string, value: any) => {
    updateOnboardingData({
      preference: {
        ...preference,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-primary-400 text-xs font-semibold uppercase tracking-wider">
          <Sliders className="w-4 h-4" />
          Step 6: Learning Style & Availability
        </div>
        <h2 className="text-2xl font-bold text-white">How do you prefer to learn?</h2>
        <p className="text-sm text-slate-400">
          Tailor your future learning roadmap to your schedule and preferred learning formats.
        </p>
      </div>

      {/* Weekly Availability */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <Clock className="w-4 h-4 text-accent-cyan" />
          Weekly Study Time Availability <span className="text-rose-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {AVAILABILITY_OPTIONS.map(opt => {
            const isSelected =
              preference.weeklyAvailabilityHours === opt ||
              (opt.includes('10-15') && preference.weeklyAvailabilityHours === '10-15') ||
              (opt.includes('10') && preference.weeklyAvailabilityHours.includes('10'));

            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleChange('weeklyAvailabilityHours', opt)}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-primary-500/20 border-primary-500 text-primary-300 font-semibold shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span className="text-xs font-medium">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferred Learning Format */}
      <div className="space-y-3 pt-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <BookOpen className="w-4 h-4 text-accent-teal" />
          Preferred Content Delivery
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FORMAT_OPTIONS.map(fmt => (
            <div
              key={fmt.id}
              onClick={() => handleChange('learningFormat', fmt.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition space-y-1 ${
                preference.learningFormat === fmt.id
                  ? 'bg-primary-500/15 border-primary-500'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-white">{fmt.label}</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    preference.learningFormat === fmt.id ? 'bg-primary-400' : 'bg-slate-700'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{fmt.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty Preference & Project/Theory Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Difficulty */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Flame className="w-3.5 h-3.5 text-accent-amber" />
            Pace & Challenge
          </label>
          <select
            value={preference.difficultyPreference}
            onChange={e => handleChange('difficultyPreference', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="GRADUAL">Gradual (Solid Foundation & Practice)</option>
            <option value="CHALLENGING">Challenging (Fast-Paced Core Concepts)</option>
            <option value="INTENSIVE">Intensive (Deep-Dive Immersion)</option>
          </select>
        </div>

        {/* Project Preference */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Layers className="w-3.5 h-3.5 text-accent-cyan" />
            Project vs Theory Balance
          </label>
          <select
            value={preference.projectPreference}
            onChange={e => handleChange('projectPreference', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="PROJECTS">Heavy Project Focus</option>
            <option value="BALANCED">Balanced Theory & Coding</option>
            <option value="THEORY">Conceptual & Architectural Depth</option>
          </select>
        </div>
      </div>
    </div>
  );
};

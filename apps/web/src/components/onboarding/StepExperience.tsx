import React from 'react';
import { GraduationCap } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import type { TechnicalLevel } from '@pathforge/shared';

const TECH_LEVELS: Array<{
  id: TechnicalLevel;
  label: string;
  desc: string;
}> = [
  {
    id: 'BEGINNER',
    label: 'Beginner',
    desc: 'Learning programming fundamentals, syntax, and foundational CS.',
  },
  {
    id: 'INTERMEDIATE',
    label: 'Intermediate',
    desc: 'Built several apps or projects, comfortable with core frameworks.',
  },
  {
    id: 'ADVANCED',
    label: 'Advanced',
    desc: 'Experienced in architecture, optimization, and production systems.',
  },
  {
    id: 'PROFESSIONAL',
    label: 'Professional',
    desc: 'Extensive industry track record leading engineering deliverables.',
  },
];

export const StepExperience: React.FC = () => {
  const { onboardingState, updateOnboardingData } = useProfile();
  const { experience } = onboardingState;

  const handleChange = (field: string, value: any) => {
    updateOnboardingData({
      experience: {
        ...experience,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-primary-400 text-xs font-semibold uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          Step 2: Experience & Background
        </div>
        <h2 className="text-2xl font-bold text-white">Tell us about your background</h2>
        <p className="text-sm text-slate-400">
          This helps calibrate your baseline so we don't repeat concepts you've already mastered.
        </p>
      </div>

      {/* Technical Experience Tier Cards */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-200">
          Overall Technical Experience Tier <span className="text-rose-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TECH_LEVELS.map(lvl => (
            <div
              key={lvl.id}
              onClick={() => handleChange('technicalLevel', lvl.id)}
              className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                experience.technicalLevel === lvl.id
                  ? 'bg-primary-500/15 border-primary-500 glow-primary'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-white">{lvl.label}</span>
                <span
                  className={`w-3 h-3 rounded-full border ${
                    experience.technicalLevel === lvl.id
                      ? 'bg-primary-500 border-primary-400'
                      : 'border-slate-600'
                  }`}
                />
              </div>
              <p className="text-xs text-slate-400 leading-snug">{lvl.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Education & Experience Years Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Education Level */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">Highest Education</label>
          <select
            value={experience.educationLevel}
            onChange={e => handleChange('educationLevel', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Self-Taught / Bootcamp">Self-Taught / Bootcamp</option>
            <option value="Associate Degree">Associate Degree</option>
            <option value="Bachelor Degree">Bachelor Degree</option>
            <option value="Master Degree">Master Degree</option>
            <option value="PhD / Doctorate">PhD / Doctorate</option>
            <option value="High School">High School</option>
          </select>
        </div>

        {/* Years Experience */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Total Software / Coding Experience (Years)
          </label>
          <input
            type="number"
            min="0"
            max="40"
            step="0.5"
            value={experience.experienceYears}
            onChange={e => handleChange('experienceYears', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Field of Study */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-300">Field of Study / Major</label>
        <input
          type="text"
          value={experience.fieldOfStudy}
          onChange={e => handleChange('fieldOfStudy', e.target.value)}
          placeholder="e.g. Computer Science, Information Technology, Electrical Engineering..."
          className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Professional Summary / Context */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-300">
          Professional or Academic Context <span className="text-slate-500">(Optional)</span>
        </label>
        <textarea
          rows={2}
          value={experience.professionalSummary}
          onChange={e => handleChange('professionalSummary', e.target.value)}
          placeholder="e.g. Final-year CS student with 1 internship in web development and active open-source contributions."
          className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>
  );
};

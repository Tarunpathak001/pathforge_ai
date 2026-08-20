import React from 'react';
import { Target, Clock, Building2 } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

const POPULAR_ROLES = [
  'Backend Engineer',
  'Frontend Engineer',
  'Full Stack Engineer',
  'AI / Machine Learning Engineer',
  'Data Engineer',
  'DevOps / Cloud Engineer',
  'Mobile Developer',
  'Cybersecurity Specialist',
];

const TIMELINE_OPTIONS = ['3–6 months', '6–12 months', '1–2 years', 'Flexible / Continuous'];

export const StepCareerGoal: React.FC = () => {
  const { onboardingState, updateOnboardingData } = useProfile();
  const { careerGoal } = onboardingState;

  const handleChange = (field: string, value: string) => {
    updateOnboardingData({
      careerGoal: {
        ...careerGoal,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-primary-400 text-xs font-semibold uppercase tracking-wider">
          <Target className="w-4 h-4" />
          Step 1: Define Your Target
        </div>
        <h2 className="text-2xl font-bold text-white">What career role do you want to pursue?</h2>
        <p className="text-sm text-slate-400">
          Describe your dream role in plain English or select from popular engineering
          specializations.
        </p>
      </div>

      {/* Target Role Input */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-200">
          Target Career Role <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={careerGoal.targetRole}
          onChange={e => handleChange('targetRole', e.target.value)}
          placeholder="e.g. Backend Engineer, Senior Distributed Systems Engineer..."
          className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
        />

        {/* Quick Pick Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {POPULAR_ROLES.map(role => (
            <button
              key={role}
              type="button"
              onClick={() => handleChange('targetRole', role)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                careerGoal.targetRole.toLowerCase() === role.toLowerCase()
                  ? 'bg-primary-600/30 border-primary-500 text-primary-300 font-medium'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-500 hover:text-white'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Natural Language Aspiration / Context */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-200">
          Career Aspirations & Context <span className="text-xs text-slate-400">(Optional)</span>
        </label>
        <textarea
          rows={3}
          value={careerGoal.careerGoalDescription}
          onChange={e => handleChange('careerGoalDescription', e.target.value)}
          placeholder="e.g. I want to transition from traditional software development to building high-scale cloud distributed backend systems at tech scaleups."
          className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
        />
      </div>

      {/* Structured Target Timeline & Industry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Timeline */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <Clock className="w-3.5 h-3.5 text-accent-cyan" />
            Target Timeline
          </label>
          <select
            value={careerGoal.targetTimeline}
            onChange={e => handleChange('targetTimeline', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {TIMELINE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Company Type */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-accent-teal" />
            Target Company Environment
          </label>
          <select
            value={careerGoal.targetCompanyType}
            onChange={e => handleChange('targetCompanyType', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Product Tech Companies / Scaleups">Product Scaleups & Tech</option>
            <option value="Enterprise / Large Tech (FAANG+)">Enterprise / Big Tech</option>
            <option value="Early-Stage Startups">Early-Stage Startups</option>
            <option value="Consulting / IT Services">Consulting & Global IT</option>
            <option value="Remote / Freelance">Global Remote / Freelance</option>
          </select>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Code2, Sparkles, Plus, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { normalizeSkill } from '@pathforge/shared';
import apiClient from '../../services/api-client';

const COMMON_SKILL_SUGGESTIONS = [
  'Java',
  'Python',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'SQL',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'Git',
  'Spring Boot',
  'FastAPI',
  'AWS',
  'Redis',
];

const LEVEL_LABELS: Record<number, { title: string; color: string }> = {
  1: { title: '1 — Beginner', color: 'text-slate-400 bg-slate-800' },
  2: { title: '2 — Basic', color: 'text-blue-400 bg-blue-950/40' },
  3: { title: '3 — Intermediate', color: 'text-indigo-400 bg-indigo-950/40' },
  4: { title: '4 — Advanced', color: 'text-teal-400 bg-teal-950/40' },
  5: { title: '5 — Expert', color: 'text-emerald-400 bg-emerald-950/40' },
};

export const StepSkills: React.FC = () => {
  const { onboardingState, updateOnboardingData } = useProfile();
  const { skills } = onboardingState;

  const [naturalTextInput, setNaturalTextInput] = useState('');
  const [manualSkillName, setManualSkillName] = useState('');
  const [manualLevel, setManualLevel] = useState<number>(3);
  const [isExtracting, setIsExtracting] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // AI Extraction trigger
  const handleAIExtract = async () => {
    if (!naturalTextInput.trim()) {
      setErrorMessage('Please enter some text before extracting.');
      return;
    }

    setIsExtracting(true);
    setErrorMessage(null);
    setAiSuccessMessage(null);

    try {
      const response = await apiClient.extractProfileIntelligence({
        text: naturalTextInput,
        context: 'skills_step',
      });

      if (response.skills && response.skills.length > 0) {
        // Merge extracted skills with existing
        const existingMap = new Map(skills.map(s => [s.name.toLowerCase(), s]));

        for (const ext of response.skills) {
          const { normalizedName } = normalizeSkill(ext.name);
          const key = normalizedName.toLowerCase();

          if (existingMap.has(key)) {
            const cur = existingMap.get(key)!;
            existingMap.set(key, {
              ...cur,
              selfReportedLevel: Math.max(cur.selfReportedLevel, ext.level),
              evidence: ext.evidence || cur.evidence,
            });
          } else {
            existingMap.set(key, {
              name: normalizedName,
              selfReportedLevel: ext.level || 3,
              evidence: ext.evidence,
              yearsExperience: ext.yearsExperience,
            });
          }
        }

        const mergedSkills = Array.from(existingMap.values());
        updateOnboardingData({ skills: mergedSkills });
        setAiSuccessMessage(
          `✨ Extracted ${response.skills.length} skills! You can review or adjust them below.`
        );
      } else {
        setErrorMessage(
          'No explicit skills recognized in your text. You can add them using the input below.'
        );
      }
    } catch (err: any) {
      setErrorMessage(`AI extraction note: ${err.message}. You can manually add skills below.`);
    } finally {
      setIsExtracting(false);
    }
  };

  // Add skill manually
  const handleAddManualSkill = (nameToAdd?: string, levelToAdd = 3) => {
    const raw = nameToAdd || manualSkillName;
    if (!raw.trim()) return;

    const { normalizedName } = normalizeSkill(raw);
    const key = normalizedName.toLowerCase();

    const existingIndex = skills.findIndex(s => s.name.toLowerCase() === key);
    if (existingIndex >= 0) {
      // Update level
      const updated = [...skills];
      updated[existingIndex] = { ...updated[existingIndex]!, selfReportedLevel: levelToAdd };
      updateOnboardingData({ skills: updated });
    } else {
      updateOnboardingData({
        skills: [...skills, { name: normalizedName, selfReportedLevel: levelToAdd }],
      });
    }

    setManualSkillName('');
  };

  // Remove skill
  const handleRemoveSkill = (skillName: string) => {
    updateOnboardingData({
      skills: skills.filter(s => s.name.toLowerCase() !== skillName.toLowerCase()),
    });
  };

  // Update level of an existing skill
  const handleUpdateLevel = (skillName: string, newLevel: number) => {
    const updated = skills.map(s =>
      s.name.toLowerCase() === skillName.toLowerCase() ? { ...s, selfReportedLevel: newLevel } : s
    );
    updateOnboardingData({ skills: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-primary-400 text-xs font-semibold uppercase tracking-wider">
          <Code2 className="w-4 h-4" />
          Step 3: Current Technical Skills
        </div>
        <h2 className="text-2xl font-bold text-white">What skills and tools do you know?</h2>
        <p className="text-sm text-slate-400">
          Describe your tech stack in natural language or add skills one by one.
        </p>
      </div>

      {/* AI Smart Extract Box */}
      <div className="glass-panel p-4 rounded-xl border border-primary-500/30 space-y-3 bg-slate-900/70">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold text-primary-300">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            AI Smart Extractor
          </span>
          <span className="text-[11px] text-slate-400">Natural language parsing</span>
        </div>

        <textarea
          rows={3}
          value={naturalTextInput}
          onChange={e => setNaturalTextInput(e.target.value)}
          placeholder="e.g. I've worked with React and Node for about a year, built two full-stack apps and recently started learning Docker."
          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleAIExtract}
            disabled={isExtracting || !naturalTextInput.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow transition cursor-pointer"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Analyzing text...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Extract Skills with AI
              </>
            )}
          </button>

          {aiSuccessMessage && (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {aiSuccessMessage}
            </span>
          )}
        </div>

        {errorMessage && (
          <p className="text-xs text-rose-400 flex items-center gap-1.5 pt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errorMessage}
          </p>
        )}
      </div>

      {/* Manual Skill Input & Quick Suggestions */}
      <div className="space-y-3">
        <label className="block text-xs font-medium text-slate-300">
          Add or Search Specific Skill
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualSkillName}
            onChange={e => setManualSkillName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddManualSkill(manualSkillName, manualLevel);
              }
            }}
            placeholder="e.g. PostgreSQL, Redis, Kubernetes..."
            className="flex-1 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          <select
            value={manualLevel}
            onChange={e => setManualLevel(parseInt(e.target.value, 10))}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value={1}>1 — Beginner</option>
            <option value={2}>2 — Basic</option>
            <option value={3}>3 — Intermediate</option>
            <option value={4}>4 — Advanced</option>
            <option value={5}>5 — Expert</option>
          </select>

          <button
            type="button"
            onClick={() => handleAddManualSkill(manualSkillName, manualLevel)}
            disabled={!manualSkillName.trim()}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {COMMON_SKILL_SUGGESTIONS.map(sugg => {
            const isSelected = skills.some(s => s.name.toLowerCase() === sugg.toLowerCase());
            return (
              <button
                key={sugg}
                type="button"
                onClick={() => handleAddManualSkill(sugg, 3)}
                className={`text-xs px-2.5 py-1 rounded-md border transition ${
                  isSelected
                    ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
                }`}
              >
                + {sugg}
              </button>
            );
          })}
        </div>
      </div>

      {/* Extracted / Added Skills List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-200">
            Selected Skills ({skills.length})
          </label>
          <span className="text-xs text-slate-400">Click level pills to adjust</span>
        </div>

        {skills.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 text-sm">
            No skills added yet. Use the smart AI box or manual input above to add your skills.
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {skills.map(skill => (
              <div
                key={skill.name}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-white">{skill.name}</span>
                  {skill.evidence && (
                    <span className="text-[11px] text-slate-400 italic line-clamp-1">
                      "{skill.evidence}"
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* 1-5 level toggles */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
                    {[1, 2, 3, 4, 5].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleUpdateLevel(skill.name, lvl)}
                        className={`w-6 h-6 text-xs font-semibold rounded flex items-center justify-center transition ${
                          skill.selfReportedLevel === lvl
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={LEVEL_LABELS[lvl]?.title}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill.name)}
                    className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition ml-1"
                    title="Remove skill"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

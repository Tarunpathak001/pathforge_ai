import React from 'react';
import {
  CheckCircle2,
  Sparkles,
  Target,
  GraduationCap,
  Code2,
  FolderGit2,
  Compass,
  Clock,
  Edit3,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { calculateProfileCompleteness } from '@pathforge/shared';

interface StepReviewProps {
  onJumpToStep: (stepIndex: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}

export const StepReview: React.FC<StepReviewProps> = ({
  onJumpToStep,
  onSubmit,
  isSubmitting,
  submitError,
}) => {
  const { onboardingState } = useProfile();
  const { careerGoal, experience, skills, projects, interests, preference } = onboardingState;

  // Calculate live preview completeness
  const completeness = calculateProfileCompleteness({
    targetRole: careerGoal.targetRole,
    educationLevel: experience.educationLevel,
    technicalLevel: experience.technicalLevel,
    skills: skills as any,
    projects: projects as any,
    interests: interests as any,
    preference: preference as any,
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 text-primary-400 text-xs font-semibold uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Step 7: Profile Review & Confirmation
        </div>
        <h2 className="text-2xl font-bold text-white">Review Your Profile Intelligence</h2>
        <p className="text-sm text-slate-400">
          PathForge synthesized your inputs into this structured learner profile. You can edit any
          section before finalizing.
        </p>
      </div>

      {/* Profile Completeness Score Card */}
      <div className="glass-panel-elevated p-5 rounded-2xl border border-primary-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-300">
              Profile Readiness
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs">
              {completeness.score}%
            </span>
          </div>
          <p className="text-xs text-slate-300">{completeness.summary}</p>
        </div>

        {/* Breakdown Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
          <span
            className={`px-2.5 py-1 rounded-md border ${completeness.breakdown.careerGoal ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            Goal {completeness.breakdown.careerGoal ? '✓' : '○'}
          </span>
          <span
            className={`px-2.5 py-1 rounded-md border ${completeness.breakdown.experience ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            Experience {completeness.breakdown.experience ? '✓' : '○'}
          </span>
          <span
            className={`px-2.5 py-1 rounded-md border ${completeness.breakdown.skills ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            Skills ({skills.length}) {completeness.breakdown.skills ? '✓' : '○'}
          </span>
          <span
            className={`px-2.5 py-1 rounded-md border ${completeness.breakdown.projects ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            Projects ({projects.length}) {completeness.breakdown.projects ? '✓' : '○'}
          </span>
          <span
            className={`px-2.5 py-1 rounded-md border ${completeness.breakdown.interests ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            Interests {completeness.breakdown.interests ? '✓' : '○'}
          </span>
        </div>
      </div>

      {/* Review Section Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Target Career */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2 relative group">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-primary-300">
              <Target className="w-3.5 h-3.5" />
              Target Career
            </span>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="text-xs text-slate-400 hover:text-primary-300 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="text-base font-bold text-white">
            {careerGoal.targetRole || <span className="text-rose-400">Not specified</span>}
          </div>
          {careerGoal.careerGoalDescription && (
            <p className="text-xs text-slate-400 line-clamp-2">
              {careerGoal.careerGoalDescription}
            </p>
          )}
          <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1 border-t border-slate-800/60">
            <span>
              Timeline: <strong className="text-slate-300">{careerGoal.targetTimeline}</strong>
            </span>
          </div>
        </div>

        {/* 2. Experience & Background */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2 relative group">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-accent-cyan">
              <GraduationCap className="w-3.5 h-3.5" />
              Experience Level
            </span>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className="text-xs text-slate-400 hover:text-accent-cyan flex items-center gap-1 opacity-80 group-hover:opacity-100 transition"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <span>{experience.technicalLevel}</span>
            <span className="text-xs font-normal text-slate-400">
              ({experience.experienceYears} {experience.experienceYears === 1 ? 'year' : 'years'}{' '}
              coding)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {experience.educationLevel}{' '}
            {experience.fieldOfStudy ? `in ${experience.fieldOfStudy}` : ''}
          </p>
        </div>
      </div>

      {/* 3. Skills Matrix Breakdown */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3 relative group">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-primary-300">
            <Code2 className="w-3.5 h-3.5" />
            Extracted & Declared Skills ({skills.length})
          </span>
          <button
            type="button"
            onClick={() => onJumpToStep(3)}
            className="text-xs text-slate-400 hover:text-primary-300 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition"
          >
            <Edit3 className="w-3 h-3" /> Edit Skills
          </button>
        </div>

        {skills.length === 0 ? (
          <p className="text-xs text-rose-400">No skills added yet. Please add at least 1 skill.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {skills.map(skill => (
              <div
                key={skill.name}
                className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">{skill.name}</span>
                  {skill.evidence && (
                    <span className="text-[10px] text-slate-500 italic line-clamp-1">
                      {skill.evidence}
                    </span>
                  )}
                </div>
                {/* Visual Proficiency Bar */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(lvl => (
                    <div
                      key={lvl}
                      className={`w-2 h-3 rounded-sm ${
                        lvl <= skill.selfReportedLevel ? 'bg-primary-500' : 'bg-slate-800'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-slate-400 ml-1 font-mono">
                    L{skill.selfReportedLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Projects & Learning */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2 relative group">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-accent-teal">
            <FolderGit2 className="w-3.5 h-3.5" />
            Projects ({projects.length})
          </span>
          <button
            type="button"
            onClick={() => onJumpToStep(4)}
            className="text-xs text-slate-400 hover:text-accent-teal flex items-center gap-1 opacity-80 group-hover:opacity-100 transition"
          >
            <Edit3 className="w-3 h-3" /> Edit Projects
          </button>
        </div>

        {projects.length === 0 ? (
          <p className="text-xs text-slate-500">No projects specified (optional).</p>
        ) : (
          <div className="space-y-1.5">
            {projects.map((p, i) => (
              <div key={i} className="text-xs text-slate-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
                <strong className="text-white">{p.name}</strong> — {p.description}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Interests & Availability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Interests */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-accent-cyan">
              <Compass className="w-3.5 h-3.5" />
              Technical Interests
            </span>
            <button
              type="button"
              onClick={() => onJumpToStep(5)}
              className="text-xs text-slate-400 hover:text-accent-cyan flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {interests.map(i => (
              <span
                key={i.topic}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
              >
                {i.topic}
              </span>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-accent-amber">
              <Clock className="w-3.5 h-3.5" />
              Study Availability
            </span>
            <button
              type="button"
              onClick={() => onJumpToStep(6)}
              className="text-xs text-slate-400 hover:text-accent-amber flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </div>
          <div className="text-xs text-slate-300">
            <strong>{preference.weeklyAvailabilityHours}</strong> ({preference.learningFormat}{' '}
            format)
          </div>
        </div>
      </div>

      {/* Error alert if submission failed */}
      {submitError && (
        <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Final Submission CTA */}
      <div className="pt-4 text-center">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !careerGoal.targetRole.trim()}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-teal hover:from-primary-500 hover:to-accent-teal disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg glow-primary transition duration-200 text-sm cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Profile to Database...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate & Save My Profile
            </>
          )}
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { StepWelcome } from './StepWelcome';
import { StepCareerGoal } from './StepCareerGoal';
import { StepExperience } from './StepExperience';
import { StepSkills } from './StepSkills';
import { StepProjectsLearning } from './StepProjectsLearning';
import { StepInterests } from './StepInterests';
import { StepPreferences } from './StepPreferences';
import { StepReview } from './StepReview';

const STEPS = [
  { id: 0, title: 'Welcome' },
  { id: 1, title: 'Career Goal' },
  { id: 2, title: 'Experience' },
  { id: 3, title: 'Skills' },
  { id: 4, title: 'Projects' },
  { id: 5, title: 'Interests' },
  { id: 6, title: 'Preferences' },
  { id: 7, title: 'Review' },
];

export const OnboardingWizard: React.FC = () => {
  const { onboardingState, updateOnboardingData, submitOnboarding, resetOnboarding } = useProfile();
  const currentStep = onboardingState.step;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  const goToStep = (stepIdx: number) => {
    setValidationWarning(null);
    updateOnboardingData({ step: stepIdx });
  };

  const handleNext = () => {
    setValidationWarning(null);

    // Validation rules for current step
    if (currentStep === 1) {
      if (!onboardingState.careerGoal.targetRole.trim()) {
        setValidationWarning('Please specify your target career role to proceed.');
        return;
      }
    }

    if (currentStep === 3) {
      if (onboardingState.skills.length === 0) {
        setValidationWarning('Please add or extract at least 1 skill to calibrate your profile.');
        return;
      }
    }

    if (currentStep < STEPS.length - 1) {
      updateOnboardingData({ step: currentStep + 1 });
    }
  };

  const handleBack = () => {
    setValidationWarning(null);
    if (currentStep > 0) {
      updateOnboardingData({ step: currentStep - 1 });
    }
  };

  const handleSubmitProfile = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitOnboarding();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save profile. Please check server connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Progress Header (Only shown after Step 0 Welcome) */}
      {currentStep > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">
              Step {currentStep} of {STEPS.length - 1}: {STEPS[currentStep]?.title}
            </span>
            <button
              onClick={resetOnboarding}
              className="text-slate-500 hover:text-slate-300 flex items-center gap-1 transition"
              title="Reset Onboarding Draft"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Progress Multi-Bar */}
          <div className="grid grid-cols-7 gap-1.5">
            {STEPS.slice(1).map(s => {
              const isPast = s.id < currentStep;
              const isCurrent = s.id === currentStep;
              return (
                <div
                  key={s.id}
                  onClick={() => isPast && goToStep(s.id)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isPast
                      ? 'bg-primary-500 cursor-pointer hover:bg-primary-400'
                      : isCurrent
                        ? 'bg-accent-teal shadow-sm'
                        : 'bg-slate-800'
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Step Content Container */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl min-h-[460px] flex flex-col justify-between">
        {currentStep === 0 && <StepWelcome onStart={() => goToStep(1)} />}
        {currentStep === 1 && <StepCareerGoal />}
        {currentStep === 2 && <StepExperience />}
        {currentStep === 3 && <StepSkills />}
        {currentStep === 4 && <StepProjectsLearning />}
        {currentStep === 5 && <StepInterests />}
        {currentStep === 6 && <StepPreferences />}
        {currentStep === 7 && (
          <StepReview
            onJumpToStep={goToStep}
            onSubmit={handleSubmitProfile}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}

        {/* Validation Alert */}
        {validationWarning && (
          <div className="mt-4 p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs animate-fade-in">
            {validationWarning}
          </div>
        )}

        {/* Navigation Buttons (Step 1 to 6) */}
        {currentStep > 0 && currentStep < 7 && (
          <div className="flex items-center justify-between pt-8 border-t border-slate-800/80 mt-6">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow transition cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

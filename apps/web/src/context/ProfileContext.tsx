import React, { createContext, useContext, useState, useEffect } from 'react';
import type { LearnerProfile, ProfileCompleteness, TechnicalLevel } from '@pathforge/shared';
import { calculateProfileCompleteness } from '@pathforge/shared';
import apiClient from '../services/api-client';

export interface OnboardingState {
  step: number;
  careerGoal: {
    targetRole: string;
    careerGoalDescription: string;
    targetIndustry: string;
    targetCompanyType: string;
    targetTimeline: string;
  };
  experience: {
    educationLevel: string;
    fieldOfStudy: string;
    experienceYears: number;
    professionalSummary: string;
    technicalLevel: TechnicalLevel;
  };
  skills: Array<{
    name: string;
    selfReportedLevel: number;
    evidence?: string;
    yearsExperience?: number;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    role?: string;
    projectUrl?: string;
  }>;
  learningExperiences: Array<{
    courseName: string;
    provider: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
  }>;
  interests: Array<{
    category: 'TECHNICAL' | 'CAREER' | 'INDUSTRY' | 'PROBLEM_TYPE';
    topic: string;
  }>;
  preference: {
    learningFormat: 'VIDEO' | 'ARTICLES' | 'DOCUMENTATION' | 'INTERACTIVE' | 'PROJECTS' | 'MIXED';
    difficultyPreference: 'GRADUAL' | 'CHALLENGING' | 'INTENSIVE';
    weeklyAvailabilityHours: string;
    projectPreference: 'PROJECTS' | 'BALANCED' | 'THEORY';
  };
}

const INITIAL_ONBOARDING_STATE: OnboardingState = {
  step: 0,
  careerGoal: {
    targetRole: '',
    careerGoalDescription: '',
    targetIndustry: 'Technology',
    targetCompanyType: 'Startup / Mid-size',
    targetTimeline: '6-12 months',
  },
  experience: {
    educationLevel: 'Bachelor Degree',
    fieldOfStudy: 'Computer Science / Engineering',
    experienceYears: 1,
    professionalSummary: '',
    technicalLevel: 'INTERMEDIATE',
  },
  skills: [],
  projects: [],
  learningExperiences: [],
  certifications: [],
  interests: [
    { category: 'TECHNICAL', topic: 'Distributed Systems' },
    { category: 'TECHNICAL', topic: 'Cloud Computing' },
  ],
  preference: {
    learningFormat: 'MIXED',
    difficultyPreference: 'CHALLENGING',
    weeklyAvailabilityHours: '10-15',
    projectPreference: 'BALANCED',
  },
};

interface ProfileContextType {
  profile: LearnerProfile | null;
  completeness: ProfileCompleteness | null;
  onboardingState: OnboardingState;
  isLoading: boolean;
  error: string | null;
  setOnboardingState: React.Dispatch<React.SetStateAction<OnboardingState>>;
  updateOnboardingData: (patch: Partial<OnboardingState>) => void;
  refreshProfile: () => Promise<void>;
  submitOnboarding: () => Promise<LearnerProfile>;
  resetOnboarding: () => void;
  deleteCurrentProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const ONBOARDING_STORAGE_KEY = 'pathforge_onboarding_draft';

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Restore onboarding draft from localStorage if present
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(() => {
    try {
      const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (saved) {
        return { ...INITIAL_ONBOARDING_STATE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to parse local draft:', e);
    }
    return INITIAL_ONBOARDING_STATE;
  });

  // Autosave onboarding draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(onboardingState));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [onboardingState]);

  const updateOnboardingData = (patch: Partial<OnboardingState>) => {
    setOnboardingState(prev => ({ ...prev, ...patch }));
  };

  const refreshProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getProfile();
      setProfile(data);
      if (data) {
        const comp = calculateProfileCompleteness(data);
        setCompleteness(comp);
      } else {
        setCompleteness(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const submitOnboarding = async (): Promise<LearnerProfile> => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        targetRole: onboardingState.careerGoal.targetRole,
        careerGoalDescription: onboardingState.careerGoal.careerGoalDescription,
        targetIndustry: onboardingState.careerGoal.targetIndustry,
        targetCompanyType: onboardingState.careerGoal.targetCompanyType,
        targetTimeline: onboardingState.careerGoal.targetTimeline,
        educationLevel: onboardingState.experience.educationLevel,
        fieldOfStudy: onboardingState.experience.fieldOfStudy,
        experienceYears: onboardingState.experience.experienceYears,
        professionalSummary: onboardingState.experience.professionalSummary,
        technicalLevel: onboardingState.experience.technicalLevel,
        skills: onboardingState.skills,
        projects: onboardingState.projects,
        learningExperiences: onboardingState.learningExperiences,
        certifications: onboardingState.certifications,
        interests: onboardingState.interests,
        preference: onboardingState.preference,
      };

      const saved = await apiClient.saveProfile(payload);
      setProfile(saved);
      setCompleteness(calculateProfileCompleteness(saved));
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      return saved;
    } catch (err: any) {
      setError(err.message || 'Failed to submit profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetOnboarding = () => {
    setOnboardingState(INITIAL_ONBOARDING_STATE);
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  };

  const deleteCurrentProfile = async () => {
    setIsLoading(true);
    try {
      await apiClient.deleteProfile();
      setProfile(null);
      setCompleteness(null);
      resetOnboarding();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        completeness,
        onboardingState,
        isLoading,
        error,
        setOnboardingState,
        updateOnboardingData,
        refreshProfile,
        submitOnboarding,
        resetOnboarding,
        deleteCurrentProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

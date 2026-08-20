import React, { useState } from 'react';
import { GraduationCap, Sparkles, Trash2, Compass, Clock } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { CompletenessCard } from './CompletenessCard';
import { SkillManager } from './SkillManager';
import { ProjectManager } from './ProjectManager';

export const ProfileDashboard: React.FC = () => {
  const { profile, completeness, refreshProfile, deleteCurrentProfile, setOnboardingState } =
    useProfile();

  const [isDeleting, setIsDeleting] = useState(false);

  if (!profile) return null;

  const handleEditProfile = () => {
    // Populate onboarding state from saved profile
    setOnboardingState({
      step: 1,
      careerGoal: {
        targetRole: profile.targetRole,
        careerGoalDescription: profile.careerGoalDescription || '',
        targetIndustry: profile.targetIndustry || 'Technology',
        targetCompanyType: profile.targetCompanyType || 'Product Scaleups & Tech',
        targetTimeline: profile.targetTimeline || '6-12 months',
      },
      experience: {
        educationLevel: profile.educationLevel || 'Bachelor Degree',
        fieldOfStudy: profile.fieldOfStudy || '',
        experienceYears: profile.experienceYears || 1,
        professionalSummary: profile.professionalSummary || '',
        technicalLevel: profile.technicalLevel,
      },
      skills: profile.skills.map(s => ({
        name: s.name,
        selfReportedLevel: s.selfReportedLevel,
        evidence: s.evidence || undefined,
        yearsExperience: s.yearsExperience || undefined,
      })),
      projects: profile.projects.map(p => ({
        name: p.name,
        description: p.description,
        technologies: p.technologies || [],
        role: p.role || undefined,
        projectUrl: p.projectUrl || undefined,
      })),
      learningExperiences: profile.learningExperiences.map(l => ({
        courseName: l.courseName,
        provider: l.provider,
        status: l.status,
      })),
      certifications: profile.certifications.map(c => ({
        name: c.name,
        issuer: c.issuer,
      })),
      interests: profile.interests.map(i => ({
        category: i.category,
        topic: i.topic,
      })),
      preference: {
        learningFormat: profile.preference?.learningFormat || 'MIXED',
        difficultyPreference: profile.preference?.difficultyPreference || 'CHALLENGING',
        weeklyAvailabilityHours: profile.preference?.weeklyAvailabilityHours || '10-15',
        projectPreference: profile.preference?.projectPreference || 'BALANCED',
      },
    });
  };

  const handleDelete = async () => {
    if (
      window.confirm('Are you sure you want to reset your learner profile? This cannot be undone.')
    ) {
      setIsDeleting(true);
      await deleteCurrentProfile();
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Profile Top Banner */}
      <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-primary-500/30 relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Active Learner Profile
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {profile.targetRole}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {profile.careerGoalDescription ||
                'Targeting a career trajectory in modern software engineering.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleEditProfile}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              Edit Profile
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-800 transition"
              title="Delete Profile"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Badges strip */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-300">
            <GraduationCap className="w-3.5 h-3.5 text-accent-cyan" />
            <span>
              {profile.educationLevel || 'Degree'} ({profile.technicalLevel})
            </span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-accent-amber" />
            <span>Target Timeline: {profile.targetTimeline || '6-12 months'}</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-accent-teal" />
            <span>{profile.preference?.weeklyAvailabilityHours || '10-15'} hrs/week</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Completeness & Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Completeness & Preferences */}
        <div className="space-y-6">
          <CompletenessCard completeness={completeness} />

          {/* Preferences & Interests Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-accent-cyan" />
              <h3 className="text-sm font-semibold text-white">Interests & Domains</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map(i => (
                <span
                  key={i.topic}
                  className="text-xs px-2.5 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-300"
                >
                  {i.topic}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Learning Format:</span>
                <strong className="text-slate-200">{profile.preference?.learningFormat}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Difficulty:</span>
                <strong className="text-slate-200">
                  {profile.preference?.difficultyPreference}
                </strong>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Project vs Theory:</span>
                <strong className="text-slate-200">{profile.preference?.projectPreference}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Skills Matrix & Verified Projects */}
        <div className="md:col-span-2 space-y-6">
          <SkillManager skills={profile.skills} onSkillUpdated={refreshProfile} />
          <ProjectManager projects={profile.projects} onProjectUpdated={refreshProfile} />
        </div>
      </div>
    </div>
  );
};

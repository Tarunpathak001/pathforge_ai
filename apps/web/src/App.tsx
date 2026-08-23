import React, { useState, useEffect } from 'react';
import { Compass, UserCircle, Loader2, Briefcase, Zap, BookOpen, Route } from 'lucide-react';
import { useProfile } from './context/ProfileContext';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { ProfileDashboard } from './components/profile/ProfileDashboard';
import { CareerExplorer } from './components/careers/CareerExplorer';
import { CareerDetail } from './components/careers/CareerDetail';
import { SkillGapDashboard } from './components/skill-gap/SkillGapDashboard';
import { RecommendationsPage } from './components/recommendations/RecommendationsPage';
import { LearningPathPage } from './components/learning-path/LearningPathPage';

type ActiveSection = 'gap' | 'path' | 'recommendations' | 'careers' | 'profile';

export const AppContent: React.FC = () => {
  const { profile, isLoading, onboardingState, setOnboardingState } = useProfile();
  const [activeSection, setActiveSection] = useState<ActiveSection>('path');
  const [selectedCareerSlug, setSelectedCareerSlug] = useState<string | null>(null);
  const [gapCareerSlug, setGapCareerSlug] = useState<string>('backend-engineer');

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('/gap/')) {
        const slug = hash.replace('/gap/', '');
        setGapCareerSlug(slug);
        setActiveSection('gap');
      } else if (hash === '/gap' || hash === '/career-analysis') {
        setActiveSection('gap');
      } else if (hash === '/path' || hash === '/learning-path' || hash === '/roadmap') {
        setActiveSection('path');
      } else if (hash === '/recommendations' || hash === '/learning' || hash === '/resources') {
        setActiveSection('recommendations');
      } else if (hash.startsWith('/careers/')) {
        const slug = hash.replace('/careers/', '');
        setSelectedCareerSlug(slug);
        setActiveSection('careers');
      } else if (hash === '/careers') {
        setSelectedCareerSlug(null);
        setActiveSection('careers');
      } else if (hash === '/profile') {
        setActiveSection('profile');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToGapEngine = (careerSlug?: string) => {
    if (careerSlug) setGapCareerSlug(careerSlug);
    setActiveSection('gap');
    window.location.hash = careerSlug ? `/gap/${careerSlug}` : '/gap';
  };

  const navigateToLearningPath = () => {
    setActiveSection('path');
    window.location.hash = '/learning-path';
  };

  const navigateToRecommendations = () => {
    setActiveSection('recommendations');
    window.location.hash = '/recommendations';
  };

  const navigateToCareer = (slug: string) => {
    setSelectedCareerSlug(slug);
    setActiveSection('careers');
    window.location.hash = `/careers/${slug}`;
  };

  const navigateToCareerCatalog = () => {
    setSelectedCareerSlug(null);
    setActiveSection('careers');
    window.location.hash = '/careers';
  };

  const navigateToProfile = () => {
    setActiveSection('profile');
    window.location.hash = '/profile';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
            Loading Knowledge Intelligence...
          </p>
        </div>
      </div>
    );
  }

  // If user has completed profile and is not currently on a step > 0 in onboarding
  const showDashboard = profile && onboardingState.step === 0;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div
              onClick={() => navigateToLearningPath()}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md glow-primary">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white">
                  PathForge<span className="text-cyan-400">AI</span>
                </span>
                <span className="hidden sm:inline-block ml-2.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-300">
                  Phase 5: Personalized Roadmap
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
              <button
                onClick={navigateToLearningPath}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                  activeSection === 'path'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Route className="w-3.5 h-3.5" />
                Learning Roadmap
              </button>

              <button
                onClick={() => navigateToGapEngine()}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                  activeSection === 'gap'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Skill Gap Engine
              </button>

              <button
                onClick={navigateToRecommendations}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                  activeSection === 'recommendations'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Learning Resources
              </button>

              <button
                onClick={navigateToCareerCatalog}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                  activeSection === 'careers'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Career Intelligence
              </button>

              <button
                onClick={navigateToProfile}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                  activeSection === 'profile'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCircle className="w-3.5 h-3.5" />
                Learner Profile
              </button>
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Mobile Tab Toggle */}
            <div className="flex md:hidden items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={navigateToLearningPath}
                className={`px-2 py-1 rounded font-medium ${
                  activeSection === 'path' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                Path
              </button>
              <button
                onClick={() => navigateToGapEngine()}
                className={`px-2 py-1 rounded font-medium ${
                  activeSection === 'gap' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                Gap
              </button>
              <button
                onClick={navigateToRecommendations}
                className={`px-2 py-1 rounded font-medium ${
                  activeSection === 'recommendations' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Learn
              </button>
              <button
                onClick={navigateToCareerCatalog}
                className={`px-2 py-1 rounded font-medium ${
                  activeSection === 'careers' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                Careers
              </button>
              <button
                onClick={navigateToProfile}
                className={`px-2 py-1 rounded font-medium ${
                  activeSection === 'profile' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                Profile
              </button>
            </div>

            {activeSection === 'profile' && profile && !showDashboard && (
              <button
                onClick={() => setOnboardingState(prev => ({ ...prev, step: 0 }))}
                className="text-xs text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg border border-slate-800"
              >
                View Profile
              </button>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px]">Deterministic Engine Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start py-6 px-4">
        {activeSection === 'path' ? (
          <LearningPathPage />
        ) : activeSection === 'gap' ? (
          <SkillGapDashboard
            initialCareerSlug={gapCareerSlug}
            onNavigateToCareer={navigateToCareer}
            onNavigateToProfile={navigateToProfile}
          />
        ) : activeSection === 'recommendations' ? (
          <RecommendationsPage />
        ) : activeSection === 'careers' ? (
          selectedCareerSlug ? (
            <CareerDetail
              careerSlug={selectedCareerSlug}
              onBack={navigateToCareerCatalog}
              onAnalyzeGap={navigateToGapEngine}
            />
          ) : (
            <CareerExplorer onSelectCareer={navigateToCareer} />
          )
        ) : showDashboard ? (
          <ProfileDashboard />
        ) : (
          <OnboardingWizard />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        <p>PathForge AI — Deterministic Personalized Career & Skill Gap Intelligence Platform</p>
      </footer>
    </div>
  );
};

export default function App() {
  return <AppContent />;
}

import React, { useState, useEffect } from 'react';
import {
  Compass,
  UserCircle,
  Loader2,
  Briefcase,
  Zap,
  BookOpen,
  Route,
  TrendingUp,
  CheckSquare,
  LayoutDashboard,
} from 'lucide-react';
import { useProfile } from './context/ProfileContext';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { ProfileDashboard } from './components/profile/ProfileDashboard';
import { CareerExplorer } from './components/careers/CareerExplorer';
import { CareerDetail } from './components/careers/CareerDetail';
import { SkillGapDashboard } from './components/skill-gap/SkillGapDashboard';
import { RecommendationsPage } from './components/recommendations/RecommendationsPage';
import { LearningPathPage } from './components/learning-path/LearningPathPage';
import { ProgressDashboard } from './components/progress/ProgressDashboard';
import { AssessmentListPage } from './components/assessments/AssessmentListPage';
import { DashboardPage } from './components/dashboard/DashboardPage';

type ActiveSection =
  | 'dashboard'
  | 'progress'
  | 'path'
  | 'assessments'
  | 'gap'
  | 'recommendations'
  | 'careers'
  | 'profile';

export const AppContent: React.FC = () => {
  const { profile, isLoading, onboardingState } = useProfile();
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [selectedCareerSlug, setSelectedCareerSlug] = useState<string | null>(null);
  const [gapCareerSlug, setGapCareerSlug] = useState<string>('backend-engineer');

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === '' || hash === '/' || hash === '/dashboard') {
        setActiveSection('dashboard');
      } else if (hash.startsWith('/gap/')) {
        const slug = hash.replace('/gap/', '');
        setGapCareerSlug(slug);
        setActiveSection('gap');
      } else if (hash === '/gap' || hash === '/career-analysis') {
        setActiveSection('gap');
      } else if (hash === '/progress' || hash === '/adaptive') {
        setActiveSection('progress');
      } else if (hash === '/assessments' || hash.startsWith('/assessments/')) {
        setActiveSection('assessments');
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

  const navigateToDashboard = () => {
    setActiveSection('dashboard');
    window.location.hash = '/dashboard';
  };

  const navigateToProgress = () => {
    setActiveSection('progress');
    window.location.hash = '/progress';
  };

  const navigateToAssessments = () => {
    setActiveSection('assessments');
    window.location.hash = '/assessments';
  };

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

  const handleNavigateTab = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        navigateToDashboard();
        break;
      case 'learning-path':
      case 'path':
        navigateToLearningPath();
        break;
      case 'assessments':
        navigateToAssessments();
        break;
      case 'gap':
        navigateToGapEngine();
        break;
      case 'recommendations':
        navigateToRecommendations();
        break;
      case 'careers':
        navigateToCareerCatalog();
        break;
      case 'progress':
        navigateToProgress();
        break;
      case 'profile':
      default:
        navigateToProfile();
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <p className="text-sm">Initializing PathForge AI Engine...</p>
      </div>
    );
  }

  const showDashboard = profile && onboardingState.step === 4;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-6">
            <a
              href="#/progress"
              onClick={navigateToProgress}
              className="flex items-center gap-2.5 font-black text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent hover:opacity-90 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <Compass className="w-5 h-5 text-slate-950 font-black stroke-[2.5]" />
              </div>
              <span>PathForge AI</span>
            </a>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
              <button
                onClick={navigateToDashboard}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeSection === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </button>

              <button
                onClick={navigateToLearningPath}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeSection === 'path'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Route className="w-3.5 h-3.5" />
                Roadmap
              </button>

              <button
                onClick={navigateToAssessments}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeSection === 'assessments'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Assessments
              </button>

              <button
                onClick={navigateToProgress}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeSection === 'progress'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Progress
              </button>

              <button
                onClick={() => navigateToGapEngine()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeSection === 'gap'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Skill Gaps
              </button>

              <button
                onClick={navigateToRecommendations}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeSection === 'recommendations'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Resources
              </button>

              <button
                onClick={navigateToCareerCatalog}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeSection === 'careers'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Careers
              </button>

              <button
                onClick={navigateToProfile}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeSection === 'profile'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <UserCircle className="w-3.5 h-3.5" />
                Profile
              </button>
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px]">Command Center Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start py-6 px-4 max-w-7xl w-full mx-auto">
        {activeSection === 'dashboard' ? (
          <DashboardPage onNavigateTab={handleNavigateTab} />
        ) : activeSection === 'progress' ? (
          <ProgressDashboard />
        ) : activeSection === 'path' ? (
          <LearningPathPage />
        ) : activeSection === 'assessments' ? (
          <AssessmentListPage onAssessmentCompleted={() => navigateToDashboard()} />
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

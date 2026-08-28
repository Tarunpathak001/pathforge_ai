import React, { useState, useEffect } from 'react';
import type { DashboardSummary, NextAction } from '@pathforge/shared';
import apiClient from '../../services/api-client';
import { DashboardSkeleton } from './DashboardSkeleton';
import { DashboardHeader } from './DashboardHeader';
import { CareerAlignmentCard } from './CareerAlignmentCard';
import { NextActionCard } from './NextActionCard';
import { CurrentMilestoneCard } from './CurrentMilestoneCard';
import { RoadmapPreview } from './RoadmapPreview';
import { SkillSummaryCard } from './SkillSummaryCard';
import { SkillProgressCard } from './SkillProgressCard';
import { RecommendationsPreview } from './RecommendationsPreview';
import { RecentActivityCard } from './RecentActivityCard';
import { WeeklyProgressCard } from './WeeklyProgressCard';
import { AdaptiveChangeCard } from './AdaptiveChangeCard';
import { CareerSwitchModal } from './CareerSwitchModal';

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void;
  onOpenAssessment?: (assessmentSlug: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  onOpenAssessment,
}) => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [careerSwitchOpen, setCareerSwitchOpen] = useState(false);

  const fetchDashboard = async (careerSlug?: string, refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getDashboardData(careerSlug, refresh);
      if (res && res.data) {
        setData(res.data);
      } else if (res) {
        setData(res);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Unable to connect to PathForge AI services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSelectCareer = async (careerSlug: string) => {
    try {
      const res = await apiClient.switchDashboardCareer(careerSlug, true);
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to switch career:', err);
      // Fallback reload
      fetchDashboard(careerSlug, true);
    }
  };

  const handleExecuteNextAction = (action: NextAction) => {
    if (action.type === 'ASSESSMENT') {
      if (onOpenAssessment) {
        onOpenAssessment(action.id);
      } else {
        onNavigateTab('assessments');
      }
    } else if (action.actionUrl && action.actionUrl.startsWith('http')) {
      window.open(action.actionUrl, '_blank', 'noopener,noreferrer');
    } else {
      onNavigateTab('learning-path');
    }
  };

  const handleLaunchResource = (url: string) => {
    if (url && url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      onNavigateTab('learning-path');
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center text-2xl mx-auto">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-white">Dashboard Unavailable</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => fetchDashboard(undefined, true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!data || !data.hasProfile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
        <div className="h-16 w-16 rounded-3xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-3xl mx-auto">
          🚀
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Welcome to PathForge AI</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Your personalized career intelligence starts here. Complete your learner profile to generate your customized career roadmap.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab('profile')}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all"
        >
          Create Learner Profile →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <DashboardHeader
        data={data}
        onOpenCareerSwitch={() => setCareerSwitchOpen(true)}
        onContinueLearning={() => data.nextAction && handleExecuteNextAction(data.nextAction)}
      />

      {/* Adaptive Change Notification */}
      {data.recentAdaptiveChange && (
        <AdaptiveChangeCard
          changeSummary={data.recentAdaptiveChange}
          onViewChanges={() => onNavigateTab('learning-path')}
        />
      )}

      {/* Stale Warning Banner */}
      {data.isStale && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <p className="text-xs text-amber-200">{data.staleReason}</p>
          </div>
          <button
            onClick={() => fetchDashboard(data.career?.slug, true)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all shrink-0"
          >
            Recalculate Roadmap
          </button>
        </div>
      )}

      {/* Core Grid: Left 2 Cols (Primary Flow) / Right 1 Col (Telemetry) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Action & Learning Engine) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Next Best Action */}
          <NextActionCard
            nextAction={data.nextAction}
            onExecuteAction={handleExecuteNextAction}
          />

          {/* 2. Current Milestone in Focus */}
          <CurrentMilestoneCard
            milestone={data.currentMilestone}
            onOpenMilestone={() => onNavigateTab('learning-path')}
          />

          {/* 3. Roadmap Preview */}
          {data.roadmap && (
            <RoadmapPreview
              roadmap={data.roadmap}
              onViewFullPath={() => onNavigateTab('learning-path')}
            />
          )}

          {/* 4. Top Curated Recommendations */}
          <RecommendationsPreview
            recommendations={data.recommendations}
            onViewAll={() => onNavigateTab('recommendations')}
            onLaunchResource={handleLaunchResource}
          />

          {/* 5. Competency Breakdown */}
          <SkillSummaryCard
            summary={data.skillSummary}
            onViewAnalysis={() => onNavigateTab('gap')}
          />
        </div>

        {/* Right Column (Career Alignment & Verification Intelligence) */}
        <div className="space-y-8">
          {/* 1. Career Alignment Card */}
          <CareerAlignmentCard
            careerName={data.career?.name || 'Target Role'}
            alignment={data.alignment}
            onViewAnalysis={() => onNavigateTab('gap')}
          />

          {/* 2. Weekly Commitment */}
          <WeeklyProgressCard summary={data.weeklySummary} />

          {/* 3. Measured Skill Gains */}
          <SkillProgressCard progressItems={data.recentSkillProgress} />

          {/* 4. Recent Activity Stream */}
          <RecentActivityCard activity={data.recentActivity} />
        </div>
      </div>

      {/* Career Switch Modal */}
      <CareerSwitchModal
        currentCareerSlug={data.career?.slug || 'backend-engineer'}
        isOpen={careerSwitchOpen}
        onClose={() => setCareerSwitchOpen(false)}
        onSelectCareer={handleSelectCareer}
      />
    </div>
  );
};

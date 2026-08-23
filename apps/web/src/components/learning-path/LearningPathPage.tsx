import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api-client.js';
import type {
  LearningPathReport,
  LearningMilestoneItem,
} from '@pathforge/shared';
import { MilestoneCard } from './MilestoneCard.js';
import { MilestoneDetailModal } from './MilestoneDetailModal.js';
import { WhyThisOrderSection } from './WhyThisOrderSection.js';

export const LearningPathPage: React.FC = () => {
  const [learningPath, setLearningPath] = useState<LearningPathReport | null>(null);
  const [careers, setCareers] = useState<any[]>([]);
  const [selectedCareerSlug, setSelectedCareerSlug] = useState<string>('');
  const [weeklyHours, setWeeklyHours] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeModalMilestone, setActiveModalMilestone] = useState<LearningMilestoneItem | null>(null);

  // Load careers and initial learning path
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch available careers
        const careerList = await apiClient.getCareers();
        setCareers(careerList || []);

        // 2. Fetch current profile to find target career
        const profile = await apiClient.getProfile();
        let targetSlug = 'backend-engineer';

        if (profile?.targetRole) {
          const match = (careerList || []).find(
            c =>
              c.name.toLowerCase() === profile.targetRole.toLowerCase() ||
              c.slug === profile.targetRole.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          );
          if (match) targetSlug = match.slug;
        }

        setSelectedCareerSlug(targetSlug);

        // 3. Fetch latest learning roadmap
        const pathData = await apiClient.getLatestLearningPath(targetSlug);
        setLearningPath(pathData);
        if (pathData?.weeklyHours) {
          setWeeklyHours(pathData.weeklyHours);
        }
      } catch (err: any) {
        console.error('Failed to load learning path:', err);
        setError(err.message || 'Failed to load learning roadmap.');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  // Handle career change
  const handleCareerChange = async (slug: string) => {
    setSelectedCareerSlug(slug);
    try {
      setGenerating(true);
      setError(null);
      const pathData = await apiClient.generateLearningPath({
        careerSlug: slug,
        weeklyHours,
      });
      setLearningPath(pathData);
    } catch (err: any) {
      console.error('Failed to generate learning path for career:', err);
      setError(err.message || 'Failed to generate roadmap.');
    } finally {
      setGenerating(false);
    }
  };

  // Handle regenerate button
  const handleRegenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      const pathData = await apiClient.generateLearningPath({
        careerSlug: selectedCareerSlug,
        weeklyHours,
        regenerate: true,
      });
      setLearningPath(pathData);
    } catch (err: any) {
      console.error('Failed to regenerate roadmap:', err);
      setError(err.message || 'Failed to regenerate roadmap.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-medium text-sm">
          Generating personalized prerequisite learning roadmap...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-left">
      {/* Top Header & Overview */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800/60">
                Phase 5 • Personalized Roadmap
              </span>
              <span className="text-xs text-slate-400">Deterministic DAG Sequencing</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              Personalized Learning Roadmap
            </h1>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Career Selector */}
            <select
              value={selectedCareerSlug}
              onChange={e => handleCareerChange(e.target.value)}
              disabled={generating}
              aria-label="Select Target Career"
              className="bg-slate-800 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 px-3.5 py-2.5 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {careers.map(c => (
                <option key={c.slug} value={c.slug}>
                  🎯 {c.name}
                </option>
              ))}
            </select>

            {/* Weekly Hours Selector */}
            <select
              value={weeklyHours}
              onChange={e => setWeeklyHours(parseInt(e.target.value, 10))}
              disabled={generating}
              aria-label="Weekly Study Commitment Hours"
              className="bg-slate-800 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 px-3.5 py-2.5 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value={5}>⏱️ 5 hrs / week</option>
              <option value={10}>⏱️ 10 hrs / week</option>
              <option value={15}>⏱️ 15 hrs / week</option>
              <option value={20}>⏱️ 20 hrs / week</option>
            </select>

            {/* Regenerate Button */}
            <button
              onClick={handleRegenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Computing...</span>
                </>
              ) : (
                <>
                  <span>⚡ Regenerate Roadmap</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-3xl">
          {learningPath?.description ||
            `A structured, prerequisite-aware learning roadmap designed to bridge your skill gaps.`}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Metrics Banner */}
      {learningPath && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Current Readiness
            </span>
            <div className="text-2xl md:text-3xl font-extrabold text-blue-400 mt-1">
              {Math.round(learningPath.readinessAtGeneration)}%
            </div>
            <span className="text-xs text-slate-400">At roadmap generation</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Study Effort
            </span>
            <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
              {learningPath.estimatedHours} <span className="text-sm font-normal text-slate-400">hrs</span>
            </div>
            <span className="text-xs text-slate-400">Curated materials + practice</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Estimated Duration
            </span>
            <div className="text-2xl md:text-3xl font-extrabold text-emerald-400 mt-1">
              ~{learningPath.estimatedWeeks} <span className="text-sm font-normal text-slate-400">weeks</span>
            </div>
            <span className="text-xs text-slate-400">At {learningPath.weeklyHours} hrs/week</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Roadmap Milestones
            </span>
            <div className="text-2xl md:text-3xl font-extrabold text-purple-400 mt-1">
              {learningPath.milestones?.length || 0}
            </div>
            <span className="text-xs text-slate-400">Foundations → Capstone</span>
          </div>
        </div>
      )}

      {/* Step-by-Step Interactive Timeline */}
      {learningPath?.milestones && learningPath.milestones.length > 0 ? (
        <div className="space-y-2">
          {learningPath.milestones.map((milestone, idx) => (
            <MilestoneCard
              key={milestone.id || milestone.order}
              milestone={milestone}
              index={idx}
              totalMilestones={learningPath.milestones.length}
              onSelect={m => setActiveModalMilestone(m)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-800/40 border border-slate-700 text-slate-400">
          <p className="text-lg font-semibold text-slate-300 mb-2">No learning gaps detected!</p>
          <p className="text-sm">You have already mastered all required skills for this career.</p>
        </div>
      )}

      {/* Why This Order Section */}
      {learningPath?.milestones && learningPath.milestones.length > 0 && (
        <WhyThisOrderSection
          milestones={learningPath.milestones}
          careerName={learningPath.careerName}
        />
      )}

      {/* Milestone Deep-Dive Modal */}
      <MilestoneDetailModal
        milestone={activeModalMilestone}
        onClose={() => setActiveModalMilestone(null)}
      />
    </div>
  );
};

export default LearningPathPage;

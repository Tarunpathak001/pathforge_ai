import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api-client.js';
import type { SkillGapAnalysisReport, SkillGapItem } from '@pathforge/shared';
import { SkillGapExplanationModal } from './SkillGapExplanationModal.js';

interface SkillGapDashboardProps {
  initialCareerSlug?: string;
  onNavigateToCareer?: (slug: string) => void;
  onNavigateToProfile?: () => void;
}

type TabType = 'ALL' | 'CRITICAL' | 'STRENGTHS' | 'DEVELOPING' | 'MISSING';

export const SkillGapDashboard: React.FC<SkillGapDashboardProps> = ({
  initialCareerSlug,
  onNavigateToCareer,
  onNavigateToProfile,
}) => {
  const [careers, setCareers] = useState<any[]>([]);
  const [selectedCareerSlug, setSelectedCareerSlug] = useState<string>(
    initialCareerSlug || 'backend-engineer'
  );
  const [report, setReport] = useState<SkillGapAnalysisReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [selectedSkillForModal, setSelectedSkillForModal] = useState<SkillGapItem | null>(null);

  // Load careers catalog for selector
  useEffect(() => {
    async function loadCareersList() {
      try {
        const list = await apiClient.getCareers();
        setCareers(list);
      } catch (err) {
        console.error('Failed to load careers list:', err);
      }
    }
    loadCareersList();
  }, []);

  // Fetch or analyze gap report for the selected career
  useEffect(() => {
    async function loadGapAnalysis() {
      setLoading(true);
      setError(null);
      try {
        const latest = await apiClient.getLatestSkillGap(selectedCareerSlug);
        setReport(latest);
      } catch (err: any) {
        console.error('Failed to load skill gap report:', err);
        // If not found or profile incomplete
        if (err.message?.includes('profile') || err.message?.includes('onboarding')) {
          setError('Please complete your learner profile before running skill gap analysis.');
        } else {
          // Attempt fresh analysis
          try {
            const fresh = await apiClient.analyzeSkillGap({ careerSlug: selectedCareerSlug });
            setReport(fresh);
          } catch (freshErr: any) {
            setError(freshErr.message || 'Could not calculate skill gap.');
          }
        }
      } finally {
        setLoading(false);
      }
    }

    loadGapAnalysis();
  }, [selectedCareerSlug]);

  const handleReanalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const fresh = await apiClient.analyzeSkillGap({ careerSlug: selectedCareerSlug });
      setReport(fresh);
    } catch (err: any) {
      setError(err.message || 'Reanalysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getFilteredItems = (): SkillGapItem[] => {
    if (!report) return [];
    switch (activeTab) {
      case 'CRITICAL':
        return report.criticalGaps;
      case 'STRENGTHS':
        return report.strengths;
      case 'DEVELOPING':
        return report.developingSkills;
      case 'MISSING':
        return report.missingSkills;
      case 'ALL':
      default:
        return report.allResults;
    }
  };

  const getReadinessBandBadge = (band: string) => {
    switch (band) {
      case 'Career Ready':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Strong Progress':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Developing':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Top Header & Career Selector */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <span>⚡ Phase 3 Intelligence Engine</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
            Personalized Career Gap Analysis
          </h1>
          <p className="text-sm text-slate-400">
            Deterministic matching of your verified skills against real-world target career
            requirements.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedCareerSlug}
            onChange={e => setSelectedCareerSlug(e.target.value)}
            className="px-4 py-2.5 bg-slate-800/90 text-slate-200 border border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {careers.map(c => (
              <option key={c.id} value={c.slug}>
                Target: {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleReanalyze}
            disabled={analyzing}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-cyan-950/50 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <span>⚡</span>
                Re-Analyze Gap
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          {onNavigateToProfile && (
            <button
              onClick={onNavigateToProfile}
              className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 text-xs text-rose-100 font-semibold rounded-lg transition-colors"
            >
              Go to Profile Onboarding →
            </button>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
          <div className="md:col-span-4 h-48 bg-slate-800/40 rounded-2xl border border-slate-800" />
          <div className="md:col-span-4 h-96 bg-slate-800/40 rounded-2xl border border-slate-800" />
        </div>
      ) : report ? (
        <>
          {/* Hero Career Alignment Card */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/90 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Score Gauge & Band */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="relative flex items-center justify-center mb-3">
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                    {report.readinessScore}%
                  </div>
                </div>

                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                  Career Alignment Score
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold border ${getReadinessBandBadge(
                    report.readinessBand
                  )}`}
                >
                  {report.readinessBand}
                </span>

                <div className="text-[11px] text-slate-500 mt-3 italic">
                  Deterministic alignment benchmark (v{report.algorithmVersion})
                </div>
              </div>

              {/* Summary Text & Breakdown Stats */}
              <div className="lg:col-span-8 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-slate-100">
                      Your Path to {report.career.name}
                    </h2>
                    {onNavigateToCareer && (
                      <button
                        onClick={() => onNavigateToCareer(report.career.slug)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
                      >
                        (View Role Details)
                      </button>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{report.summaryText}</p>
                </div>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-center">
                    <div className="text-xl font-bold text-slate-100">
                      {report.stats.totalRequiredSkills}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">Required Skills</div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-center">
                    <div className="text-xl font-bold text-emerald-400">
                      {report.stats.strengthsCount}
                    </div>
                    <div className="text-[11px] text-emerald-300 font-medium">Core Strengths</div>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-center">
                    <div className="text-xl font-bold text-cyan-400">
                      {report.stats.developingCount}
                    </div>
                    <div className="text-[11px] text-cyan-300 font-medium">In Development</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-center">
                    <div className="text-xl font-bold text-slate-300">
                      {report.stats.missingCount}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">Missing Skills</div>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 text-center">
                    <div className="text-xl font-bold text-rose-400">
                      {report.stats.criticalGapsCount}
                    </div>
                    <div className="text-[11px] text-rose-300 font-medium">Critical Gaps</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Priority Action Queue — Focus Areas */}
          {report.actionQueue && report.actionQueue.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>🎯</span>
                    <span>Recommended Learning Priority Queue</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Prerequisite-aware ordering: Addresses foundational dependencies first for
                    optimal progression.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {report.actionQueue.slice(0, 3).map((item, idx) => (
                  <div
                    key={item.skillId}
                    className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-lg flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Priority #{idx + 1}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            item.readiness === 'READY'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : item.readiness === 'PARTIALLY_READY'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {item.readiness === 'READY'
                            ? 'Ready'
                            : item.readiness === 'PARTIALLY_READY'
                              ? 'Partial'
                              : 'Blocked'}
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-slate-100 mb-1">{item.skillName}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{item.explanation}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="text-xs text-slate-400">
                        Level: <strong className="text-cyan-400">{item.learnerLevel}</strong> /{' '}
                        {item.requiredLevel}
                      </div>
                      <button
                        onClick={() => setSelectedSkillForModal(item)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                      >
                        Why this first? →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visual Skill Matrix & Filter Tabs */}
          <div className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Comprehensive Skill Matrix</h3>
                <p className="text-xs text-slate-400">
                  Comparing current proficiency against required career mastery.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto">
                {(
                  [
                    { id: 'ALL', label: 'All', count: report.allResults.length },
                    { id: 'CRITICAL', label: 'Critical Gaps', count: report.criticalGaps.length },
                    { id: 'STRENGTHS', label: 'Strengths', count: report.strengths.length },
                    {
                      id: 'DEVELOPING',
                      label: 'Developing',
                      count: report.developingSkills.length,
                    },
                    { id: 'MISSING', label: 'Missing', count: report.missingSkills.length },
                  ] as const
                ).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        activeTab === tab.id
                          ? 'bg-cyan-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Skills Table / Cards */}
            <div className="space-y-3">
              {getFilteredItems().map(item => (
                <div
                  key={item.skillId}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Skill Identity */}
                  <div className="md:w-1/4">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded font-bold uppercase ${
                          item.importance === 'CORE'
                            ? 'bg-rose-500/20 text-rose-300'
                            : item.importance === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {item.importance}
                      </span>
                      <span className="text-[10px] text-slate-400">{item.categoryName}</span>
                    </div>
                    <div className="font-bold text-slate-100 text-base">{item.skillName}</div>
                  </div>

                  {/* Level Comparison Meter */}
                  <div className="md:w-1/3 space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>
                        You: <strong className="text-cyan-400">{item.learnerLevel}/5</strong>
                      </span>
                      <span>
                        Target: <strong className="text-indigo-400">{item.requiredLevel}/5</strong>
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
                      <div
                        className="absolute top-0 bottom-0 bg-indigo-500/30 border-r-2 border-indigo-400"
                        style={{ width: `${(item.requiredLevel / 5) * 100}%` }}
                      />
                      <div
                        className={`h-full rounded-full ${
                          item.learnerLevel >= item.requiredLevel
                            ? 'bg-emerald-500'
                            : item.learnerLevel > 0
                              ? 'bg-cyan-500'
                              : 'bg-transparent'
                        }`}
                        style={{ width: `${(item.learnerLevel / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Status & Priority Badge */}
                  <div className="md:w-1/4 flex items-center justify-between md:justify-end gap-3">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-200">
                        {item.category === 'STRENGTH' ? (
                          <span className="text-emerald-400">✓ Strength</span>
                        ) : item.category === 'DEVELOPING' ? (
                          <span className="text-cyan-400">◐ Developing</span>
                        ) : (
                          <span className="text-slate-400">○ Missing</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.readiness === 'READY'
                          ? 'Ready to Learn'
                          : item.readiness === 'PARTIALLY_READY'
                            ? 'Partially Ready'
                            : 'Prereqs Blocked'}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedSkillForModal(item)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      Why? 🔍
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {/* Explanation Modal */}
      <SkillGapExplanationModal
        item={selectedSkillForModal}
        onClose={() => setSelectedSkillForModal(null)}
      />
    </div>
  );
};

export default SkillGapDashboard;

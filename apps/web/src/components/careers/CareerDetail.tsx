import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Star,
  GitBranch,
  Layers,
  Flame,
  Search,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { apiClient } from '../../services/api-client';
import type { CareerDetailResponse, CareerSkill } from '@pathforge/shared';
import { PrerequisiteGraphView } from './PrerequisiteGraphView';
import { SkillDetailModal } from './SkillDetailModal';

interface CareerDetailProps {
  careerSlug: string;
  onBack: () => void;
  onAnalyzeGap?: (careerSlug: string) => void;
}

const LEVEL_LABELS: Record<number, { label: string; desc: string }> = {
  1: { label: 'Beginner (1/5)', desc: 'Basic terminology & foundational awareness' },
  2: { label: 'Basic (2/5)', desc: 'Can execute guided tasks & syntax fundamentals' },
  3: { label: 'Intermediate (3/5)', desc: 'Autonomous implementation & standard design' },
  4: { label: 'Advanced (4/5)', desc: 'Deep architecture, optimization & edge cases' },
  5: { label: 'Expert (5/5)', desc: 'Domain authority, system-level design & leadership' },
};

export const CareerDetail: React.FC<CareerDetailProps> = ({ careerSlug, onBack, onAnalyzeGap }) => {
  const [data, setData] = useState<CareerDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'graph'>('matrix');
  const [selectedImportance, setSelectedImportance] = useState<string>('ALL');
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [inspectingSkillSlug, setInspectingSkillSlug] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    apiClient
      .getCareerBySlug(careerSlug)
      .then(res => {
        if (isMounted) setData(res);
      })
      .catch(err => {
        if (isMounted) setError(err.message || 'Failed to load career details');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [careerSlug]);

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-24 text-center space-y-3">
        <Loader2 className="w-10 h-10 text-primary-400 animate-spin mx-auto" />
        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
          Loading Career Requirements & Prerequisite Graphs...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error || 'Career not found'}
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
        >
          Return to Career Catalog
        </button>
      </div>
    );
  }

  const { career, skillsByImportance, totalSkillsCount, coreSkillsCount, prerequisiteGraph } = data;

  // Flatten all skills for filtering
  const allSkills: CareerSkill[] = [
    ...skillsByImportance.core,
    ...skillsByImportance.high,
    ...skillsByImportance.medium,
    ...skillsByImportance.optional,
  ];

  const filteredSkills = allSkills.filter(cs => {
    const matchesImportance =
      selectedImportance === 'ALL' ||
      cs.importance.toUpperCase() === selectedImportance.toUpperCase();

    const matchesSearch =
      !skillSearchQuery ||
      cs.skill?.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
      cs.skill?.category.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
      (cs.rationale && cs.rationale.toLowerCase().includes(skillSearchQuery.toLowerCase()));

    return matchesImportance && matchesSearch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Career Explorer
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              onAnalyzeGap
                ? onAnalyzeGap(career.slug)
                : (window.location.hash = `/gap/${career.slug}`)
            }
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-950/40 flex items-center gap-1.5 transition-all"
          >
            <span>⚡</span>
            <span>Analyze My Gap</span>
          </button>
          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            Knowledge Base ID: <span className="text-slate-400">{career.slug}</span>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden border border-slate-800/80">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/40">
              {career.category}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                career.difficulty === 'ENTRY'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : career.difficulty === 'INTERMEDIATE'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                    : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
              }`}
            >
              {career.difficulty} Level
            </span>
            {career.demandLevel === 'VERY_HIGH' && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                Very High Industry Demand
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {career.name}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {career.description}
          </p>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Skills</div>
            <div className="text-xl font-bold text-white mt-0.5">{totalSkillsCount} required</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <div className="text-[11px] text-primary-300 uppercase font-semibold">
              Essential Core
            </div>
            <div className="text-xl font-bold text-primary-400 mt-0.5">
              {coreSkillsCount} core competencies
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">
              Typical Experience
            </div>
            <div className="text-xl font-bold text-slate-200 mt-0.5">
              {career.typicalExperience || '0-2 years'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">
              Prerequisite Nodes
            </div>
            <div className="text-xl font-bold text-slate-200 mt-0.5">
              {prerequisiteGraph.nodes.length} graph nodes
            </div>
          </div>
        </div>
      </div>

      {/* Core Skills Highlight Showcase */}
      {skillsByImportance.core.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              Essential Core Competencies
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Mandatory proficiency benchmarks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillsByImportance.core.map(cs => {
              const lvlInfo = LEVEL_LABELS[cs.requiredLevel] || {
                label: `Level ${cs.requiredLevel}/5`,
                desc: '',
              };

              return (
                <div
                  key={cs.id}
                  onClick={() => setInspectingSkillSlug(cs.skill?.slug || null)}
                  className="glass-panel p-5 rounded-2xl border border-primary-500/30 hover:border-primary-400 transition cursor-pointer flex flex-col justify-between space-y-4 shadow-md group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base group-hover:text-primary-300 transition">
                          {cs.skill?.name}
                        </h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary-500/20 text-primary-300 border border-primary-500/30">
                          CORE
                        </span>
                      </div>

                      <span className="text-xs font-bold text-primary-400 font-mono">
                        {lvlInfo.label}
                      </span>
                    </div>

                    {/* 1-5 Level Visual Meter */}
                    <div className="space-y-1">
                      <div className="flex gap-1.5 h-2">
                        {[1, 2, 3, 4, 5].map(step => (
                          <div
                            key={step}
                            className={`flex-1 rounded-full ${
                              step <= cs.requiredLevel
                                ? 'bg-gradient-to-r from-primary-500 to-accent-teal'
                                : 'bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-400 italic">{lvlInfo.desc}</p>
                    </div>

                    {/* Rationale */}
                    {cs.rationale && (
                      <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                        "{cs.rationale}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                    <span className="font-mono text-[11px]">{cs.skill?.category}</span>
                    <span className="text-primary-400 group-hover:underline flex items-center gap-1 font-semibold text-[11px]">
                      View Prerequisites & Graph <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Tabs Navigation (Skills Matrix vs Prerequisite Graph) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'matrix'
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              Comprehensive Skill Matrix ({allSkills.length})
            </button>

            <button
              onClick={() => setActiveTab('graph')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'graph'
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              Interactive Prerequisite Graph ({prerequisiteGraph.nodes.length} Nodes)
            </button>
          </div>
        </div>

        {/* Tab 1: Comprehensive Skill Matrix */}
        {activeTab === 'matrix' && (
          <div className="space-y-5">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/50 p-3 rounded-2xl border border-slate-800/80">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter skills in this career..."
                  value={skillSearchQuery}
                  onChange={e => setSkillSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* Importance Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {['ALL', 'CORE', 'HIGH', 'MEDIUM', 'OPTIONAL'].map(imp => (
                  <button
                    key={imp}
                    onClick={() => setSelectedImportance(imp)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      selectedImportance === imp
                        ? 'bg-slate-800 text-white border border-primary-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {imp}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills Table / Cards */}
            <div className="grid grid-cols-1 gap-3">
              {filteredSkills.map(cs => {
                const lvlInfo = LEVEL_LABELS[cs.requiredLevel] || {
                  label: `Level ${cs.requiredLevel}/5`,
                  desc: '',
                };

                return (
                  <div
                    key={cs.id}
                    onClick={() => setInspectingSkillSlug(cs.skill?.slug || null)}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                  >
                    {/* Left: Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-sm text-white group-hover:text-primary-300 transition">
                          {cs.skill?.name}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            cs.importance === 'CORE'
                              ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                              : cs.importance === 'HIGH'
                                ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                                : cs.importance === 'MEDIUM'
                                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {cs.importance}
                        </span>

                        <span className="text-[11px] text-slate-500 font-mono">
                          {cs.skill?.category}
                        </span>
                      </div>

                      {cs.rationale && (
                        <p className="text-xs text-slate-400 line-clamp-1">{cs.rationale}</p>
                      )}
                    </div>

                    {/* Right: Required Level Meter */}
                    <div className="flex items-center gap-4 min-w-[220px] justify-between md:justify-end">
                      <div className="text-right space-y-1">
                        <div className="text-xs font-bold text-slate-200 font-mono">
                          {lvlInfo.label}
                        </div>
                        <div className="flex gap-1 h-1.5 w-24">
                          {[1, 2, 3, 4, 5].map(step => (
                            <div
                              key={step}
                              className={`flex-1 rounded-full ${
                                step <= cs.requiredLevel ? 'bg-primary-500' : 'bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary-400 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Prerequisite Graph Visualizer */}
        {activeTab === 'graph' && (
          <PrerequisiteGraphView
            nodes={prerequisiteGraph.nodes}
            edges={prerequisiteGraph.edges}
            onSelectSkill={slug => setInspectingSkillSlug(slug)}
          />
        )}
      </div>

      {/* Skill Detail Modal */}
      <SkillDetailModal
        skillSlug={inspectingSkillSlug}
        onClose={() => setInspectingSkillSlug(null)}
        onSelectSkill={slug => setInspectingSkillSlug(slug)}
      />
    </div>
  );
};

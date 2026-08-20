import React, { useEffect, useState } from 'react';
import { X, BookOpen, ArrowRight, Sparkles, Briefcase, GitFork, Loader2, Tag } from 'lucide-react';
import { apiClient } from '../../services/api-client';
import type { SkillDetailResponse } from '@pathforge/shared';

interface SkillDetailModalProps {
  skillSlug: string | null;
  onClose: () => void;
  onSelectSkill?: (slug: string) => void;
}

export const SkillDetailModal: React.FC<SkillDetailModalProps> = ({
  skillSlug,
  onClose,
  onSelectSkill,
}) => {
  const [data, setData] = useState<SkillDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!skillSlug) {
      setData(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    apiClient
      .getSkillBySlug(skillSlug)
      .then(res => {
        if (isMounted) setData(res);
      })
      .catch(err => {
        if (isMounted) setError(err.message || 'Failed to load skill details');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [skillSlug]);

  if (!skillSlug) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="glass-panel-elevated w-full max-w-2xl rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {data ? data.skill.name : 'Loading Skill...'}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{data?.skill.category || 'Skill Intelligence'}</span>
                {data?.skill.skillType && (
                  <>
                    <span>•</span>
                    <span className="text-primary-300 font-mono text-[11px]">
                      {data.skill.skillType}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center justify-center border border-slate-700/40"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading && (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-primary-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Loading Skill Knowledge...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              {error}
            </div>
          )}

          {data && !isLoading && (
            <>
              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Description & Overview
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/60">
                  {data.skill.description}
                </p>
              </div>

              {/* Aliases */}
              {data.skill.aliases && data.skill.aliases.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-primary-400" />
                    Recognized Aliases & Variations
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {data.skill.aliases.map((alias, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-800/70 border border-slate-700/50 text-slate-300"
                      >
                        {alias}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Prerequisites */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-amber-400/90 uppercase tracking-wider flex items-center gap-1.5">
                  <GitFork className="w-3.5 h-3.5" />
                  Prerequisites (Foundational Skills Required)
                </h4>
                {data.prerequisites.length === 0 ? (
                  <p className="text-xs text-slate-500 italic bg-slate-900/20 p-3 rounded-lg border border-slate-800/40">
                    No strict prerequisites. This is a foundational or entry-level skill.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.prerequisites.map(p => (
                      <div
                        key={p.id}
                        onClick={() => onSelectSkill && onSelectSkill(p.skill.slug)}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 transition cursor-pointer flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                            {p.skill.name}
                          </span>
                          <span
                            className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                              p.strength === 'REQUIRED'
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                                : p.strength === 'RECOMMENDED'
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                  : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                            }`}
                          >
                            {p.strength}
                          </span>
                        </div>
                        {p.rationale && (
                          <p className="text-xs text-slate-400 pl-5">{p.rationale}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dependent Skills */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-primary-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  What Learning This Skill Unlocks (Dependent Skills)
                </h4>
                {data.dependents.length === 0 ? (
                  <p className="text-xs text-slate-500 italic bg-slate-900/20 p-3 rounded-lg border border-slate-800/40">
                    This is a specialized terminal skill in the current curriculum.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {data.dependents.map(d => (
                      <div
                        key={d.id}
                        onClick={() => onSelectSkill && onSelectSkill(d.skill.slug)}
                        className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 hover:border-primary-500/40 transition cursor-pointer flex items-center justify-between"
                      >
                        <span className="text-xs font-medium text-slate-200 truncate">
                          {d.skill.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {d.skill.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Target Careers */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-accent-cyan" />
                  Target Careers Requiring This Skill
                </h4>
                {data.usedInCareers.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    Currently cataloged as a supporting prerequisite.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {data.usedInCareers.map(c => (
                      <div
                        key={c.id}
                        className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/70 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{c.careerName}</div>
                          <div className="text-[10px] text-slate-400">{c.category}</div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              c.importance === 'CORE'
                                ? 'bg-primary-500/20 text-primary-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            Lvl {c.requiredLevel}/5
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  Search,
  Briefcase,
  ArrowRight,
  Sparkles,
  Loader2,
  GraduationCap,
  Flame,
} from 'lucide-react';
import { apiClient } from '../../services/api-client';

const CATEGORIES = [
  'ALL',
  'Engineering',
  'Data & AI',
  'DevOps & Cloud',
  'Security',
  'Quality Assurance',
  'Product & Analytics',
];

interface CareerExplorerProps {
  onSelectCareer: (slug: string) => void;
}

export const CareerExplorer: React.FC<CareerExplorerProps> = ({ onSelectCareer }) => {
  const [careers, setCareers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    apiClient
      .getCareers({
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        search: searchQuery || undefined,
      })
      .then(data => {
        if (isMounted) setCareers(data);
      })
      .catch(err => {
        if (isMounted) setError(err.message || 'Failed to fetch careers');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Phase 2: Career & Skill Intelligence Knowledge Base</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explore Industry <span className="text-gradient">Career Requirements</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Discover what top technical careers expect: essential core skills, required proficiency
          levels (1–5 scale), and verified prerequisite learning graphs.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search careers, technologies, roles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
            />
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Showing <span className="text-white font-bold">{careers.length}</span> curated roles
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20 font-semibold'
                  : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border border-slate-800/80'
              }`}
            >
              {category === 'ALL' ? 'All Domains' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-9 h-9 text-primary-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Querying Career Intelligence Graph...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm text-center">
          {error}
        </div>
      ) : careers.length === 0 ? (
        <div className="py-20 text-center space-y-3 glass-panel rounded-2xl p-8">
          <Briefcase className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No careers match your search</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search terms or clearing the active category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {careers.map(career => {
            const isVeryHighDemand = career.demandLevel === 'VERY_HIGH';

            return (
              <div
                key={career.id}
                onClick={() => onSelectCareer(career.slug)}
                className="group glass-panel rounded-2xl p-5 border border-slate-800/80 hover:border-primary-500/50 transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-primary-500/10"
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300">
                      {career.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isVeryHighDemand && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-400" />
                          High Demand
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          career.difficulty === 'ENTRY'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : career.difficulty === 'INTERMEDIATE'
                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                              : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                        }`}
                      >
                        {career.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Career Title & Description */}
                  <div>
                    <h2 className="text-lg font-bold text-white group-hover:text-primary-300 transition tracking-tight">
                      {career.name}
                    </h2>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {career.description}
                    </p>
                  </div>

                  {/* Core Skills Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold uppercase tracking-wider text-[10px]">
                        Core Requirements:
                      </span>
                      <span className="font-mono text-slate-500">
                        {career.coreSkillsCount} essential
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {career.coreSkillsPreview &&
                        career.coreSkillsPreview.map((sk: any, idx: number) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 flex items-center gap-1.5"
                          >
                            <span>{sk.name}</span>
                            <span className="text-[9px] font-mono font-bold text-primary-400">
                              Lvl {sk.requiredLevel}
                            </span>
                          </span>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                    <span>{career.typicalExperience || '0-2 years'}</span>
                  </div>

                  <span className="text-xs font-semibold text-primary-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Explore Details <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

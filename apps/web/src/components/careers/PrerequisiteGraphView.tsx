import React, { useMemo, useState } from 'react';
import { GitBranch, ArrowRight, Info } from 'lucide-react';
import type { SkillGraphNode, SkillGraphEdge } from '@pathforge/shared';

interface PrerequisiteGraphViewProps {
  nodes: SkillGraphNode[];
  edges: SkillGraphEdge[];
  onSelectSkill: (slug: string) => void;
}

export const PrerequisiteGraphView: React.FC<PrerequisiteGraphViewProps> = ({
  nodes,
  edges,
  onSelectSkill,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Compute node dependencies and tiers (topological depth)
  const { tiers, categories, nodeMap } = useMemo(() => {
    const nodeMap = new Map<string, SkillGraphNode>();
    const categoriesSet = new Set<string>();

    for (const node of nodes) {
      nodeMap.set(node.id, node);
      categoriesSet.add(node.category);
    }

    // inDegree from edges (edges: fromSkillId -> toSkillId, meaning from is prereq, to depends on from)
    const inEdges = new Map<string, string[]>(); // toId -> [fromId]
    const outEdges = new Map<string, string[]>(); // fromId -> [toId]

    for (const node of nodes) {
      inEdges.set(node.id, []);
      outEdges.set(node.id, []);
    }

    for (const edge of edges) {
      if (nodeMap.has(edge.fromSkillId) && nodeMap.has(edge.toSkillId)) {
        inEdges.get(edge.toSkillId)?.push(edge.fromSkillId);
        outEdges.get(edge.fromSkillId)?.push(edge.toSkillId);
      }
    }

    // Calculate tier level (depth) using BFS / longest path from roots
    const tierMap = new Map<string, number>();

    function getDepth(nodeId: string, visited = new Set<string>()): number {
      if (visited.has(nodeId)) return 0;
      visited.add(nodeId);

      const prereqs = inEdges.get(nodeId) || [];
      if (prereqs.length === 0) return 0;

      let maxPrereqDepth = 0;
      for (const p of prereqs) {
        maxPrereqDepth = Math.max(maxPrereqDepth, 1 + getDepth(p, new Set(visited)));
      }
      return maxPrereqDepth;
    }

    for (const node of nodes) {
      tierMap.set(node.id, getDepth(node.id));
    }

    // Group nodes into 4 standardized progression tiers
    const tier0: SkillGraphNode[] = []; // Foundations (Depth 0)
    const tier1: SkillGraphNode[] = []; // Core Technologies (Depth 1)
    const tier2: SkillGraphNode[] = []; // Advanced Concepts (Depth 2)
    const tier3: SkillGraphNode[] = []; // High Level Architecture & Specializations (Depth >= 3)

    for (const node of nodes) {
      const depth = tierMap.get(node.id) || 0;
      if (depth === 0) tier0.push(node);
      else if (depth === 1) tier1.push(node);
      else if (depth === 2) tier2.push(node);
      else tier3.push(node);
    }

    return {
      tiers: [
        {
          name: '1. Foundational Prerequisites',
          desc: 'Core fundamentals & building blocks',
          nodes: tier0,
        },
        {
          name: '2. Core Technologies & Runtimes',
          desc: 'Languages, frameworks & databases',
          nodes: tier1,
        },
        {
          name: '3. Advanced Concepts & Security',
          desc: 'APIs, auth, testing & data modeling',
          nodes: tier2,
        },
        {
          name: '4. Systems Architecture & Specialization',
          desc: 'Distributed design, scaling & cloud',
          nodes: tier3,
        },
      ],
      categories: Array.from(categoriesSet),
      nodeMap,
    };
  }, [nodes, edges]);

  // Find prerequisite relationships for a specific node
  const getPrerequisitesForNode = (nodeId: string) => {
    return edges
      .filter(e => e.toSkillId === nodeId)
      .map(e => ({
        fromNode: nodeMap.get(e.fromSkillId),
        strength: e.strength,
        rationale: e.rationale,
      }))
      .filter(p => p.fromNode !== undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary-400" />
            Skill Prerequisite & Progression Graph
          </h3>
          <p className="text-xs text-slate-400">
            Visualizes how foundational skills progressively build into advanced career
            competencies.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Filter Category:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary-500"
          >
            <option value="ALL">All Categories ({nodes.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progression Flow View */}
      <div className="space-y-6">
        {tiers.map((tier, tierIdx) => {
          const filteredNodes =
            selectedCategory === 'ALL'
              ? tier.nodes
              : tier.nodes.filter(n => n.category === selectedCategory);

          if (filteredNodes.length === 0) return null;

          return (
            <div
              key={tierIdx}
              className="relative rounded-2xl bg-slate-900/40 border border-slate-800/80 p-5 space-y-4 shadow-lg backdrop-blur-sm"
            >
              {/* Tier Header */}
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 font-mono font-bold text-xs flex items-center justify-center border border-primary-500/30">
                    {tierIdx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      {tier.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">{tier.desc}</p>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-500">
                  {filteredNodes.length} skill{filteredNodes.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Node Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredNodes.map(node => {
                  const prereqs = getPrerequisitesForNode(node.id);
                  const isCore = node.isCore || node.importance === 'CORE';

                  return (
                    <div
                      key={node.id}
                      onClick={() => onSelectSkill(node.slug)}
                      className={`group p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isCore
                          ? 'bg-gradient-to-br from-slate-900/90 to-primary-950/30 border-primary-500/40 hover:border-primary-400 shadow-md hover:shadow-primary-500/10'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      {/* Top Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm text-white group-hover:text-primary-300 transition truncate">
                            {node.name}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              isCore
                                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            Lvl {node.requiredLevel || 3}/5
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="truncate">{node.category}</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {node.skillType}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Prerequisites Preview */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                        {prereqs.length > 0 ? (
                          <div className="flex items-center gap-1.5 text-amber-400/90 truncate">
                            <ArrowRight className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                              Requires {prereqs.length} prerequisite
                              {prereqs.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[10px] italic">
                            Foundational entry point
                          </span>
                        )}

                        <span className="text-[10px] text-primary-400 group-hover:underline flex items-center gap-0.5">
                          Inspect <Info className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

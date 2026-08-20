import React, { useState } from 'react';
import { Code2, Plus, Trash2, Loader2 } from 'lucide-react';
import type { LearnerSkill } from '@pathforge/shared';
import apiClient from '../../services/api-client';

interface SkillManagerProps {
  skills: LearnerSkill[];
  onSkillUpdated: () => void;
}

export const SkillManager: React.FC<SkillManagerProps> = ({ skills, onSkillUpdated }) => {
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(3);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setIsAdding(true);
    try {
      await apiClient.addSkill({
        name: newSkillName.trim(),
        selfReportedLevel: newSkillLevel,
      });
      setNewSkillName('');
      onSkillUpdated();
    } catch (err) {
      console.error('Failed to add skill:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSkill = async (id?: string) => {
    if (!id) return;
    setDeletingId(id);
    try {
      await apiClient.deleteSkill(id);
      onSkillUpdated();
    } catch (err) {
      console.error('Failed to delete skill:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary-400" />
          <h3 className="text-sm font-semibold text-white">Skills Matrix ({skills.length})</h3>
        </div>
      </div>

      {/* Add Skill Form */}
      <form onSubmit={handleAddSkill} className="flex gap-2">
        <input
          type="text"
          value={newSkillName}
          onChange={e => setNewSkillName(e.target.value)}
          placeholder="Add new skill (e.g. GraphQL, AWS, Rust)..."
          className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={newSkillLevel}
          onChange={e => setNewSkillLevel(parseInt(e.target.value, 10))}
          className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
        >
          <option value={1}>L1 - Beginner</option>
          <option value={2}>L2 - Basic</option>
          <option value={3}>L3 - Intermediate</option>
          <option value={4}>L4 - Advanced</option>
          <option value={5}>L5 - Expert</option>
        </select>
        <button
          type="submit"
          disabled={isAdding || !newSkillName.trim()}
          className="px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition"
        >
          {isAdding ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          Add
        </button>
      </form>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
        {skills.map(skill => (
          <div
            key={skill.id || skill.name}
            className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2"
          >
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">{skill.name}</span>
              {skill.evidence && (
                <span className="text-[10px] text-slate-500 italic line-clamp-1">
                  {skill.evidence}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(lvl => (
                  <div
                    key={lvl}
                    className={`w-1.5 h-3 rounded-sm ${
                      lvl <= skill.selfReportedLevel ? 'bg-primary-500' : 'bg-slate-800'
                    }`}
                  />
                ))}
                <span className="text-[10px] text-slate-400 font-mono ml-1">
                  L{skill.selfReportedLevel}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteSkill(skill.id)}
                disabled={deletingId === skill.id}
                className="text-slate-500 hover:text-rose-400 p-1 transition"
                title="Remove skill"
              >
                {deletingId === skill.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

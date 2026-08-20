import React, { useState } from 'react';
import { FolderGit2, Plus, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import type { Project } from '@pathforge/shared';
import apiClient from '../../services/api-client';

interface ProjectManagerProps {
  projects: Project[];
  onProjectUpdated: () => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, onProjectUpdated }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [techs, setTechs] = useState('');
  const [url, setUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setIsAdding(true);
    try {
      await apiClient.addProject({
        name: name.trim(),
        description: description.trim(),
        technologies: techs
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        projectUrl: url.trim() || undefined,
      });
      setName('');
      setDescription('');
      setTechs('');
      setUrl('');
      setShowAdd(false);
      onProjectUpdated();
    } catch (err) {
      console.error('Failed to add project:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    setDeletingId(id);
    try {
      await apiClient.deleteProject(id);
      onProjectUpdated();
    } catch (err) {
      console.error('Failed to delete project:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-accent-teal" />
          <h3 className="text-sm font-semibold text-white">
            Verified Projects ({projects.length})
          </h3>
        </div>
        {!showAdd && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 font-medium transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Project
          </button>
        )}
      </div>

      {showAdd && (
        <form
          onSubmit={handleCreate}
          className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-2.5 animate-fade-in"
        >
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Project Name"
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
          />
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Project Description"
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
          />
          <input
            type="text"
            value={techs}
            onChange={e => setTechs(e.target.value)}
            placeholder="Technologies (comma-separated, e.g. React, Node.js, MongoDB)"
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-3 py-1 text-slate-400 hover:text-white text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding || !name.trim() || !description.trim()}
              className="px-3 py-1 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-xs font-semibold"
            >
              {isAdding ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <p className="text-xs text-slate-500">No projects added yet.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {projects.map(p => (
            <div
              key={p.id || p.name}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-white">{p.name}</span>
                  {p.projectUrl && (
                    <a
                      href={p.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-primary-400 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">{p.description}</p>
                {p.technologies && p.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {p.technologies.map(t => (
                      <span
                        key={t}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                disabled={deletingId === p.id}
                className="text-slate-500 hover:text-rose-400 p-1 transition"
              >
                {deletingId === p.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

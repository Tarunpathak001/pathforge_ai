import React, { useState } from 'react';
import { FolderGit2, Plus, Trash2, ExternalLink, BookOpen } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

export const StepProjectsLearning: React.FC = () => {
  const { onboardingState, updateOnboardingData } = useProfile();
  const { projects, learningExperiences, certifications } = onboardingState;

  // New Project Form state
  const [showAddProject, setShowAddProject] = useState(false);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTechs, setProjTechs] = useState('');
  const [projUrl, setProjUrl] = useState('');

  // New Course Form state
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseProvider, setCourseProvider] = useState('');

  // Add Project
  const handleSaveProject = () => {
    if (!projName.trim() || !projDesc.trim()) return;

    const techsArray = projTechs
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    updateOnboardingData({
      projects: [
        ...projects,
        {
          name: projName.trim(),
          description: projDesc.trim(),
          technologies: techsArray,
          projectUrl: projUrl.trim() || undefined,
        },
      ],
    });

    setProjName('');
    setProjDesc('');
    setProjTechs('');
    setProjUrl('');
    setShowAddProject(false);
  };

  const handleDeleteProject = (index: number) => {
    updateOnboardingData({
      projects: projects.filter((_, i) => i !== index),
    });
  };

  // Add Course
  const handleSaveCourse = () => {
    if (!courseName.trim() || !courseProvider.trim()) return;

    updateOnboardingData({
      learningExperiences: [
        ...learningExperiences,
        {
          courseName: courseName.trim(),
          provider: courseProvider.trim(),
          status: 'COMPLETED',
        },
      ],
    });

    setCourseName('');
    setCourseProvider('');
    setShowAddCourse(false);
  };

  const handleDeleteCourse = (index: number) => {
    updateOnboardingData({
      learningExperiences: learningExperiences.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-primary-400 text-xs font-semibold uppercase tracking-wider">
          <FolderGit2 className="w-4 h-4" />
          Step 4: Practical Projects & Learning
        </div>
        <h2 className="text-2xl font-bold text-white">Share what you've built or studied</h2>
        <p className="text-sm text-slate-400">
          Practical projects help PathForge evaluate applied competency. You can add them now or
          skip this step.
        </p>
      </div>

      {/* Projects Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-accent-cyan" />
            Projects ({projects.length})
          </h3>
          {!showAddProject && (
            <button
              type="button"
              onClick={() => setShowAddProject(true)}
              className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 font-medium transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Project
            </button>
          )}
        </div>

        {/* Existing Projects List */}
        {projects.length > 0 && (
          <div className="space-y-2.5">
            {projects.map((proj, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{proj.name}</span>
                    {proj.projectUrl && (
                      <a
                        href={proj.projectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-primary-400 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.technologies.map(t => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteProject(idx)}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                  title="Delete project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Project Form Modal / Inline Box */}
        {showAddProject && (
          <div className="p-4 rounded-xl bg-slate-900 border border-primary-500/40 space-y-3 animate-fade-in">
            <h4 className="text-xs font-semibold text-primary-300 uppercase tracking-wide">
              New Project Details
            </h4>
            <div className="space-y-2">
              <input
                type="text"
                value={projName}
                onChange={e => setProjName(e.target.value)}
                placeholder="Project Name (e.g. Full-Stack E-Commerce App)"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <textarea
                rows={2}
                value={projDesc}
                onChange={e => setProjDesc(e.target.value)}
                placeholder="Description: What did you build, what challenges did you solve?"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                value={projTechs}
                onChange={e => setProjTechs(e.target.value)}
                placeholder="Technologies used (comma separated, e.g. React, Node.js, MongoDB)"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="url"
                value={projUrl}
                onChange={e => setProjUrl(e.target.value)}
                placeholder="Optional Repository or Demo URL"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddProject(false)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProject}
                disabled={!projName.trim() || !projDesc.trim()}
                className="px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-xs font-semibold"
              >
                Save Project
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Courses / Previous Learning Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent-teal" />
            Courses & Certifications ({learningExperiences.length + certifications.length})
          </h3>
          {!showAddCourse && (
            <button
              type="button"
              onClick={() => setShowAddCourse(true)}
              className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 font-medium transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Course
            </button>
          )}
        </div>

        {learningExperiences.length > 0 && (
          <div className="space-y-2">
            {learningExperiences.map((course, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-medium text-xs text-white">{course.courseName}</span>
                  <span className="text-[11px] text-slate-400 ml-2">({course.provider})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteCourse(idx)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {showAddCourse && (
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-2 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={courseName}
                onChange={e => setCourseName(e.target.value)}
                placeholder="Course or Book Name"
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                value={courseProvider}
                onChange={e => setCourseProvider(e.target.value)}
                placeholder="Provider / Platform (e.g. Coursera, Udemy, MIT)"
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddCourse(false)}
                className="px-3 py-1 text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCourse}
                disabled={!courseName.trim() || !courseProvider.trim()}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Add Course
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api-client';
import AssessmentQuizModal from './AssessmentQuizModal';

interface AssessmentListPageProps {
  onAssessmentCompleted?: (result: any) => void;
}

export const AssessmentListPage: React.FC<AssessmentListPageProps> = ({
  onAssessmentCompleted,
}) => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await apiClient.getAssessments();
        setAssessments(data);
      } catch (err) {
        console.error('Failed to load assessments:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleStartQuiz = (id: string) => {
    setActiveAssessmentId(id);
  };

  const getDifficultyBadgeClass = (diff: string) => {
    switch (diff) {
      case 'BEGINNER':
        return 'bg-emerald-950/60 border-emerald-700/50 text-emerald-300';
      case 'INTERMEDIATE':
        return 'bg-indigo-950/60 border-indigo-700/50 text-indigo-300';
      case 'ADVANCED':
        return 'bg-purple-950/60 border-purple-700/50 text-purple-300';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400">Loading Curated Skill Assessments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 border border-indigo-700/50 px-3 py-1 rounded-full">
            Evidence-Based Evaluation
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">
            Skill Assessments & Competency Verification
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            Verify your hands-on mastery through scenario-based assessments. Scores directly update
            your authoritative skill level, resolve career gaps, and unlock downstream roadmap
            milestones.
          </p>
        </div>
      </div>

      {/* Assessment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map(item => (
          <div
            key={item.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-indigo-950/30 group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getDifficultyBadgeClass(
                    item.difficulty
                  )}`}
                >
                  {item.difficulty}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <span>⏱</span> {item.estimatedMinutes} mins
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.skills.map((s: any) => (
                  <span
                    key={s.skillId}
                    className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/60 px-2 py-0.5 rounded-md"
                  >
                    {s.skillName}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                <span>{item.questionsCount || 5} Questions</span> •{' '}
                <span>Pass: {item.passingScore}%</span>
              </div>
              <button
                type="button"
                onClick={() => handleStartQuiz(item.id)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-950/50 transition flex items-center gap-1.5"
              >
                <span>Take Quiz</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quiz Modal */}
      {activeAssessmentId && (
        <AssessmentQuizModal
          assessmentId={activeAssessmentId}
          onClose={() => setActiveAssessmentId(null)}
          onAssessmentCompleted={result => {
            if (onAssessmentCompleted) onAssessmentCompleted(result);
          }}
        />
      )}
    </div>
  );
};

export default AssessmentListPage;

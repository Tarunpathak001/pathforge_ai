import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api-client';
import AdaptiveNotificationBanner from '../adaptive/AdaptiveNotificationBanner';
import AssessmentQuizModal from '../assessments/AssessmentQuizModal';
import FeedbackModal from '../feedback/FeedbackModal';

export const ProgressDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [progressReport, setProgressReport] = useState<any | null>(null);
  const [nextAction, setNextAction] = useState<any | null>(null);
  const [skillStates, setSkillStates] = useState<any[]>([]);
  const [recalculating, setRecalculating] = useState(false);
  const [changeSummary, setChangeSummary] = useState<any | null>(null);

  // Modals state
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeFeedbackResource, setActiveFeedbackResource] = useState<any | null>(null);

  useEffect(() => {
    loadAllProgressData();
  }, []);

  const loadAllProgressData = async () => {
    try {
      setLoading(true);
      const [prog, na, states] = await Promise.all([
        apiClient.getPathProgress().catch(() => null),
        apiClient.getNextAction().catch(() => null),
        apiClient.getSkillStates().catch(() => []),
      ]);

      setProgressReport(prog);
      setNextAction(na);
      setSkillStates(states);
    } catch (err) {
      console.error('Failed to load progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      const summary = await apiClient.recalculateAdaptive();
      setChangeSummary(summary);
      await loadAllProgressData();
    } catch (err) {
      console.error('Recalculation error:', err);
    } finally {
      setRecalculating(false);
    }
  };

  const handleCompleteResource = async (resourceId: string, resourceTitle?: string) => {
    try {
      await apiClient.completeResourceProgress(resourceId);
      // Open feedback modal for prompt
      setActiveFeedbackResource({ id: resourceId, title: resourceTitle });
      // Recalculate adaptive state
      await handleRecalculate();
    } catch (err) {
      console.error('Failed to complete resource:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MASTERED':
        return 'bg-purple-950/60 border-purple-600/40 text-purple-300';
      case 'SATISFIED':
        return 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300';
      case 'DEVELOPING':
        return 'bg-amber-950/60 border-amber-600/40 text-amber-300';
      default:
        return 'bg-rose-950/60 border-rose-600/40 text-rose-300';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400">Loading Progress & Adaptive Engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Top Header & Recalculate CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 border border-indigo-700/40 px-3 py-1 rounded-full">
            Continuous Closed-Loop Adaptation
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            Learning Progress & Skill Intelligence
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Target Career:{' '}
            <strong className="text-indigo-300">
              {progressReport?.careerName || 'Backend Engineer'}
            </strong>
          </p>
        </div>

        <button
          type="button"
          disabled={recalculating}
          onClick={handleRecalculate}
          className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-950/50 transition flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
        >
          <span>{recalculating ? '⚡ Adapting...' : '⚡ Recalculate Adaptation'}</span>
        </button>
      </div>

      {/* Adaptive Change Notification Banner */}
      {changeSummary && (
        <AdaptiveNotificationBanner
          changeSummary={changeSummary}
          onDismiss={() => setChangeSummary(null)}
        />
      )}

      {/* High-Level Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Overall Roadmap Progress
          </div>
          <div className="text-3xl font-black text-indigo-400 mt-2">
            {progressReport?.overallProgressPercent || 0}%
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressReport?.overallProgressPercent || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Hours Completed
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {progressReport?.completedHours || 0}{' '}
            <span className="text-sm font-medium text-slate-400">
              / {progressReport?.totalHours || 0} hrs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Weighted by resource estimates</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Milestones Completed
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">
            {progressReport?.completedMilestones || 0}{' '}
            <span className="text-sm font-medium text-slate-400">
              / {progressReport?.totalMilestones || 0}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Sequential mastery track</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Authoritative Evidence
          </div>
          <div className="text-3xl font-black text-purple-400 mt-2">{skillStates.length}</div>
          <p className="text-xs text-slate-500 mt-2">Skills actively measured & verified</p>
        </div>
      </div>

      {/* Next Best Action Spotlight */}
      {nextAction && (
        <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border-2 border-indigo-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  🎯 Next Best Action
                </span>
                <span className="text-xs text-slate-400">
                  ⏱ ~{nextAction.estimatedMinutes} mins • {nextAction.skillName}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{nextAction.title}</h2>
              <p className="text-sm text-indigo-200/90 leading-relaxed">{nextAction.reason}</p>
            </div>

            <div className="shrink-0">
              {nextAction.type === 'ASSESSMENT' ? (
                <button
                  type="button"
                  onClick={() => setActiveQuizId(nextAction.id)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <span>Take Assessment</span>
                  <span>→</span>
                </button>
              ) : nextAction.type === 'RESOURCE' ? (
                <a
                  href={nextAction.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <span>Launch Resource</span>
                  <span>↗</span>
                </a>
              ) : (
                <a
                  href="#learning-path"
                  className="w-full sm:w-auto px-6 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <span>View Project</span>
                  <span>→</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Authoritative Skill State Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📊</span> Authoritative Skill State & Confidence Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Separates self-reported baseline from measured evidence (assessments, completions, and
              projects).
            </p>
          </div>
          <a
            href="#assessments"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Take Skill Assessments →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillStates.map(st => (
            <div
              key={st.skillId}
              className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">{st.skillName}</h3>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                    st.status
                  )}`}
                >
                  {st.status}
                </span>
              </div>

              {/* Levels Row */}
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Self-Report:</span>
                  <span className="font-semibold text-slate-300">{st.selfReportedLevel} / 5</span>
                </div>
                <div className="text-indigo-400 font-bold text-base">→</div>
                <div>
                  <span className="text-slate-500 block">Inferred Level:</span>
                  <span className="font-bold text-emerald-400">{st.inferredLevel} / 5</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Target:</span>
                  <span className="font-semibold text-indigo-300">{st.targetLevel} / 5</span>
                </div>
              </div>

              {/* Confidence Meter */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Evidence Confidence</span>
                  <span className="text-indigo-300 font-bold">
                    {Math.round(st.confidence * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"
                    style={{ width: `${Math.round(st.confidence * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Milestones Progress Checklist */}
      {progressReport?.milestones && progressReport.milestones.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🗺</span> Sequential Roadmap Milestones
          </h2>

          <div className="space-y-4">
            {progressReport.milestones.map((m: any) => (
              <div
                key={m.milestoneId}
                className={`p-5 rounded-2xl border transition ${
                  m.status === 'COMPLETED'
                    ? 'bg-emerald-950/20 border-emerald-800/40'
                    : m.status === 'IN_PROGRESS'
                    ? 'bg-indigo-950/20 border-indigo-700/50 shadow-md shadow-indigo-950/30'
                    : 'bg-slate-800/30 border-slate-700/40 opacity-70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Milestone {m.order}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          m.status === 'COMPLETED'
                            ? 'bg-emerald-900/50 text-emerald-300'
                            : m.status === 'IN_PROGRESS'
                            ? 'bg-indigo-900/50 text-indigo-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-base mt-1">{m.title}</h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">{m.progressPercent}%</span>
                      <span className="text-xs text-slate-400 ml-2">
                        ({m.completedHours}/{m.totalHours} hrs)
                      </span>
                    </div>
                    {m.status === 'IN_PROGRESS' && (
                      <button
                        type="button"
                        onClick={() => handleCompleteResource(m.milestoneId, m.title)}
                        className="text-xs bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 px-2.5 py-1 rounded-lg transition"
                      >
                        Feedback
                      </button>
                    )}
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${m.progressPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {activeQuizId && (
        <AssessmentQuizModal
          assessmentId={activeQuizId}
          onClose={() => setActiveQuizId(null)}
          onAssessmentCompleted={async () => {
            await handleRecalculate();
          }}
        />
      )}

      {/* Feedback Modal */}
      {activeFeedbackResource && (
        <FeedbackModal
          resourceId={activeFeedbackResource.id}
          resourceTitle={activeFeedbackResource.title}
          onClose={() => setActiveFeedbackResource(null)}
          onSubmitSuccess={async () => {
            await handleRecalculate();
          }}
        />
      )}
    </div>
  );
};

export default ProgressDashboard;

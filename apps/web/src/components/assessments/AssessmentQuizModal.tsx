import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api-client';

interface AssessmentQuizModalProps {
  assessmentId: string;
  onClose: () => void;
  onAssessmentCompleted?: (result: any) => void;
}

export const AssessmentQuizModal: React.FC<AssessmentQuizModalProps> = ({
  assessmentId,
  onClose,
  onAssessmentCompleted,
}) => {
  const [assessment, setAssessment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: number }>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    async function loadAssessment() {
      try {
        setLoading(true);
        const data = await apiClient.getAssessmentById(assessmentId);
        setAssessment(data);
      } catch (err) {
        console.error('Failed to load assessment:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAssessment();
  }, [assessmentId]);

  useEffect(() => {
    if (result) return;
    const interval = setInterval(() => {
      setTimeSpentSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [result]);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    const answersPayload = assessment.questions.map((q: any) => ({
      questionId: q.id,
      selectedAnswer: selectedAnswers[q.id] ?? -1,
    }));

    try {
      setSubmitting(true);
      const attemptResult = await apiClient.submitAssessment(assessment.id, {
        answers: answersPayload,
        timeSpentSeconds,
      });
      setResult(attemptResult);
      if (onAssessmentCompleted) {
        onAssessmentCompleted(attemptResult);
      }
    } catch (err) {
      console.error('Failed to submit assessment attempt:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-300">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading Assessment Questions...</p>
        </div>
      </div>
    );
  }

  if (!assessment || !assessment.questions || assessment.questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md text-center text-slate-300">
          <p className="text-red-400 mb-4">No questions found for this assessment.</p>
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 rounded-xl text-white">
            Close
          </button>
        </div>
      </div>
    );
  }

  const questions = assessment.questions;
  const currentQ = questions[currentQIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(((currentQIndex + 1) / totalQuestions) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-700/40 px-2 py-0.5 rounded-md">
                {assessment.difficulty}
              </span>
              <span className="text-xs text-slate-400">⏱ {formatTimer(timeSpentSeconds)}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">{assessment.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Result View */}
        {result ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold mx-auto mb-3 shadow-lg ${
                  result.passed
                    ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 shadow-emerald-950/50'
                    : 'bg-amber-500/20 border-2 border-amber-500 text-amber-400 shadow-amber-950/50'
                }`}
              >
                {result.score}%
              </div>
              <h3 className="text-2xl font-bold text-white">
                {result.passed ? '🎉 Assessment Passed!' : '📖 Developing Competency'}
              </h3>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                You answered {result.correctCount} of {result.totalQuestions} questions correctly.
                Passing threshold: {result.passingScore}%.
              </p>
            </div>

            {/* Skill Level Updates Notification */}
            {result.skillUpdates && result.skillUpdates.length > 0 && (
              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">
                  ⚡ Authoritative Skill Progression
                </h4>
                <div className="space-y-2">
                  {result.skillUpdates.map((sk: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-white font-medium">{sk.skillName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Level {sk.previousLevel}/5</span>
                        <span className="text-indigo-400 font-bold">→</span>
                        <span className="text-emerald-400 font-bold">Level {sk.newInferredLevel}/5</span>
                        <span className="text-xs bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 px-2 py-0.5 rounded-full">
                          {Math.round(sk.confidence * 100)}% Conf.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths and Review Topics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                  <span>✓</span> Strong Topics
                </h4>
                {result.strongTopics && result.strongTopics.length > 0 ? (
                  <ul className="text-sm text-slate-300 space-y-1">
                    {result.strongTopics.map((topic: string, i: number) => (
                      <li key={i}>• {topic}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">No topics &ge; 75% yet</p>
                )}
              </div>

              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                  <span>📈</span> Needs Practice
                </h4>
                {result.needsReviewTopics && result.needsReviewTopics.length > 0 ? (
                  <ul className="text-sm text-slate-300 space-y-1">
                    {result.needsReviewTopics.map((topic: string, i: number) => (
                      <li key={i}>• {topic}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">None! All topics mastered</p>
                )}
              </div>
            </div>

            {/* Review Explanations Toggle */}
            {showReview && (
              <div className="space-y-4 pt-4 border-t border-slate-800 max-h-72 overflow-y-auto pr-2">
                <h4 className="text-sm font-bold text-white">Answer Breakdown & Explanations</h4>
                {result.answers.map((ans: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border text-xs sm:text-sm ${
                      ans.isCorrect
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                        : 'bg-red-950/20 border-red-800/40 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      <span>{ans.isCorrect ? '✓' : '✗'}</span>
                      <span>Q{idx + 1}: {ans.question}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      <strong>Explanation:</strong> {ans.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowReview(prev => !prev)}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline"
              >
                {showReview ? 'Hide Explanations' : 'Review Explanations & Answers'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm rounded-xl shadow-lg transition"
              >
                Apply to Learning Roadmap →
              </button>
            </div>
          </div>
        ) : (
          /* Quiz Question Flow */
          <div className="p-6 sm:p-8 space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>
                  Question {currentQIndex + 1} of {totalQuestions}
                </span>
                <span>{answeredCount} answered</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {currentQ.skillName || 'Skill Competency'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-white leading-relaxed">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((optText: string, optIdx: number) => {
                  const isSelected = selectedAnswers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full text-left p-4 rounded-xl border transition flex items-start gap-3 ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-950/50'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                          isSelected
                            ? 'border-indigo-400 bg-indigo-500 text-white'
                            : 'border-slate-600 text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="text-sm leading-relaxed">{optText}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quiz Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition disabled:opacity-30"
              >
                ← Previous
              </button>

              {currentQIndex === totalQuestions - 1 ? (
                <button
                  type="button"
                  disabled={submitting || answeredCount === 0}
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Evaluating...' : 'Submit Assessment ✓'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentQIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md transition"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentQuizModal;

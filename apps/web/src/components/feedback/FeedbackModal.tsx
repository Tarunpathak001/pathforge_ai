import React, { useState } from 'react';
import apiClient from '../../services/api-client';

interface FeedbackModalProps {
  resourceId?: string;
  resourceTitle?: string;
  milestoneId?: string;
  milestoneTitle?: string;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  resourceId,
  resourceTitle,
  milestoneId,
  milestoneTitle,
  onClose,
  onSubmitSuccess,
}) => {
  const [feedbackType, setFeedbackType] = useState<string>('JUST_RIGHT');
  const [rating, setRating] = useState<number>(4);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const feedbackOptions = [
    { value: 'TOO_EASY', label: 'Too Easy', desc: 'Material was below my skill level' },
    { value: 'JUST_RIGHT', label: 'Just Right', desc: 'Challenging and highly relevant' },
    { value: 'TOO_DIFFICULT', label: 'Too Difficult', desc: 'Needed more prerequisite foundations' },
    { value: 'NOT_RELEVANT', label: 'Not Relevant', desc: 'Content did not match my career goal' },
    { value: 'VERY_USEFUL', label: 'Very Useful', desc: 'High quality and actionable' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.submitFeedback({
        resourceId,
        milestoneId,
        feedbackType,
        rating,
        comment: comment.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        if (onSubmitSuccess) onSubmitSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>💬</span> Resource Feedback
            </h3>
            <p className="text-sm text-slate-400 mt-0.5 truncate max-w-sm">
              {resourceTitle || milestoneTitle || 'Help PathForge adapt to your learning pace'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
              ✓
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Thank You!</h4>
            <p className="text-sm text-slate-400">
              Your feedback is factored into future recommendation rankings and path adjustments.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Feedback Type Buttons */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                How was this material for you?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {feedbackOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFeedbackType(opt.value)}
                    className={`p-3 rounded-xl text-left border transition ${
                      feedbackType === opt.value
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Rating (1 to 5 Stars)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl transition hover:scale-110 ${
                      star <= rating ? 'text-amber-400' : 'text-slate-600'
                    }`}
                  >
                    ★
                  </button>
                ))}
                <span className="text-xs text-slate-400 ml-2">({rating} / 5)</span>
              </div>
            </div>

            {/* Optional Comment */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Additional Comments (Optional)
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="What worked well? What could be improved?"
                rows={3}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm rounded-xl shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;

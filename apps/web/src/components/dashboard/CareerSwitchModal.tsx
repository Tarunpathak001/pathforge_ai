import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api-client';

interface CareerSwitchModalProps {
  currentCareerSlug: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectCareer: (careerSlug: string) => void;
}

export const CareerSwitchModal: React.FC<CareerSwitchModalProps> = ({
  currentCareerSlug,
  isOpen,
  onClose,
  onSelectCareer,
}) => {
  const [careers, setCareers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      apiClient
        .getCareers()
        .then(res => {
          setCareers(res || []);
        })
        .catch(err => {
          console.error('Failed to load careers:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSwitch = async (slug: string) => {
    setSwitching(true);
    try {
      await onSelectCareer(slug);
      onClose();
    } catch (err) {
      console.error('Failed to switch career:', err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🎯</span> Switch Target Career
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Select a target role. PathForge will re-evaluate your skill alignment and adaptive roadmap.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            careers.map(c => {
              const isCurrent = c.slug === currentCareerSlug;
              return (
                <div
                  key={c.id}
                  onClick={() => !switching && handleSwitch(c.slug)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isCurrent
                      ? 'border-indigo-500/80 bg-indigo-950/30'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-800/40 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{c.name}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          Active Goal
                        </span>
                      )}
                      <span className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {c.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{c.description}</p>
                  </div>
                  <button
                    disabled={isCurrent || switching}
                    className={`ml-4 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isCurrent
                        ? 'bg-slate-800 text-slate-500 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isCurrent ? 'Selected' : switching ? 'Switching...' : 'Switch'}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

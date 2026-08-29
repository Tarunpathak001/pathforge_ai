import React from 'react';
import { Sparkles } from 'lucide-react';

interface AskCopilotButtonProps {
  label?: string;
  contextPrompt?: string;
  contextPayload?: Record<string, any>;
  onClick: (prompt?: string, payload?: Record<string, any>) => void;
  className?: string;
}

export const AskCopilotButton: React.FC<AskCopilotButtonProps> = ({
  label = 'Ask PathForge Copilot',
  contextPrompt,
  contextPayload,
  onClick,
  className = '',
}) => {
  return (
    <button
      onClick={() => onClick(contextPrompt, contextPayload)}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold shadow-sm transition-all transform active:scale-98 ${className}`}
    >
      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
      <span>{label}</span>
    </button>
  );
};

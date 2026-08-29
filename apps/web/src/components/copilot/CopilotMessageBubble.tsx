import React from 'react';
import { Bot, User, Sparkles, ArrowRight } from 'lucide-react';
import type { CopilotMessage, CopilotAction } from '@pathforge/shared';

interface CopilotMessageBubbleProps {
  message: CopilotMessage;
  onExecuteAction?: (action: CopilotAction) => void;
}

export const CopilotMessageBubble: React.FC<CopilotMessageBubbleProps> = ({
  message,
  onExecuteAction,
}) => {
  const isUser = message.role === 'USER';

  return (
    <div className={`flex gap-3.5 my-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
          isUser
            ? 'bg-indigo-600 text-white shadow-indigo-600/30'
            : 'bg-slate-800 border border-slate-700 text-cyan-400'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble Container */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-900/30'
              : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-sm shadow-lg'
          }`}
        >
          {/* Header for Assistant */}
          {!isUser && (
            <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-800/80 text-[11px] text-slate-400 font-medium">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span className="text-slate-300 font-semibold">PathForge Copilot</span>
              {message.intent && (
                <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-400 font-mono">
                  {message.intent}
                </span>
              )}
            </div>
          )}

          {/* Body Content with Paragraph Rendering */}
          <div className="space-y-2.5 whitespace-pre-line font-normal">
            {message.content}
          </div>

          {/* Grounding Source Tags */}
          {!isUser && message.groundingSources && message.groundingSources.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
              <span className="text-slate-500 font-medium">Grounded in:</span>
              {message.groundingSources.map((src, i) => (
                <span
                  key={i}
                  className="bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-md text-slate-300 font-mono text-[10px]"
                >
                  ✓ {src}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Suggested Actions CTA Chips */}
        {!isUser && message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {message.suggestedActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => onExecuteAction && onExecuteAction(action)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold shadow-sm transition-all transform active:scale-98"
              >
                <span>{action.title}</span>
                <ArrowRight className="w-3 h-3 text-indigo-400" />
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-slate-500 px-1 font-mono">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

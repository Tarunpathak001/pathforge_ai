import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Loader2, RotateCcw } from 'lucide-react';
import { apiClient } from '../../services/api-client.js';
import type { CopilotMessage, ConversationSummary, CopilotAction } from '@pathforge/shared';
import { CopilotSidebar } from './CopilotSidebar.js';
import { CopilotMessageBubble } from './CopilotMessageBubble.js';
import { CopilotStarterChips } from './CopilotStarterChips.js';

interface CopilotChatPageProps {
  onNavigateTab: (tabId: string) => void;
  initialPrompt?: string;
  initialContextPayload?: Record<string, any>;
}

export const CopilotChatPage: React.FC<CopilotChatPageProps> = ({
  onNavigateTab,
  initialPrompt,
  initialContextPayload,
}) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Load Conversations on Mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const list = await apiClient.getConversations();
      setConversations(list || []);

      if (initialPrompt) {
        handleCreateNewConversation(initialPrompt, initialContextPayload);
      } else if (list && list.length > 0 && list[0]?.id) {
        handleSelectConversation(list[0].id);
      } else {
        handleCreateNewConversation();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = async (conversationId: string) => {
    try {
      setActiveConversationId(conversationId);
      setIsGenerating(true);
      const res = await apiClient.getConversationById(conversationId);
      setMessages(res?.messages || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load conversation thread');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateNewConversation = async (initialMsg?: string, payload?: Record<string, any>) => {
    try {
      setIsGenerating(true);
      const res = await apiClient.createConversation({
        initialMessage: initialMsg,
        contextPayload: payload,
      });

      const newId = res.conversationId;
      setActiveConversationId(newId);

      // Refresh list
      const list = await apiClient.getConversations();
      setConversations(list || []);

      if (initialMsg && res.initialResponse) {
        const threadRes = await apiClient.getConversationById(newId);
        setMessages(threadRes?.messages || []);
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create conversation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.deleteConversation(conversationId);
      const updated = conversations.filter(c => c.id !== conversationId);
      setConversations(updated);

      if (activeConversationId === conversationId) {
        if (updated.length > 0 && updated[0]?.id) {
          handleSelectConversation(updated[0].id);
        } else {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete conversation');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputContent).trim();
    if (!text || isGenerating) return;

    setInputContent('');
    setError(null);

    let convId = activeConversationId;
    if (!convId) {
      const createRes = await apiClient.createConversation();
      convId = createRes.conversationId;
      setActiveConversationId(convId);
    }

    if (!convId) return;

    const tempUserMsg: CopilotMessage = {
      id: `temp-${Date.now()}`,
      conversationId: convId,
      role: 'USER',
      content: text,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsGenerating(true);

    try {
      const assistantMsg = await apiClient.sendCopilotMessage(convId, {
        content: text,
      });

      setMessages(prev => [...prev, assistantMsg]);

      // Update sidebar conversation list
      const list = await apiClient.getConversations();
      setConversations(list || []);
    } catch (err: any) {
      setError(err.message || 'Copilot service temporarily unavailable.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExecuteAction = (action: CopilotAction) => {
    switch (action.type) {
      case 'OPEN_RESOURCE':
      case 'OPEN_PATH':
      case 'OPEN_MILESTONE':
        onNavigateTab('path');
        break;
      case 'OPEN_ASSESSMENT':
        onNavigateTab('assessments');
        break;
      case 'OPEN_GAP_ANALYSIS':
      case 'OPEN_SKILL':
        onNavigateTab('gap');
        break;
      case 'OPEN_RECOMMENDATIONS':
        onNavigateTab('recommendations');
        break;
      case 'OPEN_DASHBOARD':
      default:
        onNavigateTab('dashboard');
        break;
    }
  };

  return (
    <div className="w-full h-[calc(100vh-8.5rem)] flex flex-col md:flex-row bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
      {/* Left Sidebar */}
      <CopilotSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={() => handleCreateNewConversation()}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main Chat Thread Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden">
        {/* Top Chat Header */}
        <div className="px-6 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight">Career Copilot</h1>
              <p className="text-[10px] text-slate-400">Grounded Career Intelligence & Learning Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="hidden sm:inline bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-full text-[11px] text-slate-300 font-mono">
              Deterministic Grounding Active
            </span>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Initializing grounded copilot session...</p>
            </div>
          ) : messages.length === 0 ? (
            <CopilotStarterChips onSelectPrompt={handleSendMessage} />
          ) : (
            messages.map((msg, idx) => (
              <CopilotMessageBubble
                key={msg.id || idx}
                message={msg}
                onExecuteAction={handleExecuteAction}
              />
            ))
          )}

          {/* Typing / Generating Indicator */}
          {isGenerating && (
            <div className="flex items-center gap-3 text-xs text-slate-400 italic py-2">
              <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <span>Copilot is reasoning over your PathForge state...</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => activeConversationId && handleSelectConversation(activeConversationId)}
                className="flex items-center gap-1 underline text-rose-400 hover:text-white"
              >
                <RotateCcw className="w-3 h-3" /> Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2 max-w-4xl mx-auto"
          >
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl focus-within:border-indigo-500 transition-colors p-2 shadow-inner">
              <textarea
                value={inputContent}
                onChange={e => setInputContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your skill gaps, active roadmap, weekly study plan, or next action... (Enter to send)"
                rows={2}
                maxLength={2000}
                className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 pt-1">
                <span>Shift + Enter for new line</span>
                <span>{inputContent.length}/2000</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!inputContent.trim() || isGenerating}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all shrink-0"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CopilotChatPage;

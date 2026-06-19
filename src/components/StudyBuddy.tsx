import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { Send, GraduationCap, Compass, HelpCircle, Loader2, RefreshCw } from 'lucide-react';

interface StudyBuddyProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  subject: string;
  notesContext: string;
  onClearHistory: () => void;
}

const PRESET_PROMPTS = [
  "Explain using a simple real-world analogy",
  "Summarize key takeaways in children terms",
  "Give me a quick 1-sentence memory trick",
  "Quiz me on one vocab term!"
];

export default function StudyBuddy({
  messages,
  onSendMessage,
  isLoading,
  subject,
  notesContext,
  onClearHistory
}: StudyBuddyProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new chats
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim());
      setInputText("");
    }
  };

  const handlePromptChipClick = (suggestion: string) => {
    if (!isLoading) {
      onSendMessage(suggestion);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs" id="chat-widget">
      {/* Sidebar header */}
      <div className="p-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800" id="chat-header">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-neutral-800 rounded-lg text-amber-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight leading-tight">
              Professor Sage
            </h3>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono block mt-0.5">
              Classroom Companion
            </span>
          </div>
        </div>

        <button
          id="clear-chat-btn"
          onClick={onClearHistory}
          disabled={messages.length <= 1}
          className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed outline-none"
          title="Clear session history"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Message list area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[480px] bg-neutral-50/50" id="chat-log-viewport">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              id={`chat-bubble-${msg.id}`}
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${isUser ? "ml-auto items-end" : "mr-auto items-start"}`}
            >
              <div
                className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? "bg-neutral-900 text-white rounded-tr-none"
                    : "bg-white text-neutral-800 border border-neutral-100 shadow-xs rounded-tl-none font-normal"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] font-mono text-neutral-400 mt-1 uppercase">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2.5 mr-auto max-w-[85%] animate-pulse" id="chat-bubble-loading">
            <div className="p-3.5 bg-white border border-neutral-100 rounded-2xl rounded-tl-none shadow-xs text-xs text-neutral-500 font-medium flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-neutral-400 animate-spin" />
              Professor Sage is thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips or Helper guidelines */}
      <div className="p-3.5 border-t border-neutral-100 bg-white" id="suggested-chips-block">
        <span className="text-[9px] font-bold font-mono text-neutral-400 uppercase tracking-widest block mb-2">
          Ask Professor Sage
        </span>
        <div className="flex flex-wrap gap-1.5" id="preset-study-chips">
          {PRESET_PROMPTS.map((prompt) => (
            <button
              id={`suggested-chip-${prompt.toLowerCase().replace(/\s+/g, '-')}`}
              key={prompt}
              type="button"
              disabled={isLoading}
              onClick={() => handlePromptChipClick(prompt)}
              className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-[11px] font-sans font-medium text-neutral-600 transition cursor-pointer text-left outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input submission box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-neutral-100 bg-neutral-50" id="chat-input-form">
        <div className="relative flex items-center bg-white rounded-xl border border-neutral-200 px-3 py-1.5 focus-within:ring-2 focus-within:ring-neutral-800 focus-within:border-transparent transition">
          <input
            id="chat-input-text-field"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder={`Ask about ${subject || "course material"}...`}
            className="w-full bg-transparent border-none text-xs text-neutral-800 placeholder-neutral-400 font-sans font-normal py-1.5 focus:outline-none"
          />
          <button
            id="chat-send-btn"
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2 ml-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 disabled:text-neutral-200 disabled:hover:bg-transparent rounded-lg transition shrink-0 outline-none cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

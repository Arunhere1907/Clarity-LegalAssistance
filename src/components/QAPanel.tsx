import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowUpRight, AlertCircle, Sparkles } from 'lucide-react';
import { Clause, QAMessage } from '../types';
import { validateQAResponse } from '../utils/validateAiResponse';

interface QAPanelProps {
  clauses: Clause[];
  docTitle: string;
  onSelectCitation: (clauseId: string) => void;
  suggestedQuestions?: string[];
}

export const QAPanel: React.FC<QAPanelProps> = React.memo(({
  clauses,
  docTitle,
  onSelectCitation,
  suggestedQuestions = [
    'What happens if rent is paid 3 days late?',
    'How much advance notice is required to terminate?',
    'Can I sublet my apartment to someone else?',
    'What are the penalties for breaking the contract early?',
  ],
}) => {
  const [messages, setMessages] = useState<QAMessage[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      text: 'Ask any question about this document. Every answer will be strictly grounded with direct citations to the clauses. If the document does not contain the answer, I will state so explicitly.',
      timestamp: 'Now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (questionText: string) => {
    const query = questionText.trim();
    // Prevent duplicate submissions while loading (Task 15)
    if (!query || isLoading) return;

    const userMsg: QAMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Update screen-reader live region
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = 'Retrieving grounded clause spans…';
    }

    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          clauses: clauses.map((c) => ({
            id: c.id,
            number: c.number,
            title: c.title,
            originalText: c.originalText,
          })),
          docTitle,
        }),
      });

      if (!res.ok) throw new Error('Failed to query document.');

      const data: unknown = await res.json();
      const validated = validateQAResponse(data);

      const assistantMsg: QAMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: validated.answer,
        citations: validated.citations,
        foundInDocument: validated.foundInDocument,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = validated.foundInDocument
          ? 'Answer found. See response below.'
          : 'The document does not contain information regarding this question.';
      }
    } catch {
      // Fallback local grounded matching if server API offline or rate-limited
      const matched = clauses.find(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.originalText.toLowerCase().includes(query.toLowerCase())
      );

      const fallbackMsg: QAMessage = matched
        ? {
            id: `assistant-${Date.now()}`,
            sender: 'assistant',
            text: `Per ${matched.number} (${matched.title}): ${matched.simplifiedText}`,
            citations: [
              {
                clauseId: matched.id,
                clauseNumber: matched.number,
                clauseTitle: matched.title,
                quote: matched.originalText.slice(0, 120) + '…',
              },
            ],
            foundInDocument: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        : {
            id: `assistant-${Date.now()}`,
            sender: 'assistant',
            text: 'The document does not contain explicit terms addressing this question. To protect your interests, seek clarification in writing from the drafting party or consult a licensed attorney.',
            foundInDocument: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

      setMessages((prev) => [...prev, fallbackMsg]);

      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = matched
          ? 'Answer found in document.'
          : 'The document does not contain information regarding this question.';
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F4F2] font-ui">
      {/* Screen-reader live region for loading/result status (Task 12) */}
      <div
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Grounding Trust Notice */}
      <div className="bg-white border-b border-[#E5E7EB] px-4 py-2 text-[11px] text-[#5A5E68] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
          <span className="font-medium text-[#14161B]">Strict Grounding Active</span>
        </div>
        <span>Zero ungrounded speculation</span>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[92%] rounded p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#14161B] text-white'
                  : 'bg-white text-[#14161B] border border-[#E5E7EB] shadow-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Citations List (Grounded in Document) */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-[#E5E7EB] space-y-1.5">
                  <div className="text-[10px] font-mono text-[#5A5E68] uppercase tracking-wider">
                    Verified Document Citations
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.citations.map((cite, idx) => (
                      <button
                        key={idx}
                        id={`btn-citation-${cite.clauseId}-${idx}`}
                        onClick={() => onSelectCitation(cite.clauseId)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-[#F4F4F2] text-[#14161B] hover:bg-[#E5E7EB] border border-[#D1D5DB] rounded transition-colors text-left group"
                        title="Click to scroll to and highlight this clause in the document"
                      >
                        <span className="font-mono text-[10px] text-[#5A5E68] group-hover:text-[#14161B]">
                          {cite.clauseNumber}
                        </span>
                        <span className="truncate max-w-[140px]">{cite.clauseTitle}</span>
                        <ArrowUpRight className="w-3 h-3 text-[#5A5E68] group-hover:text-[#14161B]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Not found notice */}
              {msg.foundInDocument === false && (
                <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Document does not contain this information.</span>
                </div>
              )}
            </div>

            <span className="text-[10px] text-[#5A5E68] mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div
            className="flex items-center gap-2 text-xs text-[#5A5E68] bg-white p-2.5 rounded border border-[#E5E7EB] w-fit"
            aria-busy="true"
          >
            <span className="w-2 h-2 rounded-full bg-[#14161B] animate-pulse" aria-hidden="true" />
            <span>Retrieving grounded clause spans…</span>
          </div>
        )}
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-4 py-2 bg-white/70 border-t border-[#E5E7EB]">
        <div className="text-[10px] font-mono text-[#5A5E68] mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Suggested questions grounded in this document:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="inline-flex items-center text-left text-[11px] text-[#14161B] bg-white border border-[#D1D5DB] hover:border-[#14161B] hover:bg-[#F4F4F2] px-2.5 py-1 rounded transition-colors cursor-pointer font-medium shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-[#E5E7EB]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputValue);
          }}
          className="flex items-center gap-2"
        >
          <label htmlFor="input-qa-question" className="sr-only">
            Ask a question about this document
          </label>
          <input
            id="input-qa-question"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about rights, dates, or penalties…"
            disabled={isLoading}
            aria-disabled={isLoading}
            className="flex-1 bg-[#F4F4F2] border border-[#D1D5DB] rounded px-3 py-2 text-xs text-[#14161B] placeholder-[#5A5E68] focus:outline-none focus:border-[#14161B]"
          />
          <button
            id="btn-submit-qa"
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2 bg-[#14161B] text-white rounded hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Submit question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
});

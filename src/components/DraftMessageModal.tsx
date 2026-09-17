import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Copy, Check, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { Clause, DraftMessageResult } from '../types';
import { validateDraftMessageResult } from '../utils/validateAiResponse';

interface DraftMessageModalProps {
  clause: Clause | null;
  isOpen: boolean;
  onClose: () => void;
  docTitle?: string;
  docType?: string;
}

export const DraftMessageModal: React.FC<DraftMessageModalProps> = ({
  clause,
  isOpen,
  onClose,
  docTitle = 'Agreement',
  docType = 'contract'
}) => {
  const [draft, setDraft] = useState<DraftMessageResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Generate deterministic base draft from clause's existing suggested-negotiation-strategy text
  const generateBaseDraft = (c: Clause): DraftMessageResult => {
    const isLease = docType === 'lease' || c.originalText.toLowerCase().includes('tenant') || c.originalText.toLowerCase().includes('rent');
    const isEmp = docType === 'employment' || c.originalText.toLowerCase().includes('employee') || c.originalText.toLowerCase().includes('salary');
    
    const recipient = isLease 
      ? 'Landlord / Property Manager' 
      : isEmp 
      ? 'Hiring Team / HR' 
      : 'Counterparty Legal & Commercial Lead';

    const subject = `Proposed Adjustment to ${c.number} (${c.title}) — ${docTitle}`;
    
    const strategy = c.suggestedNegotiationStrategy || c.tagReason || 'update this provision to align with standard commercial norms.';

    const body = `Dear ${recipient},

Thank you for providing the ${docTitle}. I am enthusiastic about moving forward and have completed an initial review of the draft terms.

Regarding ${c.number} (${c.title}): I wanted to request a modest adjustment to ensure the agreement reflects customary industry standards.

Specific Proposal:
${strategy}

Could we agree to amend this section accordingly, or incorporate this adjustment into a brief addendum?

Thank you for your flexibility, and I look forward to finalizing the agreement.

Best regards,`;

    return {
      recipient,
      subject,
      body,
      talkingPoints: [
        'Frames the request as standard practice rather than an adversarial objection.',
        'Directly offers the concrete change to make counterparty review seamless.',
        'Signals immediate readiness to sign once this point is resolved.'
      ]
    };
  };

  const fetchDraft = async (c: Clause) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/draft-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clauseTitle: `${c.number}: ${c.title}`,
          originalText: c.originalText,
          tag: c.tag,
          tagReason: c.tagReason,
          suggestedStrategy: c.suggestedNegotiationStrategy,
          docTitle,
          docType
        })
      });

      if (!res.ok) throw new Error('API error');
      const data: unknown = await res.json();
      setDraft(validateDraftMessageResult(data, `Re: ${c.number} (${c.title})`));
    } catch {
      setDraft(generateBaseDraft(c));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (clause && isOpen) {
      setCopied(false);
      fetchDraft(clause);
    }
  }, [clause, isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen) headingRef.current?.focus();
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !clause) return null;

  const handleCopy = () => {
    if (!draft) return;
    const fullText = `To: ${draft.recipient}\nSubject: ${draft.subject}\n\n${draft.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs font-ui"
      role="dialog"
      aria-modal="true"
      aria-labelledby="draft-message-modal-title"
    >
      <div className="bg-white border border-[#14161B] w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB] bg-[#F4F4F2]">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#14161B]" />
            <h2
              id="draft-message-modal-title"
              ref={headingRef}
              tabIndex={-1}
              className="text-sm font-semibold text-[#14161B] focus:outline-none"
            >
              Draft Counterparty Message
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#5A5E68] hover:text-[#14161B] hover:bg-[#E5E7EB]"
            aria-label="Close draft message modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Targeted Clause Bar */}
          <div className="bg-[#F9F9F8] p-3 border border-[#E5E7EB] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-semibold text-[#14161B]">
                {clause.number}: {clause.title}
              </span>
              <span
                className={`text-[10px] uppercase tracking-wider px-2 py-0.5 font-medium ${
                  clause.tag === 'high-attention'
                    ? 'bg-red-50 text-[#8B2E2E] border border-[#8B2E2E]/30'
                    : 'bg-amber-50 text-[#B8860B] border border-[#B8860B]/30'
                }`}
              >
                {clause.tag}
              </span>
            </div>
            {clause.suggestedNegotiationStrategy && (
              <p className="text-[11px] text-[#5A5E68]">
                <strong className="text-[#14161B]">Strategy: </strong>
                {clause.suggestedNegotiationStrategy}
              </p>
            )}
          </div>

          {/* Email Preview Fields */}
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#5A5E68]">
              <RefreshCw className="w-5 h-5 animate-spin text-[#14161B]" />
              <span>Drafting negotiation message from clause strategy...</span>
            </div>
          ) : draft ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#5A5E68] uppercase tracking-wider">
                  Recipient
                </label>
                <input
                  type="text"
                  value={draft.recipient}
                  onChange={(e) => setDraft({ ...draft, recipient: e.target.value })}
                  className="w-full border border-[#D1D5DB] px-3 py-1.5 text-xs text-[#14161B] focus:outline-none focus:border-[#14161B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#5A5E68] uppercase tracking-wider">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={draft.subject}
                  onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                  className="w-full border border-[#D1D5DB] px-3 py-1.5 text-xs text-[#14161B] font-medium focus:outline-none focus:border-[#14161B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#5A5E68] uppercase tracking-wider">
                  Message Body
                </label>
                <textarea
                  rows={9}
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  className="w-full border border-[#D1D5DB] p-3 text-xs text-[#14161B] font-document leading-relaxed focus:outline-none focus:border-[#14161B]"
                />
              </div>

              {/* Talking Points */}
              {draft.talkingPoints && draft.talkingPoints.length > 0 && (
                <div className="bg-[#F9F9F8] border border-[#E5E7EB] p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#14161B]">
                    <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                    <span>Key Talking Points if Counterparty Pushes Back:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-[#5A5E68] pl-1">
                    {draft.talkingPoints.map((tp, idx) => (
                      <li key={idx}>{tp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F4F4F2] space-y-2">
          {/* AI-generated draft disclaimer */}
          <div className="flex items-center gap-1.5 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>
              <strong>AI-generated draft — not legal advice.</strong> Review and edit before sending. Consult a qualified legal professional if needed.
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={() => clause && fetchDraft(clause)}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-[#5A5E68] hover:text-[#14161B] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!draft}
                className="px-3.5 py-1.5 bg-[#14161B] text-white rounded-none hover:bg-black transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Message</span>
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-white border border-[#D1D5DB] text-xs text-[#14161B] hover:bg-[#E5E7EB]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

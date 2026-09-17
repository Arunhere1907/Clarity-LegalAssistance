import React, { useState, useEffect, useRef } from 'react';
import { X, GitCompare, Copy, Check, RefreshCw, Sparkles, Split, FileText, AlertTriangle } from 'lucide-react';
import { Clause, FairerLanguageResult } from '../types';
import { computeWordDiff, DiffToken } from '../utils/diffHelper';
import { validateFairerLanguageResult } from '../utils/validateAiResponse';
import { clauseCache } from '../utils/clauseCache';

interface FairerLanguageModalProps {
  clause: Clause | null;
  isOpen: boolean;
  onClose: () => void;
  docType?: string;
}

export const FairerLanguageModal: React.FC<FairerLanguageModalProps> = ({
  clause,
  isOpen,
  onClose,
  docType = 'contract'
}) => {
  const [result, setResult] = useState<FairerLanguageResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'redline' | 'side-by-side'>('redline');
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Generate deterministic base replacement from clause's existing suggested-replacement-text or rules
  const generateBaseReplacement = (c: Clause): FairerLanguageResult => {
    const replacement = c.suggestedReplacementText || c.simplifiedText;
    return {
      replacementText: replacement,
      rationale: c.tagReason 
        ? `Addresses the flagged issue: "${c.tagReason}". Eliminates predatory unilateral language while establishing standard, balanced protections.`
        : 'Replaces one-sided restrictions with bilateral covenants standard for this type of agreement.',
      keyChanges: [
        'Removes unilateral penalties and non-standard enforcement traps.',
        'Substitutes commercially customary notice periods and reasonable standard terms.',
        'Preserves legitimate mutual protections without overreaching.'
      ]
    };
  };

  const fetchFairerLanguage = async (c: Clause) => {
    // Check cache first
    const cachedResult = clauseCache.get<FairerLanguageResult>(c.id, 'fairer');
    if (cachedResult) {
      setResult(cachedResult);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/suggest-fairer-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clauseTitle: `${c.number}: ${c.title}`,
          originalText: c.originalText,
          tag: c.tag,
          tagReason: c.tagReason,
          suggestedReplacementText: c.suggestedReplacementText,
          docType
        })
      });

      if (!res.ok) throw new Error('API error');
      const data: unknown = await res.json();
      const validatedResult = validateFairerLanguageResult(data, c.originalText);
      
      // Cache the result
      clauseCache.set(c.id, 'fairer', validatedResult);
      setResult(validatedResult);
    } catch {
      const fallbackResult = generateBaseReplacement(c);
      setResult(fallbackResult);
      // Don't cache fallback results
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (clause && isOpen) {
      setCopied(false);
      fetchFairerLanguage(clause);
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
    if (!result) return;
    navigator.clipboard.writeText(result.replacementText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const diffTokens: DiffToken[] = result
    ? computeWordDiff(clause.originalText, result.replacementText)
    : [];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs font-ui"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fairer-language-modal-title"
    >
      <div className="bg-white border border-[#14161B] w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB] bg-[#F4F4F2]">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-[#14161B]" />
            <h2
              id="fairer-language-modal-title"
              ref={headingRef}
              tabIndex={-1}
              className="text-sm font-semibold text-[#14161B] focus:outline-none"
            >
              Suggested Fairer Language — Redline Comparison
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#5A5E68] hover:text-[#14161B] hover:bg-[#E5E7EB]"
            aria-label="Close fairer language modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Targeted Clause Header */}
          <div className="bg-[#F9F9F8] p-3 border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
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
              <p className="text-[11px] text-[#5A5E68]">
                <strong>Flagged Concern: </strong>
                {clause.tagReason}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-[#D1D5DB] bg-white text-xs">
              <button
                onClick={() => setViewMode('redline')}
                className={`flex items-center gap-1.5 px-2.5 py-1 transition-colors ${
                  viewMode === 'redline'
                    ? 'bg-[#14161B] text-white font-medium'
                    : 'text-[#5A5E68] hover:text-[#14161B]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Redline Diff</span>
              </button>
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`flex items-center gap-1.5 px-2.5 py-1 transition-colors ${
                  viewMode === 'side-by-side'
                    ? 'bg-[#14161B] text-white font-medium'
                    : 'text-[#5A5E68] hover:text-[#14161B]'
                }`}
              >
                <Split className="w-3.5 h-3.5" />
                <span>Side-by-Side</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#5A5E68]">
              <RefreshCw className="w-5 h-5 animate-spin text-[#14161B]" />
              <span>Drafting balanced replacement clause text...</span>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Redline View */}
              {viewMode === 'redline' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#5A5E68]">
                    <span className="font-semibold uppercase tracking-wider text-[#14161B]">
                      Integrated Redline (Original vs. Fairer Replacement)
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-2.5 h-2.5 bg-red-100 border border-[#8B2E2E]" />
                        <span className="text-[#8B2E2E]">Deletions from original</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-2.5 h-2.5 bg-emerald-100 border border-[#1B4332]" />
                        <span className="text-[#1B4332]">Additions in replacement</span>
                      </span>
                    </div>
                  </div>

                  <div className="border border-[#D1D5DB] p-4 bg-white font-document text-xs leading-relaxed text-[#14161B] whitespace-pre-wrap">
                    {diffTokens.map((token, idx) => {
                      if (token.type === 'removed') {
                        return (
                          <span
                            key={idx}
                            className="line-through text-[#8B2E2E] bg-red-50/80 px-0.5"
                            title="Removed from original"
                          >
                            {token.text}
                          </span>
                        );
                      }
                      if (token.type === 'added') {
                        return (
                          <span
                            key={idx}
                            className="underline decoration-2 text-[#1B4332] bg-emerald-50/80 font-medium px-0.5"
                            title="Added in replacement"
                          >
                            {token.text}
                          </span>
                        );
                      }
                      return <span key={idx}>{token.text}</span>;
                    })}
                  </div>
                </div>
              )}

              {/* Side-by-Side View */}
              {viewMode === 'side-by-side' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#8B2E2E] uppercase tracking-wider">
                        Original Clause (Unfavorable)
                      </span>
                    </div>
                    <div className="border border-[#E5E7EB] bg-[#F9F9F8] p-3 font-document text-xs text-[#5A5E68] leading-relaxed h-[240px] overflow-y-auto">
                      "{clause.originalText}"
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#1B4332] uppercase tracking-wider">
                        Fairer Replacement (Balanced)
                      </span>
                    </div>
                    <div className="border border-emerald-200 bg-emerald-50/20 p-3 font-document text-xs text-[#14161B] leading-relaxed h-[240px] overflow-y-auto">
                      "{result.replacementText}"
                    </div>
                  </div>
                </div>
              )}

              {/* Rationale & Key Changes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="bg-[#F9F9F8] border border-[#E5E7EB] p-3 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-[11px] text-[#14161B]">
                    <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                    <span>Paralegal Rationale</span>
                  </div>
                  <p className="text-[11px] text-[#5A5E68] leading-relaxed">
                    {result.rationale}
                  </p>
                </div>

                <div className="bg-[#F9F9F8] border border-[#E5E7EB] p-3 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-[11px] text-[#14161B]">
                    <GitCompare className="w-3.5 h-3.5 text-[#14161B]" />
                    <span>Substantive Adjustments</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#5A5E68]">
                    {result.keyChanges.map((kc, idx) => (
                      <li key={idx}>{kc}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F4F4F2] space-y-2">
          {/* AI-generated draft disclaimer */}
          <div className="flex items-center gap-1.5 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>
              <strong>AI-generated draft — not legal advice.</strong> Review with a qualified legal professional before using in any agreement.
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={() => clause && fetchFairerLanguage(clause)}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-[#5A5E68] hover:text-[#14161B] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!result}
                className="px-3.5 py-1.5 bg-[#14161B] text-white rounded-none hover:bg-black transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied Replacement</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Replacement Clause</span>
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

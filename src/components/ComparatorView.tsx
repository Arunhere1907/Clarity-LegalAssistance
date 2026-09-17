import React, { useState, useEffect, useRef } from 'react';
import { GitCompare, RefreshCw, X, AlertCircle } from 'lucide-react';
import { ComparisonResult } from '../types';
import { SAMPLE_COMPARISON_RESULT } from '../data/sampleContracts';

interface ComparatorViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComparatorView: React.FC<ComparatorViewProps> = ({ isOpen, onClose }) => {
  const [comparison, setComparison] = useState<ComparisonResult>(SAMPLE_COMPARISON_RESULT);
  const [filterParty, setFilterParty] = useState<string>('all');

  // Custom comparison inputs
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [docAText, setDocAText] = useState('');
  const [docBText, setDocBText] = useState('');
  const [docAName, setDocAName] = useState('Document A (Original)');
  const [docBName, setDocBName] = useState('Document B (Redline)');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      headingRef.current?.focus();
      setErrorMessage('');
    }
  }, [isOpen]);

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleRunCustomCompare = async () => {
    if (!docAText.trim() || !docBText.trim()) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docAText, docBText, docAName, docBName }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(errData.error || 'The comparison service returned an error. Please try again.');
      }

      const data = await res.json() as ComparisonResult;
      setComparison(data);
      setIsCustomMode(false);
    } catch (err: unknown) {
      const message = err instanceof Error
        ? err.message
        : 'Could not compare documents. Please check that both documents contain readable text.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChanges = filterParty === 'all'
    ? comparison.changes
    : comparison.changes.filter((c) => c.favorsParty.toLowerCase() === filterParty.toLowerCase());

  const getPartyBadge = (party: string) => {
    const p = party.toLowerCase();
    if (p.includes('tenant') || p.includes('employee') || p.includes('customer') || p.includes('client')) {
      return (
        <span
          className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold text-white rounded"
          style={{ backgroundColor: '#1B4332' }}
        >
          Favors {party}
        </span>
      );
    }
    if (p.includes('landlord') || p.includes('employer') || p.includes('vendor')) {
      return (
        <span
          className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold text-white rounded"
          style={{ backgroundColor: '#8B2E2E' }}
        >
          Favors {party}
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold text-white rounded"
        style={{ backgroundColor: '#B8860B' }}
      >
        Neutral
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs font-ui"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparator-modal-title"
    >
      <div className="bg-white rounded border border-[#14161B] w-full max-w-4xl max-h-[95dvh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-[#E5E7EB] bg-[#F4F4F2] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <GitCompare className="w-4 h-4 text-[#14161B] shrink-0" />
            <h2
              id="comparator-modal-title"
              ref={headingRef}
              tabIndex={-1}
              className="text-xs sm:text-sm font-semibold text-[#14161B] truncate focus:outline-none"
            >
              Structured Document Comparator &amp; Favorability Diff
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => { setIsCustomMode(!isCustomMode); setErrorMessage(''); }}
              className="text-xs text-[#14161B] underline hover:text-black font-medium cursor-pointer"
            >
              {isCustomMode ? 'Sample Comparison' : 'Compare Custom Docs'}
            </button>
            <button
              onClick={onClose}
              className="p-1 text-[#5A5E68] hover:text-[#14161B] rounded hover:bg-[#E5E7EB] cursor-pointer"
              aria-label="Close comparator"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {isCustomMode ? (
            /* Custom Comparison Input Mode */
            <div className="space-y-4">
              {errorMessage && (
                <div role="alert" className="bg-red-50 border border-red-200 rounded p-2.5 text-xs text-red-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  <div><strong className="font-semibold">Comparison failed: </strong>{errorMessage}</div>
                </div>
              )}
              <div className="text-xs text-[#5A5E68]">
                Paste two contract versions (e.g. original offer vs counter-offer) to detect substantive changes and who each shift favors:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={docAName}
                    onChange={(e) => setDocAName(e.target.value)}
                    className="w-full text-xs font-semibold p-2 border border-[#D1D5DB] rounded bg-[#F9F9F8]"
                    placeholder="Document A Name (e.g. Original Lease 2025)"
                  />
                  <textarea
                    value={docAText}
                    onChange={(e) => setDocAText(e.target.value)}
                    placeholder="Paste original contract text here..."
                    rows={8}
                    className="w-full p-2.5 sm:p-3 border border-[#D1D5DB] rounded font-document text-xs text-[#14161B] focus:outline-none focus:border-[#14161B] min-h-[120px] max-h-[240px] sm:max-h-[300px] overflow-y-auto break-words resize-y"
                  />
                </div>

                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={docBName}
                    onChange={(e) => setDocBName(e.target.value)}
                    className="w-full text-xs font-semibold p-2 border border-[#D1D5DB] rounded bg-[#F9F9F8]"
                    placeholder="Document B Name (e.g. Redline Lease 2026)"
                  />
                  <textarea
                    value={docBText}
                    onChange={(e) => setDocBText(e.target.value)}
                    placeholder="Paste revised contract or redline text here..."
                    rows={8}
                    className="w-full p-2.5 sm:p-3 border border-[#D1D5DB] rounded font-document text-xs text-[#14161B] focus:outline-none focus:border-[#14161B] min-h-[120px] max-h-[240px] sm:max-h-[300px] overflow-y-auto break-words resize-y"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsCustomMode(false)}
                  className="px-3 py-1.5 border border-[#D1D5DB] rounded hover:bg-[#F4F4F2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRunCustomCompare}
                  disabled={isLoading || !docAText.trim() || !docBText.trim()}
                  className="px-4 py-1.5 bg-[#14161B] text-white rounded hover:bg-black disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Analyzing Changes...' : 'Run Favorability Diff'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Comparative Diff Results Display */
            <div className="space-y-5">
              {/* Document Pair & Net Shift Summary */}
              <div className="bg-white border border-[#E5E7EB] rounded p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E5E7EB]">
                  <div className="font-semibold text-[#14161B]">
                    Comparing: <span className="font-mono text-[#5A5E68]">{comparison.docAName}</span> vs <span className="font-mono text-[#5A5E68]">{comparison.docBName}</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#5A5E68]">
                    {comparison.changes.length} Material Changes Identified
                  </span>
                </div>
                <p className="text-xs text-[#14161B] leading-relaxed font-document">
                  {comparison.summary}
                </p>
              </div>

              {/* Filter by party favorability */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#5A5E68]">Filter by favorability:</span>
                  <button
                    onClick={() => setFilterParty('all')}
                    className={`px-2 py-0.5 rounded border text-[11px] ${
                      filterParty === 'all'
                        ? 'bg-[#14161B] text-white border-[#14161B]'
                        : 'bg-white text-[#14161B] border-[#D1D5DB]'
                    }`}
                  >
                    All ({comparison.changes.length})
                  </button>
                  <button
                    onClick={() => setFilterParty('tenant')}
                    className={`px-2 py-0.5 rounded border text-[11px] ${
                      filterParty === 'tenant'
                        ? 'bg-[#1B4332] text-white border-[#1B4332]'
                        : 'bg-white text-[#14161B] border-[#D1D5DB]'
                    }`}
                  >
                    Favors Tenant / Client
                  </button>
                  <button
                    onClick={() => setFilterParty('landlord')}
                    className={`px-2 py-0.5 rounded border text-[11px] ${
                      filterParty === 'landlord'
                        ? 'bg-[#8B2E2E] text-white border-[#8B2E2E]'
                        : 'bg-white text-[#14161B] border-[#D1D5DB]'
                    }`}
                  >
                    Favors Landlord / Vendor
                  </button>
                </div>
              </div>

              {/* Changes Cards */}
              <div className="space-y-4">
                {filteredChanges.map((change) => (
                  <div
                    key={change.id}
                    className="bg-white border border-[#E5E7EB] rounded p-4 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-mono text-[11px] text-[#5A5E68] block">
                          {change.section}
                        </span>
                        <h4 className="text-xs font-semibold text-[#14161B]">{change.clauseTitle}</h4>
                      </div>
                      {getPartyBadge(change.favorsParty)}
                    </div>

                    {/* Diff Columns: Old vs New */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Old Text */}
                      <div className="bg-red-50/40 border border-red-200 rounded p-2.5 space-y-1">
                        <div className="text-[10px] font-mono font-medium text-red-900 uppercase">
                          Previous Version ({comparison.docAName})
                        </div>
                        <p className="font-document text-xs text-[#14161B] leading-relaxed">
                          {change.oldText}
                        </p>
                      </div>

                      {/* New Text */}
                      <div className="bg-emerald-50/40 border border-emerald-200 rounded p-2.5 space-y-1">
                        <div className="text-[10px] font-mono font-medium text-emerald-900 uppercase">
                          Revised Version ({comparison.docBName})
                        </div>
                        <p className="font-document text-xs text-[#14161B] leading-relaxed">
                          {change.newText}
                        </p>
                      </div>
                    </div>

                    {/* Legal Rationale of Shift */}
                    <div className="bg-[#F4F4F2] p-2.5 rounded text-xs text-[#14161B] space-y-0.5">
                      <span className="font-semibold text-[#5A5E68] text-[11px]">Why this favors {change.favorsParty}: </span>
                      <span className="leading-relaxed">{change.explanation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E5E7EB] bg-[#F4F4F2] flex items-center justify-between text-xs">
          <span className="text-[11px] text-[#5A5E68]">
            Substantive contract comparison. Color tags indicate strategic advantage shift.
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-[#D1D5DB] rounded text-[#14161B] hover:bg-[#E5E7EB]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

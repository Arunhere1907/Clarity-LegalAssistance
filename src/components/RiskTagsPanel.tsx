import React, { useState, useMemo } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle, ArrowUpRight, PlayCircle, Mail, GitCompare, FileDown, Loader2 } from 'lucide-react';
import { Clause, RiskTag, DocumentAnalysis } from '../types';
import { downloadDocumentRiskReportPDF } from '../utils/pdfGenerator';

interface RiskTagsPanelProps {
  clauses: Clause[];
  documentAnalysis?: DocumentAnalysis;
  onSelectClause: (clauseId: string) => void;
  onSimulateClause: (clause: Clause) => void;
  onDraftMessage?: (clause: Clause) => void;
  onSuggestFairerLanguage?: (clause: Clause) => void;
}

export const RiskTagsPanel: React.FC<RiskTagsPanelProps> = React.memo(({
  clauses,
  documentAnalysis,
  onSelectClause,
  onSimulateClause,
  onDraftMessage,
  onSuggestFairerLanguage,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | RiskTag>('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    if (!documentAnalysis) return;
    setIsGeneratingPdf(true);
    setTimeout(async () => {
      try {
        await downloadDocumentRiskReportPDF(documentAnalysis);
      } catch (err) {
        console.error('Failed to generate PDF:', err);
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 40);
  };

  // Memoize counts calculation to avoid recomputing on every render
  const counts = useMemo(() => ({
    all: clauses.length,
    'high-attention': clauses.filter((c) => c.tag === 'high-attention').length,
    unusual: clauses.filter((c) => c.tag === 'unusual').length,
    standard: clauses.filter((c) => c.tag === 'standard').length,
    'missing-but-expected': clauses.filter((c) => c.tag === 'missing-but-expected').length,
  }), [clauses]);

  // Memoize filtered clauses to avoid recomputing on every render
  const filteredClauses = useMemo(() => 
    activeFilter === 'all'
      ? clauses
      : clauses.filter((c) => c.tag === activeFilter),
    [clauses, activeFilter]
  );

  const getTagBadge = (tag: RiskTag) => {
    switch (tag) {
      case 'high-attention':
        return (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-white rounded"
            style={{ backgroundColor: '#8B2E2E' }}
          >
            <AlertCircle className="w-3 h-3" />
            High-attention
          </span>
        );
      case 'unusual':
        return (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-white rounded"
            style={{ backgroundColor: '#B8860B' }}
          >
            <AlertTriangle className="w-3 h-3" />
            Unusual
          </span>
        );
      case 'standard':
        return (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-white rounded"
            style={{ backgroundColor: '#1B4332' }}
          >
            <CheckCircle2 className="w-3 h-3" />
            Standard
          </span>
        );
      case 'missing-but-expected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-[#5A5E68] bg-[#F4F4F2] border border-dashed border-[#5A5E68] rounded">
            <HelpCircle className="w-3 h-3" />
            Missing-but-expected
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F4F2] font-ui">
      {/* Risk Filter Bar */}
      <div className="p-3 bg-white border-b border-[#E5E7EB] space-y-2">
        <div className="text-[11px] text-[#5A5E68] flex items-center justify-between">
          <span>Filter by paralegal risk assessment:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px]">{filteredClauses.length} shown</span>
            {documentAnalysis && (
              <button
                id="btn-download-pdf-risks"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#14161B] hover:text-black hover:underline cursor-pointer disabled:opacity-50"
                title="Download PDF report of risks and changes"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-3 h-3 animate-spin text-[#14161B]" />
                ) : (
                  <FileDown className="w-3 h-3 text-[#14161B]" />
                )}
                <span>{isGeneratingPdf ? 'PDF...' : 'Download PDF'}</span>
              </button>
            )}
          </div>
        </div>

        <div
          id="risk-filter-tabs"
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 min-w-0"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <button
            id="filter-tag-all"
            onClick={() => setActiveFilter('all')}
            className={`h-7 inline-flex items-center justify-center px-2.5 text-xs rounded border transition-colors shrink-0 whitespace-nowrap cursor-pointer font-medium ${
              activeFilter === 'all'
                ? 'bg-[#14161B] text-white border-[#14161B]'
                : 'bg-white text-[#14161B] border-[#D1D5DB] hover:bg-[#F4F4F2]'
            }`}
          >
            All ({counts.all})
          </button>

          <button
            id="filter-tag-high-attention"
            onClick={() => setActiveFilter('high-attention')}
            className={`h-7 inline-flex items-center justify-center gap-1.5 px-2.5 text-xs rounded border transition-colors shrink-0 whitespace-nowrap cursor-pointer font-medium ${
              activeFilter === 'high-attention'
                ? 'bg-[#8B2E2E] text-white border-[#8B2E2E]'
                : 'bg-white text-[#14161B] border-[#D1D5DB] hover:bg-[#F4F4F2]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#8B2E2E] shrink-0 inline-block"></span>
            <span>High-attention ({counts['high-attention']})</span>
          </button>

          <button
            id="filter-tag-unusual"
            onClick={() => setActiveFilter('unusual')}
            className={`h-7 inline-flex items-center justify-center gap-1.5 px-2.5 text-xs rounded border transition-colors shrink-0 whitespace-nowrap cursor-pointer font-medium ${
              activeFilter === 'unusual'
                ? 'bg-[#B8860B] text-white border-[#B8860B]'
                : 'bg-white text-[#14161B] border-[#D1D5DB] hover:bg-[#F4F4F2]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#B8860B] shrink-0 inline-block"></span>
            <span>Unusual ({counts.unusual})</span>
          </button>

          <button
            id="filter-tag-standard"
            onClick={() => setActiveFilter('standard')}
            className={`h-7 inline-flex items-center justify-center gap-1.5 px-2.5 text-xs rounded border transition-colors shrink-0 whitespace-nowrap cursor-pointer font-medium ${
              activeFilter === 'standard'
                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                : 'bg-white text-[#14161B] border-[#D1D5DB] hover:bg-[#F4F4F2]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#1B4332] shrink-0 inline-block"></span>
            <span>Standard ({counts.standard})</span>
          </button>

          {counts['missing-but-expected'] > 0 && (
            <button
              id="filter-tag-missing"
              onClick={() => setActiveFilter('missing-but-expected')}
              className={`h-7 inline-flex items-center justify-center gap-1.5 px-2.5 text-xs rounded border border-dashed transition-colors shrink-0 whitespace-nowrap cursor-pointer font-medium ${
                activeFilter === 'missing-but-expected'
                  ? 'bg-[#5A5E68] text-white border-[#5A5E68]'
                  : 'bg-white text-[#5A5E68] border-[#5A5E68] hover:bg-[#F4F4F2]'
              }`}
            >
              <HelpCircle className="w-3 h-3 shrink-0" />
              <span>Missing-expected ({counts['missing-but-expected']})</span>
            </button>
          )}
        </div>
      </div>

      {/* Clause Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredClauses.map((clause) => (
          <div
            key={clause.id}
            id={`risk-card-${clause.id}`}
            className="bg-white border border-[#E5E7EB] rounded p-3 text-xs space-y-2 hover:border-[#14161B]/40 transition-colors shadow-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-semibold text-[#5A5E68]">
                  {clause.number}
                </span>
                <span className="font-semibold text-[#14161B] truncate max-w-[180px]">
                  {clause.title}
                </span>
              </div>
              {getTagBadge(clause.tag)}
            </div>

            {/* One line plain-English reason */}
            <div className="text-[#14161B] text-[11px] bg-[#F4F4F2] p-2 rounded leading-normal">
              <span className="font-semibold text-[#5A5E68]">Reason: </span>
              {clause.tagReason}
            </div>

            {/* Actions: Scroll to document, Draft Message, Fairer Language & Simulate consequence */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-[#F4F4F2] text-[11px]">
              <button
                id={`btn-jump-${clause.id}`}
                onClick={() => onSelectClause(clause.id)}
                className="flex items-center gap-1 text-[#14161B] hover:underline"
              >
                <span>View in document</span>
                <ArrowUpRight className="w-3 h-3 text-[#5A5E68]" />
              </button>

              <div className="flex items-center gap-1">
                {(clause.tag === 'high-attention' || clause.tag === 'unusual') && onDraftMessage && (
                  <button
                    onClick={() => onDraftMessage(clause)}
                    className="flex items-center gap-1 px-1.5 py-0.5 border border-[#D1D5DB] hover:bg-[#F4F4F2] text-[#14161B] text-[10px]"
                    title="Draft email to counterparty"
                  >
                    <Mail className="w-2.5 h-2.5 text-[#5A5E68]" />
                    <span>Draft</span>
                  </button>
                )}

                {(clause.tag === 'high-attention' || clause.tag === 'unusual') && onSuggestFairerLanguage && (
                  <button
                    onClick={() => onSuggestFairerLanguage(clause)}
                    className="flex items-center gap-1 px-1.5 py-0.5 border border-[#D1D5DB] hover:bg-[#F4F4F2] text-[#14161B] text-[10px]"
                    title="Suggest fairer replacement text and view redline"
                  >
                    <GitCompare className="w-2.5 h-2.5 text-[#5A5E68]" />
                    <span>Fairer</span>
                  </button>
                )}

                <button
                  id={`btn-sim-card-${clause.id}`}
                  onClick={() => onSimulateClause(clause)}
                  className="flex items-center gap-1 px-2 py-0.5 border border-[#D1D5DB] hover:bg-[#F4F4F2] text-[#14161B]"
                >
                  <PlayCircle className="w-3 h-3 text-[#5A5E68]" />
                  <span>Simulate</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

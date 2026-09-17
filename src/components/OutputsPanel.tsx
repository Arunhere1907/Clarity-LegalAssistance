import React, { useState } from 'react';
import { Copy, Check, Printer, HelpCircle, CheckSquare, ArrowUpRight, FileDown, Loader2 } from 'lucide-react';
import { DocumentAnalysis } from '../types';
import { downloadDocumentRiskReportPDF } from '../utils/pdfGenerator';

interface OutputsPanelProps {
  documentAnalysis: DocumentAnalysis;
  onSelectClause: (clauseId: string) => void;
  onPrintBrief: () => void;
}

export const OutputsPanel: React.FC<OutputsPanelProps> = ({
  documentAnalysis,
  onSelectClause,
  onPrintBrief,
}) => {
  const [activeTab, setActiveTab] = useState<'brief' | 'checklist' | 'summary'>('brief');
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const { lawyerBrief, questionsChecklist, summary, title } = documentAnalysis;

  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      try {
        downloadDocumentRiskReportPDF(documentAnalysis);
      } catch (err) {
        console.error('Failed to generate PDF:', err);
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 40);
  };

  const handleCopyText = () => {
    let content = '';
    if (activeTab === 'brief') {
      content = `LAWYER-PREP BRIEF: ${title}\n\nSUMMARY:\n${lawyerBrief.summary}\n\nFLAGGED HIGH-RISK CLAUSES:\n` +
        lawyerBrief.flaggedClauses.map((f, i) => `${i + 1}. ${f.clauseTitle}\n   Concern: ${f.concern}\n   Paralegal Note: ${f.paralegalNote}`).join('\n\n') +
        `\n\nOPEN QUESTIONS FOR ATTORNEY:\n` +
        lawyerBrief.openQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n') +
        `\n\nDISCLAIMER:\n${lawyerBrief.disclaimer}`;
    } else if (activeTab === 'checklist') {
      content = `PRE-SIGNING QUESTIONS CHECKLIST: ${title}\n\n` +
        questionsChecklist.map((q, i) => `${i + 1}. ${q.question}\n   Why ask: ${q.whyAsk}\n   Reference: ${q.clauseTitle}`).join('\n\n');
    } else {
      content = `EXECUTIVE SUMMARY: ${title}\n\n${summary}`;
    }

    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F4F2] font-ui">
      {/* Sub-tab Navigation & Actions Bar */}
      <div className="bg-white border-b border-[#E5E7EB] px-3 flex flex-wrap xl:flex-nowrap items-center justify-between gap-x-2 gap-y-1.5 shrink-0 select-none">
        {/* Horizontally scrollable sub-tabs with flush active border */}
        <div
          id="outputs-sub-tabs"
          className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth min-w-0 -mb-px py-0.5"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <button
            id="tab-output-brief"
            onClick={() => setActiveTab('brief')}
            className={`px-2.5 py-2 text-xs border-b-2 font-medium shrink-0 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'brief'
                ? 'border-[#14161B] text-[#14161B] font-semibold'
                : 'border-transparent text-[#5A5E68] hover:text-[#14161B] hover:border-[#D1D5DB]'
            }`}
          >
            Lawyer-Prep Brief
          </button>
          <button
            id="tab-output-checklist"
            onClick={() => setActiveTab('checklist')}
            className={`px-2.5 py-2 text-xs border-b-2 font-medium shrink-0 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'checklist'
                ? 'border-[#14161B] text-[#14161B] font-semibold'
                : 'border-transparent text-[#5A5E68] hover:text-[#14161B] hover:border-[#D1D5DB]'
            }`}
          >
            Pre-Signing Checklist ({questionsChecklist.length})
          </button>
          <button
            id="tab-output-summary"
            onClick={() => setActiveTab('summary')}
            className={`px-2.5 py-2 text-xs border-b-2 font-medium shrink-0 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'summary'
                ? 'border-[#14161B] text-[#14161B] font-semibold'
                : 'border-transparent text-[#5A5E68] hover:text-[#14161B] hover:border-[#D1D5DB]'
            }`}
          >
            Plain Summary
          </button>
        </div>

        {/* Compact action buttons aligned seamlessly */}
        <div className="flex items-center gap-1.5 py-1.5 shrink-0 ml-auto">
          <button
            id="btn-copy-output"
            onClick={handleCopyText}
            className="h-7 inline-flex items-center gap-1 px-2.5 text-xs border border-[#D1D5DB] rounded bg-white hover:bg-[#F4F4F2] text-[#14161B] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3 text-[#5A5E68]" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            id="btn-download-pdf-output"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="h-7 inline-flex items-center gap-1 px-2.5 text-xs bg-[#14161B] text-white rounded hover:bg-black transition-colors font-medium cursor-pointer shadow-xs disabled:opacity-50 whitespace-nowrap shrink-0"
            title="Download styled PDF report of document risks and changes"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <FileDown className="w-3 h-3" />
            )}
            <span>{isGeneratingPdf ? 'PDF...' : 'Download PDF'}</span>
          </button>
          <button
            id="btn-print-output"
            onClick={onPrintBrief}
            className="h-7 inline-flex items-center gap-1 px-2.5 text-xs border border-[#D1D5DB] bg-white text-[#14161B] rounded hover:bg-[#F4F4F2] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Open printable paralegal intake packet"
          >
            <Printer className="w-3 h-3 text-[#5A5E68]" />
            <span>Print Packet</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'brief' && (
          <div className="space-y-4 text-xs">
            {/* Value Proposition Note */}
            <div className="bg-white border border-[#E5E7EB] rounded p-3 space-y-1 shadow-xs">
              <span className="font-semibold text-[#14161B]">Consultation Time Saver</span>
              <p className="text-[#5A5E68] leading-relaxed text-[11px]">
                Most billable legal consultation time is spent explaining basic facts the contract already states.
                Handing this structured brief to an attorney turns a 45-minute intake session into a focused 15-minute review.
              </p>
            </div>

            {/* Executive Case Summary */}
            <div className="bg-white border border-[#E5E7EB] rounded p-3 space-y-1.5 shadow-xs">
              <div className="font-semibold text-[#14161B] text-xs">Paralegal Executive Overview</div>
              <p className="text-[#14161B] leading-relaxed font-document text-xs">{lawyerBrief.summary}</p>
            </div>

            {/* Flagged High-Risk Clauses */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-[#5A5E68] uppercase tracking-wider">
                Flagged Clauses for Attorney Review ({lawyerBrief.flaggedClauses.length})
              </div>
              {lawyerBrief.flaggedClauses.map((flag, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#E5E7EB] rounded p-3 space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#14161B]">{flag.clauseTitle}</span>
                    <button
                      onClick={() => onSelectClause(flag.clauseId)}
                      className="flex items-center gap-0.5 text-[11px] text-[#5A5E68] hover:text-[#14161B] underline"
                    >
                      <span>Jump</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="bg-red-50 text-red-950 p-2 rounded text-[11px] border border-red-200">
                    <span className="font-medium">Client Concern: </span>
                    {flag.concern}
                  </div>
                  <div className="bg-[#F4F4F2] text-[#14161B] p-2 rounded text-[11px]">
                    <span className="font-medium text-[#5A5E68]">Suggested Negotiation Strategy: </span>
                    {flag.paralegalNote}
                  </div>
                </div>
              ))}
            </div>

            {/* Open Questions for Lawyer */}
            <div className="bg-white border border-[#E5E7EB] rounded p-3 space-y-2 shadow-xs">
              <div className="font-semibold text-[#14161B] text-xs">Targeted Questions to Ask the Lawyer</div>
              <ul className="space-y-1.5 pl-4 list-disc text-[11px] text-[#14161B]">
                {lawyerBrief.openQuestions.map((q, idx) => (
                  <li key={idx} className="leading-relaxed">{q}</li>
                ))}
              </ul>
            </div>

            {/* Missing Statutory Provisions */}
            {lawyerBrief.missingProvisions && lawyerBrief.missingProvisions.length > 0 && (
              <div className="bg-white border border-[#E5E7EB] rounded p-3 space-y-2 shadow-xs">
                <div className="font-semibold text-[#14161B] text-xs flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#5A5E68]" />
                  <span>Missing or Omitted Provisions (Customary in this Document Type)</span>
                </div>
                <ul className="space-y-1.5 pl-4 list-disc text-[11px] text-[#5A5E68]">
                  {lawyerBrief.missingProvisions.map((m, idx) => (
                    <li key={idx} className="leading-relaxed">{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Professional Boundary Disclaimer */}
            <div className="text-[10px] text-[#5A5E68] italic border-t border-[#E5E7EB] pt-3 leading-normal">
              {lawyerBrief.disclaimer}
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-3 text-xs">
            <div className="text-[11px] text-[#5A5E68]">
              Ask the counterparty or landlord these questions before putting pen to paper:
            </div>

            {questionsChecklist.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E5E7EB] rounded p-3 space-y-2 shadow-xs"
              >
                <div className="flex items-start gap-2">
                  <CheckSquare className="w-4 h-4 text-[#14161B] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold text-[#14161B] text-xs">{item.question}</span>
                    <p className="text-[11px] text-[#5A5E68] leading-relaxed">
                      <span className="font-medium text-[#14161B]">Why ask: </span>
                      {item.whyAsk}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1 border-t border-[#F4F4F2]">
                  <button
                    onClick={() => onSelectClause(item.relevantClauseId)}
                    className="flex items-center gap-1 text-[11px] text-[#5A5E68] hover:text-[#14161B] underline"
                  >
                    <span>View {item.clauseTitle}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="bg-white border border-[#E5E7EB] rounded p-4 space-y-3 shadow-xs text-xs">
            <div className="font-semibold text-sm text-[#14161B]">{title}</div>
            <div className="font-document text-sm text-[#14161B] leading-relaxed whitespace-pre-wrap">
              {summary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

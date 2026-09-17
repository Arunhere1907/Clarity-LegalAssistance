import React, { useState, useEffect } from 'react';
import { X, Printer, ArrowLeft, FileDown, Loader2 } from 'lucide-react';
import { DocumentAnalysis } from '../types';
import { downloadDocumentRiskReportPDF } from '../utils/pdfGenerator';

interface PrintableLawyerPacketProps {
  isOpen: boolean;
  onClose: () => void;
  documentAnalysis: DocumentAnalysis;
}

export const PrintableLawyerPacket: React.FC<PrintableLawyerPacketProps> = ({
  isOpen,
  onClose,
  documentAnalysis,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isGeneratingPdf) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, isGeneratingPdf, onClose]);

  if (!isOpen) return null;

  const { title, detectedType, summary, lawyerBrief, questionsChecklist } = documentAnalysis;

  const handlePrint = () => {
    window.print();
  };

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

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto font-ui text-[#14161B]">
      {/* Non-printed Navigation Bar */}
      <div className="print:hidden sticky top-0 bg-[#F4F4F2] border-b border-[#E5E7EB] px-4 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 z-10 shadow-xs">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs text-[#5A5E68] hover:text-[#14161B] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Document Workspace</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs text-[#5A5E68] hidden md:inline">Print-ready paralegal intake packet</span>

          {/* Download as PDF Button */}
          <button
            id="btn-download-pdf-packet"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#14161B] text-white text-xs rounded hover:bg-black transition-colors font-medium cursor-pointer shadow-xs disabled:opacity-50"
            title="Download clean styled PDF report of risks and changes"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download as PDF'}</span>
          </button>

          {/* Native Print Dialog Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#D1D5DB] bg-white text-[#14161B] text-xs rounded hover:bg-[#F4F4F2] transition-colors cursor-pointer"
            title="Open system print dialog"
          >
            <Printer className="w-3.5 h-3.5 text-[#5A5E68]" />
            <span className="hidden sm:inline">Print Dialog</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-[#5A5E68] hover:text-[#14161B] rounded hover:bg-[#E5E7EB] cursor-pointer"
            aria-label="Close lawyer packet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Printable Paper Document Container */}
      <main className="max-w-4xl mx-auto p-8 md:p-12 space-y-8 print:p-0">
        {/* Packet Header */}
        <header className="border-b-2 border-[#14161B] pb-4 flex justify-between items-end">
          <div>
            <div className="text-xs font-mono tracking-widest text-[#5A5E68] uppercase mb-1">
              Attorney Pre-Consultation Intake Packet
            </div>
            <h1 className="text-2xl font-bold font-document text-[#14161B]">{title}</h1>
            <div className="text-xs text-[#5A5E68] mt-1">
              Classified Document Type: <strong className="text-[#14161B]">{detectedType}</strong>
            </div>
          </div>
          <div className="text-right text-xs text-[#5A5E68] font-mono">
            <div>Generated: {new Date().toLocaleDateString()}</div>
            <div>Prepared via Clarity Legal</div>
          </div>
        </header>

        {/* Executive Overview */}
        <section className="space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#5A5E68] border-b border-[#E5E7EB] pb-1">
            1. Executive Document Overview
          </h2>
          <p className="font-document text-sm leading-relaxed text-[#14161B]">
            {summary}
          </p>
        </section>

        {/* Flagged High-Risk Clauses */}
        <section className="space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#5A5E68] border-b border-[#E5E7EB] pb-1">
            2. Clauses Requiring Attorney Attention ({lawyerBrief.flaggedClauses.length})
          </h2>
          <div className="space-y-3">
            {lawyerBrief.flaggedClauses.map((flag, idx) => (
              <div key={idx} className="border border-[#D1D5DB] rounded p-4 space-y-2 bg-white">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#14161B]">{flag.clauseTitle}</span>
                  <span
                    className="text-[10px] font-mono uppercase px-2 py-0.5 rounded text-white font-semibold"
                    style={{ backgroundColor: flag.tag === 'high-attention' ? '#8B2E2E' : '#B8860B' }}
                  >
                    {flag.tag}
                  </span>
                </div>
                <div className="text-xs text-[#14161B]">
                  <strong>Client Concern: </strong>{flag.concern}
                </div>
                <div className="text-xs text-[#5A5E68] bg-[#F4F4F2] p-2.5 rounded">
                  <strong>Paralegal Note &amp; Recommended Counter-Proposal: </strong>{flag.paralegalNote}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Targeted Questions for the Attorney */}
        <section className="space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#5A5E68] border-b border-[#E5E7EB] pb-1">
            3. Specific Questions Prepared for Counsel
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-xs text-[#14161B]">
            {lawyerBrief.openQuestions.map((q, idx) => (
              <li key={idx} className="leading-relaxed">{q}</li>
            ))}
          </ol>
        </section>

        {/* Missing or Omitted Provisions */}
        {lawyerBrief.missingProvisions && lawyerBrief.missingProvisions.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#5A5E68] border-b border-[#E5E7EB] pb-1">
              4. Omitted Provisions Customary to this Document Type
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[#5A5E68]">
              {lawyerBrief.missingProvisions.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Pre-signing Action Items */}
        <section className="space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#5A5E68] border-b border-[#E5E7EB] pb-1">
            5. Pre-Signing Checklist for Client
          </h2>
          <div className="space-y-2 text-xs">
            {questionsChecklist.map((item, idx) => (
              <div key={idx} className="p-2 border border-[#E5E7EB] rounded flex items-start gap-2">
                <span className="font-mono text-[#5A5E68]">{idx + 1}.</span>
                <div>
                  <div className="font-medium text-[#14161B]">{item.question}</div>
                  <div className="text-[11px] text-[#5A5E68]">{item.whyAsk} (Ref: {item.clauseTitle})</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Legal Boundary Disclaimer */}
        <footer className="border-t border-[#D1D5DB] pt-4 text-[11px] text-[#5A5E68] italic leading-normal">
          {lawyerBrief.disclaimer}
        </footer>
      </main>
    </div>
  );
};

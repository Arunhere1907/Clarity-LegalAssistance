import React, { useState } from 'react';
import { Shield, ShieldAlert, Upload, GitCompare, Printer, FileDown, Loader2, Contrast } from 'lucide-react';
import { DocumentAnalysis, RedactionItem, ReadingMode } from '../types';
import { downloadDocumentRiskReportPDF } from '../utils/pdfGenerator';

interface HeaderProps {
  currentDoc: DocumentAnalysis;
  onSelectSample: (docKey: 'lease' | 'employment' | 'vendor') => void;
  onOpenUpload: () => void;
  onOpenComparator: () => void;
  isComparatorOpen: boolean;
  piiProtectionActive: boolean;
  onTogglePII: () => void;
  redactedItems: RedactionItem[];
  onOpenPIIAudit: () => void;
  onPrintBrief: () => void;
  onUpdateDocType: (type: DocumentAnalysis['docType']) => void;
  readingMode: ReadingMode;
  onToggleReadingMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDoc,
  onSelectSample,
  onOpenUpload,
  onOpenComparator,
  isComparatorOpen,
  piiProtectionActive,
  onTogglePII,
  redactedItems,
  onOpenPIIAudit,
  onPrintBrief,
  onUpdateDocType,
  readingMode,
  onToggleReadingMode,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      try {
        downloadDocumentRiskReportPDF(currentDoc);
      } catch (err) {
        console.error('Failed to generate PDF:', err);
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 40);
  };
  return (
    <header className="border-b border-[#E5E7EB] bg-white px-3 sm:px-4 py-2 flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-3 font-ui sticky top-0 z-30">
      {/* Top / Left Section: Brand & Horizontally Scrollable Sample Contracts / Upload Strip */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 w-full lg:w-auto flex-1">
        {/* Application Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-semibold text-base tracking-tight text-[#14161B]">Clarity</span>
          <span className="text-xs text-[#5A5E68] border-l border-[#D1D5DB] pl-2 hidden sm:inline">
            Legal Document Workspace
          </span>
        </div>

        {/* Document Selector & Quick Switch: Maintains smooth overflow on mobile without clipping */}
        <div
          id="sample-contracts-strip"
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth min-w-0 flex-1 py-0.5 px-0.5 pr-2.5 sm:pr-0 overscroll-x-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <span className="text-xs text-[#5A5E68] hidden xl:inline shrink-0 font-medium">Sample:</span>
          
          <button
            id="btn-sample-lease"
            onClick={() => onSelectSample('lease')}
            className={`h-7.5 inline-flex items-center justify-center px-2.5 text-xs rounded border transition-colors shrink-0 whitespace-nowrap cursor-pointer font-medium ${
              currentDoc.id === 'lease-2026-sample' && !isComparatorOpen
                ? 'bg-[#14161B] text-white border-[#14161B]'
                : 'bg-white text-[#14161B] border-[#D1D5DB] hover:bg-[#F4F4F2]'
            }`}
          >
            Lease Agreement
          </button>

          <button
            id="btn-sample-employment"
            onClick={() => onSelectSample('employment')}
            className={`h-7.5 inline-flex items-center justify-center px-2.5 text-xs rounded border transition-colors shrink-0 whitespace-nowrap cursor-pointer font-medium ${
              currentDoc.id === 'employment-offer-sample' && !isComparatorOpen
                ? 'bg-[#14161B] text-white border-[#14161B]'
                : 'bg-white text-[#14161B] border-[#D1D5DB] hover:bg-[#F4F4F2]'
            }`}
          >
            Employment Offer
          </button>

          <button
            id="btn-sample-vendor"
            onClick={() => onSelectSample('vendor')}
            className={`h-7.5 inline-flex items-center justify-center px-2.5 text-xs rounded border transition-colors shrink-0 whitespace-nowrap cursor-pointer font-medium ${
              currentDoc.id === 'vendor-msa-sample' && !isComparatorOpen
                ? 'bg-[#14161B] text-white border-[#14161B]'
                : 'bg-white text-[#14161B] border-[#D1D5DB] hover:bg-[#F4F4F2]'
            }`}
            title="Sample vendor agreement featuring delivery deadlines and client recourse"
          >
            Vendor MSA
          </button>

          {/* Upload / Paste Button with full visibility and non-clipped padding */}
          <button
            id="btn-open-upload"
            onClick={onOpenUpload}
            className="h-7.5 inline-flex items-center justify-center gap-1.5 px-2.5 text-xs rounded border border-[#14161B] bg-[#F4F4F2] text-[#14161B] hover:bg-[#E5E7EB] shrink-0 whitespace-nowrap font-medium transition-colors shadow-2xs cursor-pointer"
            title="Upload custom document or paste text"
          >
            <Upload className="w-3.5 h-3.5 text-[#14161B] shrink-0" />
            <span>Upload / Paste</span>
          </button>
        </div>
      </div>

      {/* Bottom / Right Section: Classification Type, PII Guard, Comparator & Print Packet */}
      <div
        id="header-actions-strip"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth min-w-0 w-full lg:w-auto py-0.5 px-0.5 pr-2.5 lg:pr-0 justify-start lg:justify-end overscroll-x-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Document Type Selector (Auto-classified with override) */}
        <div className="h-7.5 inline-flex items-center gap-1 text-xs bg-[#F4F4F2] px-2.5 rounded border border-[#E5E7EB] shrink-0 whitespace-nowrap">
          <span className="text-[#5A5E68]">Type:</span>
          <select
            id="select-doc-type"
            value={currentDoc.docType}
            onChange={(e) => onUpdateDocType(e.target.value as any)}
            aria-label="Document classification type"
            className="bg-transparent text-[#14161B] font-medium focus:outline-none cursor-pointer text-xs"
          >
            <option value="lease">Residential Lease</option>
            <option value="employment">Employment Contract</option>
            <option value="nda">Non-Disclosure (NDA)</option>
            <option value="loan">Loan / Credit Note</option>
            <option value="tos">Terms of Service</option>
            <option value="vendor">Vendor / MSA Agreement</option>
            <option value="custom">General Legal Document</option>
          </select>
        </div>

        {/* Client-side PII Guard indicator & toggle */}
        <div className="h-7.5 inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
          <button
            id="btn-toggle-pii"
            onClick={onTogglePII}
            className={`h-7.5 inline-flex items-center justify-center gap-1.5 px-2.5 text-xs rounded border transition-colors font-medium cursor-pointer ${
              piiProtectionActive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
            title="Toggle client-side PII detection and masking before sending to model"
          >
            {piiProtectionActive ? (
              <Shield className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            )}
            <span>
              {piiProtectionActive ? `PII Guard Active (${redactedItems.length})` : 'PII Guard Off'}
            </span>
          </button>

          {redactedItems.length > 0 && piiProtectionActive && (
            <button
              id="btn-audit-pii"
              onClick={onOpenPIIAudit}
              className="h-7.5 inline-flex items-center text-[11px] text-[#5A5E68] hover:text-[#14161B] underline px-1 cursor-pointer font-medium"
              title="Inspect masked PII tokens"
            >
              Audit
            </button>
          )}
        </div>

        {/* Reading Mode Preference Toggle (Standard vs High Contrast) */}
        <button
          id="btn-toggle-reading-mode-header"
          onClick={onToggleReadingMode}
          className={`h-7.5 inline-flex items-center justify-center gap-1.5 px-2.5 text-xs rounded border transition-colors shrink-0 whitespace-nowrap cursor-pointer font-medium ${
            readingMode === 'high-contrast'
              ? 'bg-black text-white border-black font-semibold shadow-xs ring-1 ring-black'
              : 'bg-white text-[#14161B] border-[#D1D5DB] hover:bg-[#F4F4F2]'
          }`}
          title={
            readingMode === 'high-contrast'
              ? 'High Contrast reading mode active. Click to switch to Standard reading mode.'
              : 'Switch to High Contrast reading mode for enhanced accessibility and focus.'
          }
          aria-label={`Reading mode preference: currently ${readingMode === 'high-contrast' ? 'High Contrast' : 'Standard'}. Click to toggle.`}
        >
          <Contrast className={`w-3.5 h-3.5 shrink-0 ${readingMode === 'high-contrast' ? 'text-yellow-400' : 'text-[#14161B]'}`} />
          <span>{readingMode === 'high-contrast' ? 'High Contrast: ON' : 'High Contrast'}</span>
        </button>

        {/* Comparator Mode Toggle */}
        <button
          id="btn-toggle-comparator"
          onClick={onOpenComparator}
          className={`h-7.5 inline-flex items-center justify-center gap-1.5 px-2.5 text-xs rounded border transition-colors shrink-0 whitespace-nowrap cursor-pointer font-medium ${
            isComparatorOpen
              ? 'bg-[#14161B] text-white border-[#14161B]'
              : 'bg-white text-[#14161B] border-[#D1D5DB] hover:bg-[#F4F4F2]'
          }`}
          title="Compare two versions of a contract to see who each change favors"
        >
          <GitCompare className="w-3.5 h-3.5 shrink-0" />
          <span>Compare Versions</span>
        </button>

        {/* Download as PDF Risk & Counter-Proposal Report */}
        <button
          id="btn-download-pdf-header"
          onClick={handleDownloadPDF}
          disabled={isGeneratingPdf}
          className="h-7.5 inline-flex items-center justify-center gap-1.5 px-2.5 text-xs rounded border border-[#14161B] bg-[#14161B] text-white hover:bg-black font-medium shrink-0 whitespace-nowrap transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          title="Download a styled PDF report of risks and suggested changes"
        >
          {isGeneratingPdf ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          ) : (
            <FileDown className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{isGeneratingPdf ? 'Generating...' : 'Download as PDF'}</span>
        </button>

        {/* Print / Export Lawyer-prep Brief */}
        <button
          id="btn-print-brief"
          onClick={onPrintBrief}
          className="h-7.5 inline-flex items-center justify-center gap-1.5 px-2.5 text-xs rounded border border-[#D1D5DB] bg-white text-[#14161B] hover:bg-[#F4F4F2] font-medium shrink-0 whitespace-nowrap cursor-pointer"
          title="Print or export lawyer handoff brief"
        >
          <Printer className="w-3.5 h-3.5 text-[#5A5E68] shrink-0" />
          <span className="hidden sm:inline">Lawyer Packet</span>
        </button>
      </div>
    </header>
  );
};

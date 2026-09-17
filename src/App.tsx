import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  AlertTriangle,
  Calendar,
  FileCheck2,
  Scale
} from 'lucide-react';

import { DocumentAnalysis, Clause, RedactionItem, ReadingMode } from './types';
import { SAMPLE_LEASE_DOCUMENT, SAMPLE_EMPLOYMENT_DOCUMENT, SAMPLE_VENDOR_DOCUMENT } from './data/sampleContracts';
import { detectAndRedactPII } from './utils/piiRedaction';

import { Header } from './components/Header';
import { DocumentPane } from './components/DocumentPane';
import { QAPanel } from './components/QAPanel';
import { RiskTagsPanel } from './components/RiskTagsPanel';
import { TimelinePanel } from './components/TimelinePanel';
import { OutputsPanel } from './components/OutputsPanel';
import { SimulatorModal } from './components/SimulatorModal';
import { DraftMessageModal } from './components/DraftMessageModal';
import { FairerLanguageModal } from './components/FairerLanguageModal';
import { ComparatorView } from './components/ComparatorView';
import { UploadModal } from './components/UploadModal';
import { PIIAuditModal } from './components/PIIAuditModal';
import { PrintableLawyerPacket } from './components/PrintableLawyerPacket';

export default function App() {
  // Current active document
  const [currentDoc, setCurrentDoc] = useState<DocumentAnalysis>(SAMPLE_LEASE_DOCUMENT);

  // User preference setting: 'standard' vs 'high-contrast' reading mode
  const [readingMode, setReadingMode] = useState<ReadingMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('clarity_reading_mode');
        if (saved === 'high-contrast' || saved === 'standard') return saved;
      } catch {
        // ignore
      }
    }
    return 'standard';
  });

  // Persist reading mode preference
  useEffect(() => {
    try {
      localStorage.setItem('clarity_reading_mode', readingMode);
    } catch {
      // ignore
    }
  }, [readingMode]);

  const handleToggleReadingMode = () => {
    setReadingMode((prev) => (prev === 'high-contrast' ? 'standard' : 'high-contrast'));
  };

  const handleSetReadingMode = (mode: ReadingMode) => {
    setReadingMode(mode);
  };

  // Active right pane tab: 'qa' | 'risks' | 'timeline' | 'outputs'
  const [activeRightTab, setActiveRightTab] = useState<'qa' | 'risks' | 'timeline' | 'outputs'>('qa');

  // Active highlighted citation clause ID (triggers smooth scroll & highlight sweep)
  const [activeCitationId, setActiveCitationId] = useState<string | null>(null);

  // Client-side PII protection state
  const [piiProtectionActive, setPiiProtectionActive] = useState<boolean>(true);
  const [redactedItems, setRedactedItems] = useState<RedactionItem[]>([]);

  // Draggable resize divider state (clamped to minimum 25% each, tracking directly)
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftPaneWidth, setLeftPaneWidth] = useState<number>(60); // 60% left, 40% right default
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  // Modals state
  const [simulatorClause, setSimulatorClause] = useState<Clause | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  const [draftMessageClause, setDraftMessageClause] = useState<Clause | null>(null);
  const [isDraftMessageOpen, setIsDraftMessageOpen] = useState<boolean>(false);

  const [fairerLanguageClause, setFairerLanguageClause] = useState<Clause | null>(null);
  const [isFairerLanguageOpen, setIsFairerLanguageOpen] = useState<boolean>(false);

  const [isComparatorOpen, setIsComparatorOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isPIIAuditOpen, setIsPIIAuditOpen] = useState<boolean>(false);
  const [isPrintPacketOpen, setIsPrintPacketOpen] = useState<boolean>(false);

  // Detect desktop vs mobile on resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Run client-side PII detection pass whenever document changes
  useEffect(() => {
    const fullText = currentDoc.clauses.map((c) => c.originalText).join('\n');
    const { items } = detectAndRedactPII(fullText);
    setRedactedItems(items);
  }, [currentDoc]);

  // Dragging logic tracking mouse directly and clamping to 25% - 75%
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const totalWidth = rect.width;
      if (totalWidth <= 0) return;

      let percentage = (currentX / totalWidth) * 100;
      // Clamp each pane to a minimum of 25% width so neither can be dragged to zero
      if (percentage < 25) percentage = 25;
      if (percentage > 75) percentage = 75;

      setLeftPaneWidth(percentage);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Handler for clicking a citation in Q&A or a clause in Risk list
  const handleScrollToClause = (clauseId: string) => {
    setActiveCitationId(clauseId);
    const element = document.getElementById(`clause-${clauseId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Remove highlight state after animation finishes
    setTimeout(() => {
      setActiveCitationId((prev) => (prev === clauseId ? null : prev));
    }, 2400);
  };

  const handleSelectSample = (docKey: 'lease' | 'employment' | 'vendor') => {
    if (docKey === 'lease') {
      setCurrentDoc(SAMPLE_LEASE_DOCUMENT);
    } else if (docKey === 'employment') {
      setCurrentDoc(SAMPLE_EMPLOYMENT_DOCUMENT);
    } else {
      setCurrentDoc(SAMPLE_VENDOR_DOCUMENT);
    }
  };

  const handleOpenSimulator = (clause: Clause) => {
    setSimulatorClause(clause);
    setIsSimulatorOpen(true);
  };

  const handleOpenDraftMessage = (clause: Clause) => {
    setDraftMessageClause(clause);
    setIsDraftMessageOpen(true);
  };

  const handleOpenFairerLanguage = (clause: Clause) => {
    setFairerLanguageClause(clause);
    setIsFairerLanguageOpen(true);
  };

  const handleAskAboutClause = (clause: Clause) => {
    setActiveRightTab('qa');
    handleScrollToClause(clause.id);
  };

  const handleUpdateDocType = (type: DocumentAnalysis['docType']) => {
    setCurrentDoc((prev) => ({
      ...prev,
      docType: type,
    }));
  };

  const flaggedCount = currentDoc.clauses.filter(
    (c) => c.tag === 'high-attention' || c.tag === 'unusual'
  ).length;

  return (
    <div
      data-reading-mode={readingMode}
      className={`flex flex-col h-screen w-screen overflow-hidden ${
        readingMode === 'high-contrast' ? 'bg-white text-black' : 'bg-[#FFFFFF] text-[#14161B]'
      } font-ui select-text`}
    >
      {/* Top Application Header */}
      <Header
        currentDoc={currentDoc}
        onSelectSample={handleSelectSample}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenComparator={() => setIsComparatorOpen(true)}
        isComparatorOpen={isComparatorOpen}
        piiProtectionActive={piiProtectionActive}
        onTogglePII={() => setPiiProtectionActive(!piiProtectionActive)}
        redactedItems={redactedItems}
        onOpenPIIAudit={() => setIsPIIAuditOpen(true)}
        onPrintBrief={() => setIsPrintPacketOpen(true)}
        onUpdateDocType={handleUpdateDocType}
        readingMode={readingMode}
        onToggleReadingMode={handleToggleReadingMode}
      />

      {/* Upfront Legal Boundary & Professional Disclaimer */}
      <div className="bg-[#F4F4F2] border-b border-[#E5E7EB] px-4 py-1.5 flex items-center justify-between gap-2 text-[11px] text-[#5A5E68]">
        <div className="flex items-center gap-2">
          <Scale className="w-3.5 h-3.5 text-[#14161B] shrink-0" />
          <span>
            <strong className="text-[#14161B]">Paralegal Assistance Workspace:</strong> Clarity explains contractual terms and highlights non-standard provisions. It does not provide legal advice or predict case outcomes.
          </span>
        </div>
        <button
          onClick={() => setIsPrintPacketOpen(true)}
          className="text-[#14161B] hover:underline shrink-0 hidden md:inline"
        >
          Prepare Attorney Intake Packet &rarr;
        </button>
      </div>

      {/* Main Two-Pane Workspace with Draggable Divider */}
      <div
        ref={containerRef}
        className="flex-1 flex flex-col md:flex-row overflow-hidden relative"
      >
        {/* Left Pane: Document Text with Side-by-Side Simplification */}
        <main
          className="h-full flex flex-col min-w-0 overflow-hidden"
          style={{ width: isDesktop ? `${leftPaneWidth}%` : '100%' }}
        >
          <DocumentPane
            clauses={currentDoc.clauses}
            docTitle={currentDoc.title}
            activeCitationId={activeCitationId}
            readingMode={readingMode}
            onSetReadingMode={handleSetReadingMode}
            onSimulateClause={handleOpenSimulator}
            onAskAboutClause={handleAskAboutClause}
            onDraftMessage={handleOpenDraftMessage}
            onSuggestFairerLanguage={handleOpenFairerLanguage}
          />
        </main>

        {/* Draggable Resize Divider (2-3px thin, highlighted only on hover, col-resize cursor) */}
        {isDesktop && (
          <div
            id="pane-resize-divider"
            onMouseDown={handleDividerMouseDown}
            className={`w-[3px] relative z-20 cursor-col-resize shrink-0 select-none ${
              isDragging ? 'bg-[#14161B]' : 'bg-transparent hover:bg-[#14161B]/40'
            }`}
            title="Drag to resize panels"
          >
            {/* Invisible extended grab hit area for easy hover/drag */}
            <div className="absolute inset-y-0 -left-1.5 -right-1.5 cursor-col-resize" />
          </div>
        )}

        {/* Right Pane: Toolset (Grounded Q&A, Risk Tags, Timeline, Outputs) */}
        <aside
          className="h-full flex flex-col bg-[#F4F4F2] border-t md:border-t-0 md:border-l border-[#E5E7EB] overflow-hidden"
          style={{ width: isDesktop ? `${100 - leftPaneWidth}%` : '100%' }}
        >
          {/* Right Pane Tab Navigation */}
          <nav
            aria-label="Right Workspace Tabs"
            className="bg-white border-b border-[#E5E7EB] px-2 flex items-center min-w-0 font-ui select-none shrink-0"
          >
            <div
              id="right-workspace-tabs"
              className="flex items-center gap-0.5 overflow-x-auto no-scrollbar scroll-smooth min-w-0 w-full -mb-px overscroll-x-contain"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <button
                id="tab-qa"
                onClick={() => setActiveRightTab('qa')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 border-b-2 text-xs font-medium transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                  activeRightTab === 'qa'
                    ? 'border-[#14161B] text-[#14161B] font-semibold'
                    : 'border-transparent text-[#5A5E68] hover:text-[#14161B] hover:border-[#D1D5DB]'
                }`}
                title="Grounded Q&A citing exact clauses"
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span>Grounded Q&amp;A</span>
              </button>

              <button
                id="tab-risks"
                onClick={() => setActiveRightTab('risks')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 border-b-2 text-xs font-medium transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                  activeRightTab === 'risks'
                    ? 'border-[#14161B] text-[#14161B] font-semibold'
                    : 'border-transparent text-[#5A5E68] hover:text-[#14161B] hover:border-[#D1D5DB]'
                }`}
                title="Clause risk tags list"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Risk Tags</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ml-0.5 inline-flex items-center justify-center leading-none ${
                    flaggedCount > 0
                      ? 'bg-red-50 text-[#8B2E2E] border-[#8B2E2E]/30 font-semibold'
                      : 'bg-[#F4F4F2] text-[#5A5E68] border-[#E5E7EB]'
                  }`}
                >
                  {flaggedCount}
                </span>
              </button>

              <button
                id="tab-timeline"
                onClick={() => setActiveRightTab('timeline')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 border-b-2 text-xs font-medium transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                  activeRightTab === 'timeline'
                    ? 'border-[#14161B] text-[#14161B] font-semibold'
                    : 'border-transparent text-[#5A5E68] hover:text-[#14161B] hover:border-[#D1D5DB]'
                }`}
                title="Obligations timeline with .ics export"
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Timeline</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full border bg-[#F4F4F2] text-[#5A5E68] border-[#E5E7EB] ml-0.5 inline-flex items-center justify-center leading-none">
                  {currentDoc.timeline.length}
                </span>
              </button>

              <button
                id="tab-outputs"
                onClick={() => setActiveRightTab('outputs')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 border-b-2 text-xs font-medium transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                  activeRightTab === 'outputs'
                    ? 'border-[#14161B] text-[#14161B] font-semibold'
                    : 'border-transparent text-[#5A5E68] hover:text-[#14161B] hover:border-[#D1D5DB]'
                }`}
                title="Lawyer-prep brief and checklist"
              >
                <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                <span>Outputs</span>
              </button>
            </div>
          </nav>

          {/* Tab Content Panels */}
          <div className="flex-1 overflow-hidden">
            {activeRightTab === 'qa' && (
              <QAPanel
                clauses={currentDoc.clauses}
                docTitle={currentDoc.title}
                onSelectCitation={handleScrollToClause}
              />
            )}

            {activeRightTab === 'risks' && (
              <RiskTagsPanel
                clauses={currentDoc.clauses}
                documentAnalysis={currentDoc}
                onSelectClause={handleScrollToClause}
                onSimulateClause={handleOpenSimulator}
                onDraftMessage={handleOpenDraftMessage}
                onSuggestFairerLanguage={handleOpenFairerLanguage}
              />
            )}

            {activeRightTab === 'timeline' && (
              <TimelinePanel
                timeline={currentDoc.timeline}
                docTitle={currentDoc.title}
              />
            )}

            {activeRightTab === 'outputs' && (
              <OutputsPanel
                documentAnalysis={currentDoc}
                onSelectClause={handleScrollToClause}
                onPrintBrief={() => setIsPrintPacketOpen(true)}
              />
            )}
          </div>
        </aside>
      </div>

      {/* "What happens if" Simulator Modal */}
      <SimulatorModal
        clause={simulatorClause}
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        allClauses={currentDoc.clauses}
        onSelectClause={setSimulatorClause}
      />

      {/* Draft Message to Counterparty Modal */}
      <DraftMessageModal
        clause={draftMessageClause}
        isOpen={isDraftMessageOpen}
        onClose={() => setIsDraftMessageOpen(false)}
        docTitle={currentDoc.title}
        docType={currentDoc.docType}
      />

      {/* Suggest Fairer Language Redline Modal */}
      <FairerLanguageModal
        clause={fairerLanguageClause}
        isOpen={isFairerLanguageOpen}
        onClose={() => setIsFairerLanguageOpen(false)}
        docType={currentDoc.docType}
      />

      {/* Structured Document Comparator View */}
      <ComparatorView
        isOpen={isComparatorOpen}
        onClose={() => setIsComparatorOpen(false)}
      />

      {/* Document Ingest / Paste Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDocumentAnalyzed={(newDoc, items) => {
          setCurrentDoc(newDoc);
          if (items && items.length > 0) {
            setRedactedItems(items);
          }
          setActiveRightTab('risks');
        }}
      />

      {/* Client-side PII Redaction Audit Log */}
      <PIIAuditModal
        isOpen={isPIIAuditOpen}
        onClose={() => setIsPIIAuditOpen(false)}
        items={redactedItems}
      />

      {/* Printable Lawyer Packet Modal */}
      <PrintableLawyerPacket
        isOpen={isPrintPacketOpen}
        onClose={() => setIsPrintPacketOpen(false)}
        documentAnalysis={currentDoc}
      />
    </div>
  );
}

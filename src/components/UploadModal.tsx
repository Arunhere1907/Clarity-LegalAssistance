import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Sparkles, Shield, Lock, AlertCircle } from 'lucide-react';
import { DocumentAnalysis, RedactionItem } from '../types';
import { detectAndRedactPII, restoreDocumentAnalysisPII } from '../utils/piiRedaction';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentAnalyzed: (doc: DocumentAnalysis, items: RedactionItem[]) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentAnalyzed,
}) => {
  const [pastedText, setPastedText] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to modal heading when opened
  useEffect(() => {
    if (isOpen) {
      headingRef.current?.focus();
      setErrorMessage('');
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  // Real-time detection of PII in the current input text
  const currentPII = detectAndRedactPII(pastedText);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPastedText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleProcessDocument = async () => {
    if (!pastedText.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMessage('');
    setStatusMessage('Step 1/3: Sanitizing personal identifiers (Names, Account #s, Signatures, Addresses)...');

    try {
      // Step 1: Detect and mask sensitive PII client-side before sending to server
      const { redactedText, items } = detectAndRedactPII(pastedText);

      setStatusMessage('Step 2/3: Analyzing document with AI model (masked payload)...');

      // Step 2: Send sanitized text to Gemini /api/analyze
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: redactedText }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(errData.error || 'Analysis service returned an error. Please try again.');
      }

      const data = await res.json() as {
        title?: string;
        docType?: string;
        detectedType?: string;
        summary?: string;
        clauses?: unknown[];
        timeline?: unknown[];
        questionsChecklist?: unknown[];
        lawyerBrief?: unknown;
      };
      setStatusMessage('Step 3/3: Restoring sanitized identifiers in rendered output...');

      const analyzedDoc: DocumentAnalysis = {
        id: `custom-doc-${Date.now()}`,
        title: docTitle || data.title || 'Uploaded Document',
        docType: (data.docType as DocumentAnalysis['docType']) || 'custom',
        detectedType: data.detectedType || 'Legal Agreement',
        summary: data.summary || '',
        clauses: (data.clauses as DocumentAnalysis['clauses']) || [],
        timeline: (data.timeline as DocumentAnalysis['timeline']) || [],
        questionsChecklist: (data.questionsChecklist as DocumentAnalysis['questionsChecklist']) || [],
        lawyerBrief: (data.lawyerBrief as DocumentAnalysis['lawyerBrief']) || {
          summary: '',
          flaggedClauses: [],
          openQuestions: [],
          missingProvisions: [],
          disclaimer: '',
        },
      };

      // Step 3: Restore original sensitive data in the rendered UI output
      const restoredDoc = restoreDocumentAnalysisPII(analyzedDoc, items);

      onDocumentAnalyzed(restoredDoc, items);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error
        ? err.message
        : 'We could not complete the analysis. Please check that the document contains readable text and try again.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs font-ui"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="bg-white rounded border border-[#14161B] w-full max-w-2xl max-h-[95dvh] sm:max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-[#E5E7EB] bg-[#F4F4F2] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Upload className="w-4 h-4 text-[#14161B] shrink-0" />
            <h3
              id="upload-modal-title"
              ref={headingRef}
              tabIndex={-1}
              className="text-xs sm:text-sm font-semibold text-[#14161B] truncate focus:outline-none"
            >
              Ingest Document (PDF, TXT, DOCX, or Paste)
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-[#5A5E68] hover:text-[#14161B] rounded hover:bg-[#E5E7EB] shrink-0 cursor-pointer disabled:opacity-50"
            aria-label="Close upload dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body with smooth mobile touch scrolling & overflow containment */}
        <div
          className="p-3.5 sm:p-5 overflow-y-auto overscroll-contain space-y-3.5 sm:space-y-4 text-xs flex-1"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* File Dropzone / Touch Picker */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded p-3.5 sm:p-5 text-center transition-colors cursor-pointer touch-manipulation ${
              dragActive ? 'border-[#14161B] bg-[#F4F4F2]' : 'border-[#D1D5DB] hover:bg-[#F9F9F8]'
            }`}
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <Upload className="w-5 h-5 text-[#5A5E68] mx-auto mb-1.5" />
            <div className="font-semibold text-xs text-[#14161B]">
              Tap to browse or drop contract / lease / offer letter
            </div>
            <div className="text-[11px] text-[#5A5E68] mt-0.5">
              Supports .pdf, .txt, .md, .docx
            </div>
            <input
              id="file-upload-input"
              type="file"
              accept=".txt,.md,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileSelected(e.target.files[0]);
              }}
            />
          </div>

          {/* Paste Document Text Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label htmlFor="textarea-custom-doc" className="text-xs font-semibold text-[#14161B]">
                Or paste document text:
              </label>
              <span className="text-[11px] text-[#5A5E68]">
                {pastedText.length > 0 ? `${pastedText.length} characters` : ''}
              </span>
            </div>
            <textarea
              id="textarea-custom-doc"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste contract text, clauses, or agreement here..."
              rows={6}
              className="w-full p-2.5 sm:p-3 border border-[#D1D5DB] rounded font-document text-xs text-[#14161B] focus:outline-none focus:border-[#14161B] min-h-[110px] max-h-[240px] sm:max-h-[300px] overflow-y-auto break-words resize-y"
            />
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 rounded p-2.5 text-xs text-red-900 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Analysis failed: </strong>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Client-Side PII Masking Live Status */}
          {currentPII.items.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5 text-xs text-emerald-950 flex items-start gap-2 overflow-hidden">
              <Shield className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0 flex-1 break-words">
                <div className="font-semibold text-emerald-900">
                  Client-Side Privacy Active: {currentPII.items.length} sensitive identifier{currentPII.items.length > 1 ? 's' : ''} detected
                </div>
                <div className="text-[11px] text-emerald-800 leading-normal">
                  Names, account numbers, signatures, and addresses are automatically replaced with synthetic tokens before leaving your browser, and will be restored in your final rendered view.
                </div>
              </div>
            </div>
          )}

          {/* Document Title Input */}
          <div>
            <label htmlFor="input-doc-title" className="text-xs font-medium text-[#14161B] block mb-1">
              Document Label / Name:
            </label>
            <input
              id="input-doc-title"
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. Master Consulting Services Agreement"
              className="w-full border border-[#D1D5DB] rounded p-2 text-xs text-[#14161B] focus:outline-none focus:border-[#14161B]"
            />
          </div>

          {/* Status feedback */}
          {isLoading && (
            <div className="bg-[#F4F4F2] p-2.5 sm:p-3 rounded flex items-center gap-2 text-xs text-[#14161B] border border-[#E5E7EB]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#14161B] animate-pulse shrink-0"></span>
              <span className="break-words">{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer: Prevents horizontal overflow on small mobile viewports */}
        <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-t border-[#E5E7EB] bg-[#F4F4F2] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[#5A5E68] min-w-0">
            <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">Automated PII detection may not catch every identifier — review before uploading sensitive documents.</span>
          </div>
          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-3 py-1.5 min-h-[36px] bg-white border border-[#D1D5DB] rounded text-xs text-[#14161B] hover:bg-[#E5E7EB] cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-analyze-doc"
              onClick={handleProcessDocument}
              disabled={isLoading || !pastedText.trim()}
              className="flex-1 sm:flex-initial px-4 py-1.5 min-h-[36px] bg-[#14161B] text-white rounded text-xs hover:bg-black disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Analyzing...' : 'Analyze Document'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

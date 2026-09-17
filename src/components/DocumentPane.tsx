import React, { useState } from 'react';
import { HelpCircle, PlayCircle, Eye, Columns, BookOpen, AlertTriangle, AlertCircle, CheckCircle2, Info, Mail, GitCompare, Search, X, Contrast } from 'lucide-react';
import { Clause, RiskTag, ReadingMode } from '../types';

interface DocumentPaneProps {
  clauses: Clause[];
  docTitle: string;
  activeCitationId: string | null;
  readingMode: ReadingMode;
  onSetReadingMode: (mode: ReadingMode) => void;
  onSimulateClause: (clause: Clause) => void;
  onAskAboutClause: (clause: Clause) => void;
  onDraftMessage?: (clause: Clause) => void;
  onSuggestFairerLanguage?: (clause: Clause) => void;
}

export const DocumentPane: React.FC<DocumentPaneProps> = ({
  clauses,
  docTitle,
  activeCitationId,
  readingMode,
  onSetReadingMode,
  onSimulateClause,
  onAskAboutClause,
  onDraftMessage,
  onSuggestFairerLanguage,
}) => {
  const isHighContrast = readingMode === 'high-contrast';

  // Search and keyword filter state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Layout mode: 'side-by-side' | 'stacked' | 'original-only'
  const [viewMode, setViewMode] = useState<'side-by-side' | 'stacked' | 'original-only'>('side-by-side');

  // Global simplification register: 'simple' (plain English) vs 'precise' (retains legal terms with inline definitions)
  const [globalRegister, setGlobalRegister] = useState<'simple' | 'precise'>('simple');

  // Individual clause register overrides: clauseId -> 'simple' | 'precise'
  const [clauseRegisters, setClauseRegisters] = useState<Record<string, 'simple' | 'precise'>>({});

  // Whether to expand definition glosses inline directly inside text in Legal Precise mode
  const [showInlineGlossaryGlosses, setShowInlineGlossaryGlosses] = useState<boolean>(true);

  // Active hover term for inline glossary definition popover
  const [activeTooltip, setActiveTooltip] = useState<{ term: string; definition: string; x: number; y: number } | null>(null);

  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Real-time keyword highlighter preserving original casing
  const highlightMatch = (text: string, query: string): React.ReactNode => {
    if (!query.trim() || !text) return text;
    const trimmed = query.trim();
    const escaped = escapeRegExp(trimmed);
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    if (parts.length <= 1) return text;

    const lowerQuery = trimmed.toLowerCase();
    return parts.map((part, idx) =>
      part.toLowerCase() === lowerQuery ? (
        <mark
          key={idx}
          className={`${
            isHighContrast
              ? 'bg-yellow-300 text-black px-1 py-0.2 font-bold border border-black'
              : 'bg-amber-200 text-[#14161B] px-0.5 py-0.2 rounded-xs font-semibold'
          }`}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getClauseRegister = (clauseId: string): 'simple' | 'precise' => {
    return clauseRegisters[clauseId] || globalRegister;
  };

  const toggleClauseRegister = (clauseId: string) => {
    const current = getClauseRegister(clauseId);
    setClauseRegisters((prev) => ({
      ...prev,
      [clauseId]: current === 'simple' ? 'precise' : 'simple',
    }));
  };

  const getTagBadge = (tag: RiskTag, reason: string) => {
    switch (tag) {
      case 'high-attention':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold text-white ${
              isHighContrast
                ? 'px-2 py-0.5 border border-black shadow-xs bg-[#7F1D1D]'
                : 'px-2 py-0.5 rounded font-semibold bg-[#8B2E2E]'
            }`}
            title={reason}
          >
            <AlertCircle className="w-3 h-3" />
            High-attention
          </span>
        );
      case 'unusual':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold text-white ${
              isHighContrast
                ? 'px-2 py-0.5 border border-black shadow-xs bg-[#78350F]'
                : 'px-2 py-0.5 rounded font-semibold bg-[#B8860B]'
            }`}
            title={reason}
          >
            <AlertTriangle className="w-3 h-3" />
            Unusual
          </span>
        );
      case 'standard':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold text-white ${
              isHighContrast
                ? 'px-2 py-0.5 border border-black shadow-xs bg-[#14532D]'
                : 'px-2 py-0.5 rounded font-semibold bg-[#1B4332]'
            }`}
            title={reason}
          >
            <CheckCircle2 className="w-3 h-3" />
            Standard
          </span>
        );
      case 'missing-but-expected':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] ${
              isHighContrast
                ? 'px-2 py-0.5 font-bold text-black bg-white border-2 border-black'
                : 'px-2 py-0.5 font-medium text-[#5A5E68] bg-[#F4F4F2] border border-dashed border-[#5A5E68] rounded'
            }`}
            title={reason}
          >
            <HelpCircle className="w-3 h-3" />
            Missing-but-expected
          </span>
        );
    }
  };

  const renderTextWithJargon = (
    text: string,
    jargonTerms: { term: string; definition: string }[],
    isPrecise: boolean,
    query: string
  ) => {
    if (!jargonTerms || jargonTerms.length === 0) {
      return highlightMatch(text, query);
    }

    const terms = jargonTerms.map((j) => j.term);
    const regexPattern = new RegExp(`\\b(${terms.map((t) => escapeRegExp(t)).join('|')})\\b`, 'gi');
    const parts = text.split(regexPattern);

    return parts.map((part, idx) => {
      const matched = jargonTerms.find((j) => j.term.toLowerCase() === part.toLowerCase());
      if (matched) {
        const isSearchMatch = query.trim() && part.toLowerCase().includes(query.trim().toLowerCase());
        return (
          <span key={idx} className="inline">
            <span
              className={`transition-colors cursor-help ${
                isHighContrast
                  ? isSearchMatch
                    ? 'border-b-2 border-black bg-yellow-300 text-black px-1 py-0.5 font-bold ring-2 ring-black'
                    : 'border-b-2 border-black bg-yellow-100 hover:bg-yellow-200 text-black px-1 py-0.5 font-semibold'
                  : isSearchMatch
                  ? 'border-b-2 border-dotted border-amber-600 text-[#14161B] px-1 py-0.5 rounded font-semibold bg-amber-200 ring-2 ring-amber-400'
                  : 'border-b-2 border-dotted border-amber-600 text-[#14161B] px-1 py-0.5 rounded font-medium bg-amber-50/80 hover:bg-amber-100'
              }`}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setActiveTooltip({
                  term: matched.term,
                  definition: matched.definition,
                  x: rect.left,
                  y: rect.bottom + 4,
                });
              }}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {part}
            </span>
            {/* Inline definition badge when in precise register and glosses enabled */}
            {isPrecise && showInlineGlossaryGlosses && (
              <span
                className={`inline-block mx-1 my-0.5 text-[11px] font-ui select-text ${
                  isHighContrast
                    ? 'bg-black text-white border border-black px-1.5 py-0.2 font-medium'
                    : 'bg-[#F4F4F2] text-[#5A5E68] border border-[#D1D5DB] rounded px-1.5 py-0.2 font-normal'
                }`}
              >
                <span className={isHighContrast ? 'font-bold text-yellow-300' : 'font-semibold text-[#14161B]'}>def:</span>{' '}
                {highlightMatch(matched.definition, query)}
              </span>
            )}
          </span>
        );
      }
      return <React.Fragment key={idx}>{highlightMatch(part, query)}</React.Fragment>;
    });
  };

  // Filter clauses in real-time by search query
  const filteredClauses = clauses.filter((clause) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      clause.title.toLowerCase().includes(q) ||
      clause.number.toLowerCase().includes(q) ||
      clause.originalText.toLowerCase().includes(q) ||
      clause.simplifiedText.toLowerCase().includes(q) ||
      clause.preciseText.toLowerCase().includes(q) ||
      clause.tagReason.toLowerCase().includes(q) ||
      (clause.suggestedNegotiationStrategy && clause.suggestedNegotiationStrategy.toLowerCase().includes(q)) ||
      clause.jargonTerms.some((j) => j.term.toLowerCase().includes(q) || j.definition.toLowerCase().includes(q))
    );
  });

  return (
    <div className={`flex-1 flex flex-col h-full bg-white overflow-hidden border-r ${isHighContrast ? 'border-black' : 'border-[#E5E7EB]'}`}>
      {/* Top Document Toolbar */}
      <div className={`border-b bg-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-ui ${isHighContrast ? 'border-b-2 border-black' : 'border-[#E5E7EB]'}`}>
        <div className="flex items-center gap-2">
          <span className={`font-semibold truncate max-w-xs md:max-w-md ${isHighContrast ? 'text-black text-sm' : 'text-[#14161B]'}`}>{docTitle}</span>
          <span className={`text-[11px] ${isHighContrast ? 'text-gray-700 font-medium' : 'text-[#5A5E68]'}`}>({clauses.length} clauses analyzed)</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-x-auto no-scrollbar py-0.5 min-w-0">
          {/* User Preference: Reading Mode Setting (Standard vs High Contrast) */}
          <div
            className={`h-7.5 inline-flex items-center gap-1 px-1.5 rounded border shrink-0 ${
              isHighContrast
                ? 'bg-black/5 border-black/40 ring-1 ring-black/20'
                : 'bg-[#F4F4F2] border-[#E5E7EB]'
            }`}
            role="group"
            aria-label="Reading Mode Preference"
          >
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-0.5 flex items-center gap-1 ${
                isHighContrast ? 'text-black' : 'text-[#5A5E68]'
              }`}
            >
              <Contrast className={`w-3 h-3 shrink-0 ${isHighContrast ? 'text-black' : 'text-[#14161B]'}`} />
              <span className="hidden sm:inline">Mode:</span>
            </span>
            <button
              id="btn-mode-standard"
              onClick={() => onSetReadingMode('standard')}
              className={`h-5.5 px-2 text-xs rounded inline-flex items-center transition-colors cursor-pointer ${
                !isHighContrast
                  ? 'bg-white text-[#14161B] shadow-xs font-semibold'
                  : 'text-[#5A5E68] hover:text-[#14161B]'
              }`}
              aria-pressed={!isHighContrast}
              title="Standard reading mode with balanced editorial palette"
            >
              Standard
            </button>
            <button
              id="btn-mode-high-contrast"
              onClick={() => onSetReadingMode('high-contrast')}
              className={`h-5.5 px-2 text-xs rounded inline-flex items-center transition-colors cursor-pointer ${
                isHighContrast
                  ? 'bg-black text-white font-bold shadow-xs border border-black'
                  : 'text-[#5A5E68] hover:text-[#14161B] font-medium'
              }`}
              aria-pressed={isHighContrast}
              title="High Contrast reading mode: deep black typography, high line-height, bold outlines for accessibility"
            >
              High Contrast
            </button>
          </div>

          {/* Explain-it-Twice Global Mode Toggle */}
          <div className="h-7.5 inline-flex items-center gap-1 bg-[#F4F4F2] px-1.5 rounded border border-[#E5E7EB] shrink-0">
            <span className="text-[10px] font-semibold text-[#5A5E68] uppercase tracking-wider px-0.5">
              Explain-It-Twice:
            </span>
            <button
              id="btn-register-simple"
              onClick={() => setGlobalRegister('simple')}
              className={`h-5.5 px-2 text-xs rounded inline-flex items-center transition-colors font-medium cursor-pointer ${
                globalRegister === 'simple'
                  ? 'bg-white text-[#14161B] shadow-xs font-semibold'
                  : 'text-[#5A5E68] hover:text-[#14161B]'
              }`}
              title="Explain in plain everyday language"
            >
              Plain English
            </button>
            <button
              id="btn-register-precise"
              onClick={() => setGlobalRegister('precise')}
              className={`h-5.5 px-2 text-xs rounded inline-flex items-center transition-colors font-medium cursor-pointer ${
                globalRegister === 'precise'
                  ? 'bg-white text-[#14161B] shadow-xs font-semibold'
                  : 'text-[#5A5E68] hover:text-[#14161B]'
              }`}
              title="Retains legal terms with inline definitions"
            >
              Legal Precise
            </button>
          </div>

          {/* Toggle for direct inline definition chips */}
          {globalRegister === 'precise' && (
            <button
              onClick={() => setShowInlineGlossaryGlosses(!showInlineGlossaryGlosses)}
              className={`h-7.5 inline-flex items-center gap-1 px-2 text-xs rounded border transition-colors shrink-0 cursor-pointer ${
                showInlineGlossaryGlosses
                  ? 'bg-amber-50 text-amber-900 border-amber-300 font-medium'
                  : 'bg-white text-[#5A5E68] border-[#D1D5DB] hover:bg-[#F4F4F2]'
              }`}
              title="Toggle inline definition tags"
            >
              <Info className="w-3.5 h-3.5 text-amber-800 shrink-0" />
              <span>{showInlineGlossaryGlosses ? 'Inline Tags: ON' : 'Inline Tags: OFF'}</span>
            </button>
          )}

          {/* View Mode Toggle: Side-by-side vs Stacked vs Source only */}
          <div className={`h-7.5 inline-flex items-center rounded overflow-hidden border shrink-0 ${isHighContrast ? 'border-black' : 'border-[#E5E7EB]'}`}>
            <button
              id="btn-view-sidebyside"
              onClick={() => setViewMode('side-by-side')}
              className={`h-full px-2 inline-flex items-center justify-center cursor-pointer transition-colors ${
                viewMode === 'side-by-side'
                  ? (isHighContrast ? 'bg-black text-white' : 'bg-[#14161B] text-white')
                  : 'bg-white text-[#5A5E68] hover:bg-[#F4F4F2] hover:text-[#14161B]'
              }`}
              title="Side-by-side parallel view"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-view-stacked"
              onClick={() => setViewMode('stacked')}
              className={`h-full px-2 inline-flex items-center justify-center border-l cursor-pointer transition-colors ${
                isHighContrast ? 'border-black' : 'border-[#E5E7EB]'
              } ${
                viewMode === 'stacked'
                  ? (isHighContrast ? 'bg-black text-white' : 'bg-[#14161B] text-white')
                  : 'bg-white text-[#5A5E68] hover:bg-[#F4F4F2] hover:text-[#14161B]'
              }`}
              title="Stacked view"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-view-originalonly"
              onClick={() => setViewMode('original-only')}
              className={`h-full px-2 inline-flex items-center justify-center border-l cursor-pointer transition-colors ${
                isHighContrast ? 'border-black' : 'border-[#E5E7EB]'
              } ${
                viewMode === 'original-only'
                  ? (isHighContrast ? 'bg-black text-white' : 'bg-[#14161B] text-white')
                  : 'bg-white text-[#5A5E68] hover:bg-[#F4F4F2] hover:text-[#14161B]'
              }`}
              title="Original text only"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Clause Search & Filter Bar */}
      <div className={`border-b px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs font-ui ${isHighContrast ? 'border-b-2 border-black bg-white' : 'border-[#E5E7EB] bg-[#F9F9F8]'}`}>
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search className={`w-3.5 h-3.5 ${isHighContrast ? 'text-black' : 'text-[#5A5E68]'}`} />
          </div>
          <input
            id="clause-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearchQuery('');
            }}
            placeholder="Search clauses by keyword (e.g. rent, liability, termination)..."
            className={`w-full pl-8 pr-7 py-1 text-xs transition-all focus:outline-none ${
              isHighContrast
                ? 'bg-white text-black font-semibold placeholder:text-gray-600 border-2 border-black focus:ring-2 focus:ring-black'
                : 'bg-white text-[#14161B] placeholder-[#5A5E68] border border-[#D1D5DB] rounded focus:border-[#14161B] focus:ring-1 focus:ring-[#14161B]'
            }`}
          />
          {searchQuery && (
            <button
              id="clause-search-clear"
              onClick={() => setSearchQuery('')}
              className={`absolute inset-y-0 right-0 pr-2 flex items-center ${isHighContrast ? 'text-black hover:text-gray-700' : 'text-[#5A5E68] hover:text-[#14161B]'}`}
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className={`flex items-center gap-2 text-xs ${isHighContrast ? 'text-black font-medium' : 'text-[#5A5E68]'}`}>
          {searchQuery.trim() ? (
            <>
              <span>
                Showing <strong className={isHighContrast ? 'text-black font-bold' : 'text-[#14161B]'}>{filteredClauses.length}</strong> of{' '}
                {clauses.length} clauses
              </span>
              <button
                id="btn-reset-clause-search"
                onClick={() => setSearchQuery('')}
                className={`underline hover:no-underline text-[11px] ml-1 font-bold ${isHighContrast ? 'text-black' : 'text-[#14161B]'}`}
              >
                Clear filter
              </button>
            </>
          ) : (
            <span className={`text-[11px] hidden sm:inline ${isHighContrast ? 'text-gray-800 font-semibold' : 'text-[#5A5E68]'}`}>
              Real-time keyword filtering &amp; highlight
            </span>
          )}
        </div>
      </div>

      {/* High Contrast Reading Mode Notification Banner */}
      {isHighContrast && (
        <div
          id="high-contrast-status-bar"
          className="bg-black text-white px-4 py-2 text-xs flex items-center justify-between border-b-2 border-black font-ui shrink-0 select-none"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shrink-0" />
            <span className="font-bold tracking-wide">High Contrast Accessibility Mode Active</span>
            <span className="text-gray-300 hidden md:inline text-[11px]">
              — WCAG AAA contrast ratio, solid borders, 1.85 line-height, and bold clause distinctions
            </span>
          </div>
          <button
            id="btn-banner-switch-standard"
            onClick={() => onSetReadingMode('standard')}
            className="text-xs text-yellow-300 hover:text-yellow-100 font-semibold underline cursor-pointer shrink-0 ml-2"
          >
            Switch to Standard
          </button>
        </div>
      )}

      {/* Main Document Scroll Area */}
      <div className={`flex-1 overflow-y-auto px-5 py-6 space-y-6 ${isHighContrast ? 'bg-white' : ''}`}>
        {filteredClauses.length === 0 ? (
          <div className={`flex flex-col items-center justify-center p-12 text-center text-xs font-ui ${isHighContrast ? 'bg-white border-2 border-black' : 'bg-[#F9F9F8] border border-[#E5E7EB]'}`}>
            <div className={`p-3 border rounded-full mb-3 ${isHighContrast ? 'bg-black text-white border-black' : 'bg-white border-[#E5E7EB] text-[#5A5E68]'}`}>
              <Search className={`w-5 h-5 ${isHighContrast ? 'text-white' : 'text-[#14161B]'}`} />
            </div>
            <h4 className={`font-bold text-sm mb-1 ${isHighContrast ? 'text-black' : 'text-[#14161B]'}`}>No clauses match your search</h4>
            <p className={`max-w-sm mb-4 text-xs ${isHighContrast ? 'text-black' : 'text-[#5A5E68]'}`}>
              No clauses in this document contain the keyword &ldquo;
              <strong className={isHighContrast ? 'text-black font-bold underline' : 'text-[#14161B]'}>{searchQuery}</strong>&rdquo;. Try searching for terms like &ldquo;rent&rdquo;, &ldquo;notice&rdquo;, &ldquo;liability&rdquo;, or &ldquo;termination&rdquo;.
            </p>
            <button
              id="btn-clear-search-empty-state"
              onClick={() => setSearchQuery('')}
              className={`px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                isHighContrast
                  ? 'bg-black text-white font-bold border-2 border-black hover:bg-gray-800'
                  : 'bg-[#14161B] text-white hover:bg-[#2A2E39] rounded'
              }`}
            >
              Clear Search Filter
            </button>
          </div>
        ) : (
          filteredClauses.map((clause) => {
            const isActiveCitation = activeCitationId === clause.id;
            const currentRegister = getClauseRegister(clause.id);
            const isPrecise = currentRegister === 'precise';

            const isFlagged = clause.tag === 'high-attention' || clause.tag === 'unusual';
            const riskBorderClass = isHighContrast
              ? clause.tag === 'high-attention'
                ? 'border-l-4 border-l-[#991B1B]'
                : clause.tag === 'unusual'
                ? 'border-l-4 border-l-[#B45309]'
                : 'border-l-4 border-l-[#166534]'
              : clause.tag === 'high-attention'
              ? 'border-l-2 border-l-[#8B2E2E]'
              : clause.tag === 'unusual'
              ? 'border-l-2 border-l-[#B8860B]'
              : 'border-l-2 border-l-[#1B4332]';

            return (
              <section
                key={clause.id}
                id={`clause-${clause.id}`}
                className={`transition-all duration-200 p-4 ${riskBorderClass} ${
                  isHighContrast
                    ? isActiveCitation
                      ? 'border-2 border-black ring-4 ring-yellow-400 bg-white citation-target-active'
                      : 'border-2 border-black bg-white'
                    : isActiveCitation
                    ? 'border-[#14161B] citation-target-active bg-white border'
                    : 'border-[#E5E7EB] bg-white border'
                }`}
              >
                {/* Clause Header & Action Bar */}
                <div className={`flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 font-ui ${isHighContrast ? 'border-b-2 border-black' : 'border-b border-[#F4F4F2]'}`}>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-mono text-xs ${
                        isHighContrast
                          ? 'font-bold text-white bg-black px-2 py-0.5 border border-black'
                          : 'font-semibold text-[#14161B] bg-[#F4F4F2] px-1.5 py-0.5'
                      }`}
                    >
                      {clause.number}
                    </span>
                    <h3 className={`font-bold ${isHighContrast ? 'text-[15px] text-black tracking-tight' : 'text-sm text-[#14161B]'}`}>
                      {highlightMatch(clause.title, searchQuery)}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {getTagBadge(clause.tag, clause.tagReason)}

                    {/* Generative Feature 1: Draft Message for High-attention or Unusual clauses */}
                    {isFlagged && onDraftMessage && (
                      <button
                        id={`btn-draft-msg-${clause.id}`}
                        onClick={() => onDraftMessage(clause)}
                        className={`flex items-center gap-1 text-[11px] transition-colors cursor-pointer ${
                          isHighContrast
                            ? 'px-2 py-0.5 border-2 border-black text-black font-bold bg-white hover:bg-black hover:text-white'
                            : 'px-2 py-0.5 text-[#14161B] border border-[#D1D5DB] hover:bg-[#F4F4F2]'
                        }`}
                        title="Draft counterparty negotiation email requesting specific revision"
                      >
                        <Mail className={`w-3 h-3 ${isHighContrast ? 'text-black' : 'text-[#5A5E68]'}`} />
                        <span>Draft Message</span>
                      </button>
                    )}

                    {/* Generative Feature 2: Suggest Fairer Language for High-attention or Unusual clauses */}
                    {isFlagged && onSuggestFairerLanguage && (
                      <button
                        id={`btn-fairer-lang-${clause.id}`}
                        onClick={() => onSuggestFairerLanguage(clause)}
                        className={`flex items-center gap-1 text-[11px] transition-colors cursor-pointer ${
                          isHighContrast
                            ? 'px-2 py-0.5 border-2 border-black text-black font-bold bg-white hover:bg-black hover:text-white'
                            : 'px-2 py-0.5 text-[#14161B] border border-[#D1D5DB] hover:bg-[#F4F4F2]'
                        }`}
                        title="Generate literal replacement clause text and view redline"
                      >
                        <GitCompare className={`w-3 h-3 ${isHighContrast ? 'text-black' : 'text-[#5A5E68]'}`} />
                        <span>Suggest Fairer Language</span>
                      </button>
                    )}

                    <button
                      id={`btn-simulate-${clause.id}`}
                      onClick={() => onSimulateClause(clause)}
                      className={`flex items-center gap-1 text-[11px] transition-colors cursor-pointer ${
                        isHighContrast
                          ? 'px-2 py-0.5 border-2 border-black text-black font-bold bg-white hover:bg-black hover:text-white'
                          : 'px-2 py-0.5 text-[#14161B] border border-[#D1D5DB] hover:bg-[#F4F4F2]'
                      }`}
                      title="Simulate what happens if this clause is invoked"
                    >
                      <PlayCircle className={`w-3 h-3 ${isHighContrast ? 'text-black' : 'text-[#5A5E68]'}`} />
                      <span>Simulate</span>
                    </button>

                    <button
                      id={`btn-ask-${clause.id}`}
                      onClick={() => onAskAboutClause(clause)}
                      className={`text-[11px] px-1 cursor-pointer ${
                        isHighContrast
                          ? 'text-black font-bold underline hover:bg-black hover:text-white'
                          : 'text-[#5A5E68] hover:text-[#14161B] underline'
                      }`}
                      title="Ask Q&A grounded in this clause"
                    >
                      Ask
                    </button>
                  </div>
                </div>

                {/* Tag explanation note and negotiation strategy */}
                <div
                  className={`mb-3 text-xs flex flex-col gap-1 font-ui ${
                    isHighContrast
                      ? 'bg-white text-black border-2 border-black px-3 py-2'
                      : 'text-[#5A5E68] bg-[#F4F4F2] px-2.5 py-1.5'
                  }`}
                >
                  <div className="flex items-baseline gap-1.5">
                    <span className={`font-bold ${isHighContrast ? 'text-black' : 'font-medium text-[#14161B]'}`}>
                      Assessment:
                    </span>
                    <span className={isHighContrast ? 'text-black font-medium' : ''}>
                      {highlightMatch(clause.tagReason, searchQuery)}
                    </span>
                  </div>
                  {clause.suggestedNegotiationStrategy && (
                    <div
                      className={`text-[11px] pt-1 ${
                        isHighContrast
                          ? 'text-black border-t-2 border-black font-medium'
                          : 'text-[#5A5E68] border-t border-[#E5E7EB]'
                      }`}
                    >
                      <strong className={isHighContrast ? 'text-black font-bold' : 'text-[#14161B]'}>
                        Suggested Negotiation Strategy:{' '}
                      </strong>
                      {highlightMatch(clause.suggestedNegotiationStrategy, searchQuery)}
                    </div>
                  )}
                </div>

                {/* Clause Body — Side-by-side or stacked layout */}
                {viewMode === 'side-by-side' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Source Text */}
                    <div className="space-y-1">
                      <div
                        className={`${
                          isHighContrast
                            ? 'text-[11px] font-mono font-bold text-black uppercase tracking-wider'
                            : 'text-[10px] font-mono text-[#5A5E68] uppercase tracking-wider'
                        } font-ui`}
                      >
                        Source Document Text
                      </div>
                      <p
                        className={`font-document select-text ${
                          isHighContrast
                            ? 'text-[15.5px] text-black font-normal leading-[1.85] tracking-[0.01em]'
                            : 'text-sm text-[#14161B] leading-relaxed'
                        } max-w-prose`}
                      >
                        {highlightMatch(clause.originalText, searchQuery)}
                      </p>
                    </div>

                    {/* Right Column: Explain-it-Twice Simplification */}
                    <div
                      className={`space-y-1 ${
                        isHighContrast
                          ? 'bg-white p-3.5 border-2 border-black'
                          : 'bg-[#F9F9F8] p-3.5 rounded border border-[#E5E7EB]/80'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between pb-1 mb-1 font-mono font-ui text-[10px] ${
                          isHighContrast ? 'border-b-2 border-black' : 'border-b border-[#E5E7EB]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`uppercase tracking-wider font-bold ${isHighContrast ? 'text-black' : 'text-[#5A5E68]'}`}>
                            Explain-It-Twice:
                          </span>
                          <button
                            onClick={() => toggleClauseRegister(clause.id)}
                            className={`px-1.5 py-0.5 rounded font-bold text-[10px] transition-colors cursor-pointer ${
                              !isPrecise
                                ? isHighContrast
                                  ? 'bg-black text-white border border-black'
                                  : 'bg-[#14161B] text-white'
                                : isHighContrast
                                ? 'bg-white border-2 border-black text-black'
                                : 'bg-white border border-[#D1D5DB] text-[#5A5E68]'
                            }`}
                          >
                            Plain English
                          </button>
                          <button
                            onClick={() => toggleClauseRegister(clause.id)}
                            className={`px-1.5 py-0.5 rounded font-bold text-[10px] transition-colors cursor-pointer ${
                              isPrecise
                                ? isHighContrast
                                  ? 'bg-black text-white border border-black'
                                  : 'bg-[#14161B] text-white'
                                : isHighContrast
                                ? 'bg-white border-2 border-black text-black'
                                : 'bg-white border border-[#D1D5DB] text-[#5A5E68]'
                            }`}
                          >
                            Legal Precise
                          </button>
                        </div>

                        <span className={`text-[9px] hidden sm:inline ${isHighContrast ? 'text-black font-semibold' : 'text-[#5A5E68]'}`}>
                          {isPrecise ? 'Terms defined inline' : 'Simplified version'}
                        </span>
                      </div>

                      <p
                        className={`font-document select-text ${
                          isHighContrast
                            ? 'text-[15.5px] text-black font-normal leading-[1.85] tracking-[0.01em]'
                            : 'text-sm text-[#14161B] leading-relaxed'
                        }`}
                      >
                        {renderTextWithJargon(
                          isPrecise ? clause.preciseText : clause.simplifiedText,
                          clause.jargonTerms,
                          isPrecise,
                          searchQuery
                        )}
                      </p>
                    </div>
                  </div>
                ) : viewMode === 'stacked' ? (
                  <div className="space-y-3">
                    <div>
                      <div
                        className={`${
                          isHighContrast
                            ? 'text-[11px] font-mono font-bold text-black uppercase tracking-wider mb-1'
                            : 'text-[10px] font-mono text-[#5A5E68] uppercase tracking-wider mb-1'
                        } font-ui`}
                      >
                        Source Document Text
                      </div>
                      <p
                        className={`font-document select-text ${
                          isHighContrast
                            ? 'text-[15.5px] text-black font-normal leading-[1.85] tracking-[0.01em]'
                            : 'text-sm text-[#14161B] leading-relaxed'
                        } max-w-prose`}
                      >
                        {highlightMatch(clause.originalText, searchQuery)}
                      </p>
                    </div>

                    <div
                      className={`p-3.5 ${
                        isHighContrast
                          ? 'bg-white border-2 border-black'
                          : 'bg-[#F9F9F8] rounded border border-[#E5E7EB]'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between pb-1.5 mb-1.5 font-mono font-ui text-[10px] ${
                          isHighContrast ? 'border-b-2 border-black' : 'border-b border-[#E5E7EB]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`uppercase tracking-wider font-bold ${isHighContrast ? 'text-black' : 'text-[#5A5E68]'}`}>
                            Explain-It-Twice:
                          </span>
                          <button
                            onClick={() => toggleClauseRegister(clause.id)}
                            className={`px-1.5 py-0.5 rounded font-bold text-[10px] cursor-pointer ${
                              !isPrecise
                                ? isHighContrast
                                  ? 'bg-black text-white border border-black'
                                  : 'bg-[#14161B] text-white'
                                : isHighContrast
                                ? 'bg-white border-2 border-black text-black'
                                : 'bg-white border border-[#D1D5DB] text-[#5A5E68]'
                            }`}
                          >
                            Plain English
                          </button>
                          <button
                            onClick={() => toggleClauseRegister(clause.id)}
                            className={`px-1.5 py-0.5 rounded font-bold text-[10px] cursor-pointer ${
                              isPrecise
                                ? isHighContrast
                                  ? 'bg-black text-white border border-black'
                                  : 'bg-[#14161B] text-white'
                                : isHighContrast
                                ? 'bg-white border-2 border-black text-black'
                                : 'bg-white border border-[#D1D5DB] text-[#5A5E68]'
                            }`}
                          >
                            Legal Precise
                          </button>
                        </div>
                      </div>

                      <p
                        className={`font-document select-text ${
                          isHighContrast
                            ? 'text-[15.5px] text-black font-normal leading-[1.85] tracking-[0.01em]'
                            : 'text-sm text-[#14161B] leading-relaxed'
                        }`}
                      >
                        {renderTextWithJargon(
                          isPrecise ? clause.preciseText : clause.simplifiedText,
                          clause.jargonTerms,
                          isPrecise,
                          searchQuery
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Original Only */
                  <div>
                    <p
                      className={`font-document select-text ${
                        isHighContrast
                          ? 'text-[15.5px] text-black font-normal leading-[1.85] tracking-[0.01em]'
                          : 'text-sm text-[#14161B] leading-relaxed'
                      } max-w-prose`}
                    >
                      {highlightMatch(clause.originalText, searchQuery)}
                    </p>
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>

      {/* Inline Jargon Hover Popover */}
      {activeTooltip && (
        <div
          className={`fixed z-50 p-2.5 shadow-2xl max-w-xs text-xs font-ui pointer-events-none ${
            isHighContrast
              ? 'bg-black text-white border-2 border-yellow-400'
              : 'bg-[#14161B] text-white rounded'
          }`}
          style={{ left: `${activeTooltip.x}px`, top: `${activeTooltip.y}px` }}
        >
          <div className="font-bold text-yellow-300 mb-0.5">{activeTooltip.term}</div>
          <div className={`${isHighContrast ? 'text-white' : 'text-[#D1D5DB]'} leading-normal font-normal`}>
            {activeTooltip.definition}
          </div>
        </div>
      )}
    </div>
  );
};

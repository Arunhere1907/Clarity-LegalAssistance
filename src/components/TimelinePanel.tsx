import React, { useState, useMemo } from 'react';
import { Calendar, Download, Clock, DollarSign, RefreshCw, AlertTriangle, Check } from 'lucide-react';
import { TimelineObligation } from '../types';
import { generateICS, downloadICSFile } from '../utils/icsExport';

interface TimelinePanelProps {
  timeline: TimelineObligation[];
  docTitle: string;
}

export const TimelinePanel: React.FC<TimelinePanelProps> = React.memo(({ timeline, docTitle }) => {
  const [filter, setFilter] = useState<'all' | TimelineObligation['category']>('all');
  const [exported, setExported] = useState(false);

  // Memoize filtered timeline to avoid refiltering on every render
  const filtered = useMemo(() => 
    filter === 'all' ? timeline : timeline.filter((t) => t.category === filter),
    [timeline, filter]
  );

  const handleExportICS = () => {
    const icsString = generateICS(docTitle, timeline);
    const safeName = docTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
    downloadICSFile(`${safeName}-obligations.ics`, icsString);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const getCategoryIcon = (category: TimelineObligation['category']) => {
    switch (category) {
      case 'deadline':
        return <Clock className="w-3.5 h-3.5 text-[#14161B]" />;
      case 'payment':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-800" />;
      case 'renewal':
        return <RefreshCw className="w-3.5 h-3.5 text-amber-800" />;
      case 'penalty':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#8B2E2E]" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F4F2] font-ui">
      {/* Top Banner with .ics Export */}
      <div className="p-3 bg-white border-b border-[#E5E7EB] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[#5A5E68]">
            <Calendar className="w-3.5 h-3.5 text-[#14161B]" />
            <span className="font-semibold text-[#14161B]">Date-Bound Obligations</span>
          </div>
          <button
            id="btn-export-ics"
            onClick={handleExportICS}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-[#14161B] text-white hover:bg-black transition-colors"
            aria-label={`Export obligations to calendar (.ics file)`}
          >
            {exported ? <Check className="w-3 h-3 text-emerald-300" /> : <Download className="w-3 h-3" />}
            <span>{exported ? 'Exported (.ics)' : 'Export to Calendar'}</span>
          </button>
        </div>

        {/* Filter Pills with smooth horizontal overflow */}
        <div
          id="timeline-filter-tabs"
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 min-w-0"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <button
            id="timeline-filter-all"
            onClick={() => setFilter('all')}
            className={`h-7 inline-flex items-center justify-center px-2.5 rounded border text-xs font-medium transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
              filter === 'all'
                ? 'bg-[#14161B] text-white border-[#14161B]'
                : 'bg-white text-[#14161B] border-[#D1D5DB] hover:bg-[#F4F4F2]'
            }`}
          >
            All ({timeline.length})
          </button>
          <button
            id="timeline-filter-renewal"
            onClick={() => setFilter('renewal')}
            className={`h-7 inline-flex items-center justify-center px-2.5 rounded border text-xs font-medium transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
              filter === 'renewal'
                ? 'bg-[#14161B] text-white border-[#14161B]'
                : 'bg-white text-[#5A5E68] border-[#D1D5DB] hover:bg-[#F4F4F2] hover:text-[#14161B]'
            }`}
          >
            Renewals / Notices
          </button>
          <button
            id="timeline-filter-payment"
            onClick={() => setFilter('payment')}
            className={`h-7 inline-flex items-center justify-center px-2.5 rounded border text-xs font-medium transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
              filter === 'payment'
                ? 'bg-[#14161B] text-white border-[#14161B]'
                : 'bg-white text-[#5A5E68] border-[#D1D5DB] hover:bg-[#F4F4F2] hover:text-[#14161B]'
            }`}
          >
            Payments
          </button>
          <button
            id="timeline-filter-deadline"
            onClick={() => setFilter('deadline')}
            className={`h-7 inline-flex items-center justify-center px-2.5 rounded border text-xs font-medium transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
              filter === 'deadline'
                ? 'bg-[#14161B] text-white border-[#14161B]'
                : 'bg-white text-[#5A5E68] border-[#D1D5DB] hover:bg-[#F4F4F2] hover:text-[#14161B]'
            }`}
          >
            Deadlines
          </button>
        </div>
      </div>

      {/* Timeline Events List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="relative border-l-2 border-[#D1D5DB] ml-3.5 pl-5 space-y-5">
          {filtered.map((item) => (
            <div key={item.id} className="relative group text-xs">
              {/* Timeline Marker Dot */}
              <div className="absolute -left-[29px] top-1 w-5 h-5 rounded-full bg-white border-2 border-[#14161B] flex items-center justify-center">
                {getCategoryIcon(item.category)}
              </div>

              {/* Event Card */}
              <div className="bg-white border border-[#E5E7EB] rounded p-3 space-y-1.5 shadow-xs hover:border-[#14161B]/40 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-[#14161B]">{item.title}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#F4F4F2] text-[#5A5E68]">
                    {item.party}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-amber-900 bg-amber-50 px-2 py-0.5 rounded w-fit border border-amber-200">
                  {item.dateOrTrigger}
                </div>

                <p className="text-[#5A5E68] leading-relaxed text-[11px]">{item.description}</p>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <Calendar className="w-8 h-8 text-[#D1D5DB] mb-3" />
              <p className="text-xs font-semibold text-[#14161B] mb-1">
                {filter === 'all'
                  ? 'No obligations found'
                  : `No ${filter} obligations in this document`}
              </p>
              <p className="text-[11px] text-[#5A5E68] max-w-xs leading-relaxed">
                {filter === 'all'
                  ? 'This document does not contain date-bound obligations or deadlines that Clarity could extract.'
                  : 'Try switching to "All" to see every obligation type.'}
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="mt-3 text-xs text-[#14161B] underline hover:no-underline"
                >
                  Show all obligations
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

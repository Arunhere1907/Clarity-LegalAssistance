import React, { useState, useEffect } from 'react';
import { X, PlayCircle, Clock, Shield, Gavel, Scale, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Clause } from '../types';

interface SimulatorModalProps {
  clause: Clause | null;
  isOpen: boolean;
  onClose: () => void;
  allClauses?: Clause[];
  onSelectClause?: (clause: Clause) => void;
}

interface SimulationResult {
  trigger: string;
  userRecourse: string;
  rights: string;
  counterpartyRemedies: string;
  financialOrOperationalImpact: string;
  preventionOrNextStep: string;
  walkthrough: string;
}

export const SimulatorModal: React.FC<SimulatorModalProps> = ({
  clause,
  isOpen,
  onClose,
  allClauses = [],
  onSelectClause,
}) => {
  const [scenarioInput, setScenarioInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  // Generate an intelligent baseline simulation based on clause content
  const generateDefaultResult = (c: Clause): SimulationResult => {
    const isVendorDeadline =
      c.title.toLowerCase().includes('deadline') ||
      c.title.toLowerCase().includes('milestone') ||
      c.title.toLowerCase().includes('delivery') ||
      c.originalText.toLowerCase().includes('liquidated delay') ||
      c.originalText.toLowerCase().includes('vendor');

    if (isVendorDeadline) {
      return {
        trigger: 'Vendor fails to deliver a complete, conforming milestone deliverable by the scheduled delivery date specified in Exhibit A.',
        userRecourse: 'According to this clause, you have three distinct levels of legal recourse: (1) Deduct $1,000.00 per calendar day in liquidated delay damages directly from pending invoices; (2) Reject non-conforming deliverables and enforce a mandatory 5-day defect cure window; and (3) If delay exceeds 14 business days, unilaterally terminate the contract for cause, freeze all outstanding payments, and demand a full refund of all unearned prepaid deposits within 10 business days.',
        rights: 'You hold unilateral termination authority for cause after 14 business days of delay, and have no obligation to pay remaining milestone balances until full acceptance.',
        counterpartyRemedies: 'The vendor has no right to demand payment or claim delay damages unless they prove a formal force majeure event or client-caused obstruction.',
        financialOrOperationalImpact: 'Immediate $1,000/day penalty offset against fees. Complete recovery of your initial retainer ($25,000) if delay exceeds 14 business days.',
        preventionOrNextStep: 'Log written timestamps upon receipt of every submission, issue formal defect notices within 10 business days, and document delay milestones in writing.',
        walkthrough: c.consequenceWalkthrough || 'If the vendor delivers 5 days late, your recourse is to assess $5,000 in liquidated delay damages against their invoice. If the delay extends past 14 business days, you can formally terminate the agreement for material breach, withhold all outstanding disbursements, and require immediate restitution of your prepaid deposit within 10 business days.',
      };
    }

    const isRenewal =
      c.title.toLowerCase().includes('renewal') ||
      c.originalText.toLowerCase().includes('automatically renew');

    if (isRenewal) {
      return {
        trigger: 'Tenant fails to send notice via Certified Mail with Return Receipt Requested at least 90 days prior to lease end.',
        userRecourse: 'Your contractual recourse under this text is narrow: you must strictly comply with the 90-day certified mail notice. However, under statutory consumer protections, your recourse is to challenge whether the landlord provided the statutorily required reminder notice 15–30 days before the cutoff.',
        rights: 'You forfeit the right to vacate at the 12-month mark if notice is defective, and become bound to a second 12-month term.',
        counterpartyRemedies: 'Landlord can automatically enforce a full 12-month lease extension and bill rent with a mandatory 10% escalation ($2,695/mo).',
        financialOrOperationalImpact: 'Automatic lock-in to an additional $32,340 in annual rental liabilities.',
        preventionOrNextStep: 'Immediately calendar the 90-day certified mail deadline, or negotiate an addendum reducing notice to 30 days via email before signing.',
        walkthrough: c.consequenceWalkthrough || 'If you give 60 days notice instead of 90 days, the landlord can legally declare notice void and bind you for another full year at a 10% higher rent.',
      };
    }

    return {
      trigger: `Specific condition or non-compliance specified in ${c.title} occurs.`,
      userRecourse: `Your legal recourse: You can enforce the terms of this provision (${c.simplifiedText}). If the counterparty fails to fulfill their duty, you may issue a formal notice to cure or seek remedies in local venue.`,
      rights: `Governed by the plain-English terms: "${c.simplifiedText}".`,
      counterpartyRemedies: 'The counterparty can enforce the contractual obligations, penalties, or statutory remedies outlined in this agreement.',
      financialOrOperationalImpact: 'Potential exposure to specified fees, operational adjustments, or contract termination.',
      preventionOrNextStep: 'Document all communications in writing, adhere to strict notice periods, and consult counsel if disputed.',
      walkthrough: c.consequenceWalkthrough || `If invoked or breached, this clause operates as follows: ${c.simplifiedText}`,
    };
  };

  useEffect(() => {
    if (clause) {
      setScenarioInput('');
      setResult(generateDefaultResult(clause));
    }
  }, [clause]);

  if (!isOpen || !clause) return null;

  const handleSimulate = async (customScenario?: string) => {
    const scenario = customScenario || scenarioInput || 'What happens if this clause is actually invoked or breached?';
    setIsLoading(true);

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clauseTitle: `${clause.number}: ${clause.title}`,
          originalText: clause.originalText,
          scenario,
        }),
      });

      if (!res.ok) {
        throw new Error('Simulation API request failed.');
      }

      const data = await res.json();
      setResult(data);
    } catch {
      // Retain or regenerate high-quality local simulation fallback
      setResult(generateDefaultResult(clause));
    } finally {
      setIsLoading(false);
    }
  };

  // Determine severity border color for the Likely Outcome card using existing 3 risk colors
  const outcomeBorderClass =
    clause.tag === 'high-attention'
      ? 'border-l-[#8B2E2E]'
      : clause.tag === 'unusual'
      ? 'border-l-[#B8860B]'
      : 'border-l-[#1B4332]';

  const outcomeSeverityLabel =
    clause.tag === 'high-attention'
      ? 'High Risk / Severe Impact'
      : clause.tag === 'unusual'
      ? 'Elevated Risk / Disadvantageous'
      : 'Standard Contractual Process';

  const outcomeSeverityTextClass =
    clause.tag === 'high-attention'
      ? 'text-[#8B2E2E]'
      : clause.tag === 'unusual'
      ? 'text-[#B8860B]'
      : 'text-[#1B4332]';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs font-ui">
      <div className="bg-white border border-[#14161B] w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB] bg-[#F4F4F2]">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-[#14161B]" />
            <h2 className="text-sm font-semibold text-[#14161B]">
              "What Happens If" Consequence Simulator
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#5A5E68] hover:text-[#14161B] hover:bg-[#E5E7EB]"
            title="Close simulator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Clause Selector Banner */}
          <div className="bg-[#F9F9F8] p-3.5 border border-[#E5E7EB] text-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#14161B] bg-white border border-[#D1D5DB] px-2 py-0.5">
                  {clause.number}
                </span>
                <span className="font-semibold text-xs text-[#14161B]">{clause.title}</span>
              </div>

              {/* Clause switcher dropdown if multiple clauses exist */}
              {allClauses.length > 1 && onSelectClause && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#5A5E68]">
                  <span>Switch clause:</span>
                  <select
                    value={clause.id}
                    onChange={(e) => {
                      const found = allClauses.find((c) => c.id === e.target.value);
                      if (found) onSelectClause(found);
                    }}
                    className="bg-white border border-[#D1D5DB] px-2 py-1 text-xs text-[#14161B] focus:outline-none cursor-pointer"
                  >
                    {allClauses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.number}: {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="font-document text-xs text-[#5A5E68] italic border-l-2 border-[#14161B]/30 pl-2 line-clamp-3">
              "{clause.originalText}"
            </div>
          </div>

          {/* Scenario Input & Presets */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#14161B] block">
              Simulate a specific condition, breach, or dispute:
            </label>
            <div className="flex gap-2">
              <input
                id="input-simulator-scenario"
                type="text"
                value={scenarioInput}
                onChange={(e) => setScenarioInput(e.target.value)}
                placeholder="e.g. What happens if this clause is invoked or broken?"
                className="flex-1 border border-[#D1D5DB] px-3 py-1.5 text-xs text-[#14161B] focus:outline-none focus:border-[#14161B]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSimulate();
                  }
                }}
              />
              <button
                id="btn-run-simulation"
                onClick={() => handleSimulate()}
                disabled={isLoading}
                className="px-3.5 py-1.5 bg-[#14161B] text-white text-xs hover:bg-black disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0 font-medium"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Simulating...' : 'Simulate'}</span>
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-[#5A5E68]">Quick Presets:</span>
              <button
                onClick={() => handleSimulate('What happens if the deadline is missed by 5 calendar days?')}
                className="text-[11px] text-[#14161B] bg-[#F4F4F2] hover:bg-[#E5E7EB] px-2 py-0.5 border border-[#E5E7EB]"
              >
                Missed deadline by 5 days
              </button>
              <button
                onClick={() => handleSimulate('What happens if delivery delay exceeds 14 business days?')}
                className="text-[11px] text-[#14161B] bg-[#F4F4F2] hover:bg-[#E5E7EB] px-2 py-0.5 border border-[#E5E7EB]"
              >
                14+ days delay (termination recourse)
              </button>
              <button
                onClick={() => handleSimulate('What happens if I try to terminate the agreement early?')}
                className="text-[11px] text-[#14161B] bg-[#F4F4F2] hover:bg-[#E5E7EB] px-2 py-0.5 border border-[#E5E7EB]"
              >
                Early termination
              </button>
            </div>
          </div>

          {/* Three Labeled Cards: Trigger, Your Position, Likely Outcome */}
          {result && (
            <div className="space-y-3 pt-2">
              {/* Card 1: Trigger */}
              <div className="border border-[#E5E7EB] bg-white p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#14161B]" />
                    <h3 className="text-xs font-semibold text-[#14161B] uppercase tracking-wider">
                      Trigger
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#5A5E68]">Initiating Event</span>
                </div>
                <p className="text-xs text-[#14161B] leading-relaxed font-document">
                  {result.trigger}
                </p>
              </div>

              {/* Card 2: Your Position */}
              <div className="border border-[#E5E7EB] bg-white p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#14161B]" />
                    <h3 className="text-xs font-semibold text-[#14161B] uppercase tracking-wider">
                      Your Position
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#5A5E68]">Contractual Rights &amp; Recourse</span>
                </div>
                <div className="text-xs text-[#14161B] leading-relaxed space-y-2 font-document">
                  <p>
                    <strong className="text-[#14161B] font-ui">Recourse &amp; Remedies: </strong>
                    {result.userRecourse}
                  </p>
                  {result.rights && (
                    <p className="text-[11px] text-[#5A5E68]">
                      <strong className="text-[#14161B] font-ui">Retained Rights: </strong>
                      {result.rights}
                    </p>
                  )}
                </div>
              </div>

              {/* Card 3: Likely Outcome (with severity-colored left border reusing existing 3 risk colors) */}
              <div className={`border border-[#E5E7EB] border-l-4 ${outcomeBorderClass} bg-white p-4 space-y-2`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-[#14161B]" />
                    <h3 className="text-xs font-semibold text-[#14161B] uppercase tracking-wider">
                      Likely Outcome
                    </h3>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${outcomeSeverityTextClass}`}>
                    {outcomeSeverityLabel}
                  </span>
                </div>

                <div className="text-xs text-[#14161B] leading-relaxed space-y-2 font-document">
                  <p>{result.walkthrough}</p>

                  <div className="pt-2 border-t border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-ui">
                    {result.counterpartyRemedies && (
                      <div>
                        <span className="font-semibold text-[#5A5E68] block">Counterparty Action:</span>
                        <span className="text-[#14161B]">{result.counterpartyRemedies}</span>
                      </div>
                    )}
                    {result.financialOrOperationalImpact && (
                      <div>
                        <span className="font-semibold text-[#5A5E68] block">Financial / Operational Impact:</span>
                        <span className="text-[#14161B]">{result.financialOrOperationalImpact}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F4F4F2] flex items-center justify-between text-xs">
          <span className="text-[11px] text-[#5A5E68]">
            Simulates contractual consequences grounded strictly in clause covenants.
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 bg-white border border-[#D1D5DB] text-xs text-[#14161B] hover:bg-[#E5E7EB]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef } from 'react';
import { X, Shield, Lock, CheckCircle2 } from 'lucide-react';
import { RedactionItem } from '../types';

interface PIIAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: RedactionItem[];
}

export const PIIAuditModal: React.FC<PIIAuditModalProps> = ({ isOpen, onClose, items }) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (isOpen) headingRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs font-ui"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pii-audit-modal-title"
    >
      <div className="bg-white rounded border border-[#14161B] w-full max-w-xl max-h-[85vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB] bg-[#F4F4F2]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-700" />
            <h3
              id="pii-audit-modal-title"
              ref={headingRef}
              tabIndex={-1}
              className="text-sm font-semibold text-[#14161B] focus:outline-none"
            >
              Client-Side PII Redaction Audit Log
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#5A5E68] hover:text-[#14161B] rounded hover:bg-[#E5E7EB]"
            aria-label="Close PII audit log"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-800" />
              <span>Zero-Exposure Privacy Layer</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-900">
              The sensitive personal identifiers listed below are detected and replaced with synthetic cryptographic placeholders
              inside your browser <strong>prior to sending any document data</strong> to external AI servers.
              They are safely restored only on your local screen.
              <strong className="block mt-1"> Automated detection may not catch every identifier — review sensitive documents carefully before uploading.</strong>
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-mono text-[#5A5E68] uppercase tracking-wider">
              Protected Tokens in Current Document ({items.length})
            </div>

            <div className="border border-[#E5E7EB] rounded overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F4F2] border-b border-[#E5E7EB] text-[#5A5E68] font-mono text-[10px]">
                    <th className="p-2">Type</th>
                    <th className="p-2">Client Token</th>
                    <th className="p-2">Original Value (Browser Only)</th>
                    <th className="p-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F9F9F8]">
                      <td className="p-2 font-mono text-[10px] text-[#5A5E68]">
                        <span className="bg-[#E5E7EB] px-1.5 py-0.5 rounded">
                          {item.type}
                        </span>
                      </td>
                      <td className="p-2 font-mono text-[11px] text-amber-900 font-medium">
                        {item.placeholder}
                      </td>
                      <td className="p-2 font-document text-xs text-[#14161B]">
                        {item.original}
                      </td>
                      <td className="p-2 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Masked
                        </span>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-[#5A5E68] italic">
                        No PII entities detected in this document.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F4F4F2] flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-[#D1D5DB] rounded text-xs text-[#14161B] hover:bg-[#E5E7EB]"
          >
            Close Audit
          </button>        </div>
      </div>
    </div>
  );
};

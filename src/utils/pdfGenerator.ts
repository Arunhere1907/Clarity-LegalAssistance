import { jsPDF } from 'jspdf';
import { DocumentAnalysis, Clause } from '../types';

/**
 * Generates and triggers a download of a clean, styled PDF report
 * detailing contract risks, assessments, and suggested changes.
 */
export function downloadDocumentRiskReportPDF(docAnalysis: DocumentAnalysis): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt
  const pageHeight = doc.internal.pageSize.getHeight(); // 841.89 pt
  const margin = 40;
  const contentWidth = pageWidth - margin * 2; // 515.28 pt
  const bottomThreshold = pageHeight - 55;

  let y = margin;

  // Helper: check if remaining space on current page is sufficient, otherwise add a page
  const ensureSpace = (neededPt: number) => {
    if (y + neededPt > bottomThreshold) {
      doc.addPage();
      y = 55;
      drawRunningHeader();
    }
  };

  const drawRunningHeader = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(110, 114, 122);
    doc.text('CLARITY LEGAL • RISK & SUGGESTED CHANGES REPORT', margin, 32);
    const titleSnippet = docAnalysis.title.length > 35 ? docAnalysis.title.slice(0, 35) + '...' : docAnalysis.title;
    doc.text(titleSnippet, pageWidth - margin, 32, { align: 'right' });
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, 38, pageWidth - margin, 38);
  };

  // --- PAGE 1: HEADER BANNER ---
  // Top branding bar
  doc.setFillColor(20, 22, 27);
  doc.rect(margin, y, contentWidth, 54, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('CLARITY LEGAL DOCUMENT ANALYSIS', margin + 14, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(209, 213, 219);
  doc.text('CONTRACT RISK ASSESSMENT & COUNTER-PROPOSAL REPORT', margin + 14, y + 41);

  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  doc.text(`Generated: ${dateStr}`, pageWidth - margin - 14, y + 41, { align: 'right' });

  y += 68;

  // Document Title & Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(20, 22, 27);
  const titleLines = doc.splitTextToSize(docAnalysis.title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 20 + 4;

  // Metadata Chips
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90, 94, 104);
  const metaText = `Type: ${docAnalysis.detectedType}   |   Clauses Analyzed: ${docAnalysis.clauses.length}   |   Intake ID: ${docAnalysis.id}`;
  doc.text(metaText, margin, y);
  y += 18;

  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 16;

  // --- RISK SCORECARD SUMMARY ---
  const highAttCount = docAnalysis.clauses.filter((c) => c.tag === 'high-attention').length;
  const unusualCount = docAnalysis.clauses.filter((c) => c.tag === 'unusual').length;
  const standardCount = docAnalysis.clauses.filter((c) => c.tag === 'standard').length;
  const missingCount = (docAnalysis.lawyerBrief?.missingProvisions?.length || 0) +
    docAnalysis.clauses.filter((c) => c.tag === 'missing-but-expected').length;

  const cardWidth = (contentWidth - 18) / 4;
  const cardHeight = 44;

  const cards = [
    { label: 'High Attention', count: highAttCount, bg: [254, 242, 242], border: [239, 68, 68], text: [139, 46, 46] },
    { label: 'Unusual Terms', count: unusualCount, bg: [254, 249, 195], border: [234, 179, 8], text: [161, 98, 7] },
    { label: 'Standard Terms', count: standardCount, bg: [240, 253, 244], border: [34, 197, 94], text: [21, 128, 61] },
    { label: 'Custom/Missing', count: missingCount, bg: [244, 244, 242], border: [209, 213, 219], text: [75, 85, 99] },
  ];

  cards.forEach((card, i) => {
    const cardX = margin + i * (cardWidth + 6);
    doc.setFillColor(card.bg[0], card.bg[1], card.bg[2]);
    doc.setDrawColor(card.border[0], card.border[1], card.border[2]);
    doc.setLineWidth(0.75);
    doc.rect(cardX, y, cardWidth, cardHeight, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(card.text[0], card.text[1], card.text[2]);
    doc.text(String(card.count), cardX + 10, y + 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(card.text[0], card.text[1], card.text[2]);
    doc.text(card.label, cardX + 10, y + 34);
  });

  y += cardHeight + 18;

  // --- EXECUTIVE SUMMARY ---
  ensureSpace(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 22, 27);
  doc.text('1. EXECUTIVE SUMMARY', margin, y);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  const summaryLines = doc.splitTextToSize(docAnalysis.summary, contentWidth - 16);
  const summaryBoxH = summaryLines.length * 13 + 14;

  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.rect(margin, y, contentWidth, summaryBoxH, 'FD');

  doc.text(summaryLines, margin + 8, y + 14);
  y += summaryBoxH + 20;

  // --- SECTION 2: FLAGGED RISKS & SUGGESTED REVISIONS ---
  ensureSpace(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 22, 27);
  doc.text('2. IDENTIFIED RISKS & RECOMMENDED REVISIONS', margin, y);
  y += 6;
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  // Sort: High Attention first, then Unusual, then others
  const sortedClauses = [...docAnalysis.clauses].sort((a, b) => {
    const order: Record<string, number> = {
      'high-attention': 1,
      'unusual': 2,
      'missing-but-expected': 3,
      'standard': 4,
    };
    return (order[a.tag] || 5) - (order[b.tag] || 5);
  });

  // Filter to high-attention, unusual, and any clause that has suggested replacements or strategies
  const flaggedOrActionable = sortedClauses.filter(
    (c) => c.tag === 'high-attention' || c.tag === 'unusual' || c.suggestedReplacementText || c.suggestedNegotiationStrategy
  );

  const renderClauseCard = (clause: Clause, index: number) => {
    const isHighAtt = clause.tag === 'high-attention';
    const isUnusual = clause.tag === 'unusual';

    const badgeText = isHighAtt ? 'HIGH ATTENTION' : isUnusual ? 'UNUSUAL' : 'STANDARD';
    const badgeColor: [number, number, number] = isHighAtt ? [139, 46, 46] : isUnusual ? [184, 134, 11] : [27, 67, 50];

    // Estimate height needed for this card
    const headerH = 22;
    const assessmentLines = doc.splitTextToSize(`Assessment: ${clause.tagReason}`, contentWidth - 24);
    const assessH = assessmentLines.length * 11.5 + 8;

    const origExcerpt = clause.originalText.length > 280 ? clause.originalText.slice(0, 280) + '...' : clause.originalText;
    const origLines = doc.splitTextToSize(`"${origExcerpt}"`, contentWidth - 32);
    const origH = origLines.length * 11 + 16;

    const replacementText = clause.suggestedReplacementText || clause.suggestedNegotiationStrategy;
    const replLines = replacementText
      ? doc.splitTextToSize(replacementText, contentWidth - 32)
      : [];
    const replH = replacementText ? replLines.length * 11 + 22 : 0;

    const totalEstimated = headerH + assessH + origH + replH + 20;
    ensureSpace(Math.min(totalEstimated, 200));

    const startY = y;

    // Card background & border
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.75);
    doc.rect(margin, startY, contentWidth, totalEstimated, 'FD');

    // Left risk accent line
    doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    doc.rect(margin, startY, 4, totalEstimated, 'F');

    // Clause Title & Number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(20, 22, 27);
    const titleText = `${clause.number} • ${clause.title}`;
    doc.text(titleText, margin + 12, startY + 15);

    // Risk badge on right
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    const badgeWidth = doc.getTextWidth(badgeText) + 12;
    const badgeX = pageWidth - margin - badgeWidth - 10;
    doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    doc.roundedRect(badgeX, startY + 6, badgeWidth, 13, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(badgeText, badgeX + 6, startY + 15.5);

    let innerY = startY + 26;

    // Assessment text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(75, 85, 99);
    doc.text(assessmentLines, margin + 12, innerY);
    innerY += assessH;

    // Original Document Quote box
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.rect(margin + 12, innerY - 4, contentWidth - 24, origH, 'FD');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('Source Clause Language:', margin + 18, innerY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(31, 41, 55);
    doc.text(origLines, margin + 18, innerY + 18);
    innerY += origH + 8;

    // Suggested Replacement / Negotiation Strategy Box
    if (replacementText) {
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.setLineWidth(0.5);
      doc.rect(margin + 12, innerY - 4, contentWidth - 24, replH, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(21, 128, 61);
      const label = clause.suggestedReplacementText ? 'RECOMMENDED REPLACEMENT CLAUSE TEXT:' : 'SUGGESTED NEGOTIATION COUNTER-STRATEGY:';
      doc.text(label, margin + 18, innerY + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(20, 83, 45);
      doc.text(replLines, margin + 18, innerY + 20);
      innerY += replH + 8;
    }

    y = startY + totalEstimated + 12;
  };

  flaggedOrActionable.forEach((clause, idx) => {
    renderClauseCard(clause, idx);
  });

  // --- SECTION 3: CUSTOMARY PROVISIONS OMITTED ---
  const missingProvisions = docAnalysis.lawyerBrief?.missingProvisions || [];
  if (missingProvisions.length > 0) {
    ensureSpace(70);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 22, 27);
    doc.text('3. CUSTOMARY PROVISIONS OMITTED FROM DOCUMENT', margin, y);
    y += 6;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(55, 65, 81);

    missingProvisions.forEach((provision) => {
      ensureSpace(20);
      const lines = doc.splitTextToSize(`•  ${provision}`, contentWidth - 20);
      doc.text(lines, margin + 8, y);
      y += lines.length * 12 + 4;
    });

    y += 8;
  }

  // --- SECTION 4: PRE-SIGNING ACTION CHECKLIST ---
  const checklist = docAnalysis.questionsChecklist || [];
  if (checklist.length > 0) {
    ensureSpace(70);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 22, 27);
    doc.text('4. PRE-SIGNING CLIENT INQUIRIES & VERIFICATION CHECKLIST', margin, y);
    y += 6;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;

    checklist.forEach((item, idx) => {
      const qLines = doc.splitTextToSize(`${idx + 1}.  ${item.question}`, contentWidth - 24);
      const whyLines = doc.splitTextToSize(`Reason to ask: ${item.whyAsk} (Relates to: ${item.clauseTitle})`, contentWidth - 36);
      const itemH = qLines.length * 12 + whyLines.length * 11 + 12;

      ensureSpace(itemH);

      doc.setFillColor(249, 250, 251);
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.rect(margin, y, contentWidth, itemH, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(17, 24, 39);
      doc.text(qLines, margin + 8, y + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(whyLines, margin + 20, y + 12 + qLines.length * 12);

      y += itemH + 6;
    });

    y += 8;
  }

  // --- SECTION 5: QUESTIONS FOR LEGAL COUNSEL ---
  const counselQuestions = docAnalysis.lawyerBrief?.openQuestions || [];
  if (counselQuestions.length > 0) {
    ensureSpace(70);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 22, 27);
    doc.text('5. SPECIFIC QUESTIONS PREPARED FOR LEGAL COUNSEL', margin, y);
    y += 6;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;

    counselQuestions.forEach((question, idx) => {
      ensureSpace(24);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(31, 41, 55);
      const lines = doc.splitTextToSize(`${idx + 1}.  ${question}`, contentWidth - 16);
      doc.text(lines, margin + 8, y);
      y += lines.length * 12 + 4;
    });

    y += 10;
  }

  // --- LEGAL DISCLAIMER ---
  ensureSpace(45);
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(156, 163, 175);
  const disclaimerText = docAnalysis.lawyerBrief?.disclaimer ||
    'Notice: Clarity Legal provides automated plain-language analysis and document navigation for educational and informational review. It does not provide formal legal representation, attorney-client privileged counsel, or statutory guarantees.';
  const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth);
  doc.text(disclaimerLines, margin, y);

  // --- RUNNING HEADERS AND FOOTERS ON ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Running Header (pages 2+)
    if (p > 1) {
      drawRunningHeader();
    }

    // Running Footer
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 34, pageWidth - margin, pageHeight - 34);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text('Clarity Legal Document Workspace • Confidential Assessment', margin, pageHeight - 22);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 22, { align: 'right' });
  }

  // Sanitize filename
  const cleanTitle = docAnalysis.title
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 40);

  doc.save(`${cleanTitle}_Risk_Report.pdf`);
}

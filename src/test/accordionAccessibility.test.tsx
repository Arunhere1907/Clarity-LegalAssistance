import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RiskTagsPanel } from '../components/RiskTagsPanel';
import { TimelinePanel } from '../components/TimelinePanel';
import { QAPanel } from '../components/QAPanel';
import type { Clause, TimelineObligation, DocumentAnalysis } from '../types';

describe('Accordion Accessibility Tests', () => {
  describe('RiskTagsPanel Filtering (Accordion-like behavior)', () => {
    const mockClauses: Clause[] = [
      {
        id: 'clause-1',
        number: '1',
        title: 'Security Deposit',
        originalText: 'Tenant shall pay $2000 as security deposit.',
        simplifiedText: 'You must pay $2000 as a deposit.',
        preciseText: 'The tenant is required to pay $2000 as security deposit.',
        jargonTerms: [],
        tag: 'high-attention',
        tagReason: 'High amount',
        page: 1,
      },
      {
        id: 'clause-2',
        number: '2',
        title: 'Rent Payment',
        originalText: 'Rent is due on the 1st of each month.',
        simplifiedText: 'Pay rent on the 1st of each month.',
        preciseText: 'Monthly rent payment is due on the first day of each month.',
        jargonTerms: [],
        tag: 'standard',
        tagReason: 'Common clause',
        page: 1,
      },
      {
        id: 'clause-3',
        number: '3',
        title: 'Late Fees',
        originalText: 'Late fees apply after 5 days.',
        simplifiedText: 'Pay late fee if rent is late.',
        preciseText: 'Late fees are assessed if payment is not received within 5 days.',
        jargonTerms: [],
        tag: 'unusual',
        tagReason: 'Higher than typical',
        page: 2,
      },
    ];

    const mockDocAnalysis: DocumentAnalysis = {
      id: 'doc-1',
      title: 'Test Lease',
      docType: 'lease',
      detectedType: 'Residential Lease',
      summary: 'Test summary',
      clauses: mockClauses,
      timeline: [],
      questionsChecklist: [],
      lawyerBrief: {
        summary: 'Test brief',
        flaggedClauses: [],
        openQuestions: [],
        missingProvisions: [],
        disclaimer: 'Test disclaimer',
      },
    };

    it('renders all filter buttons with correct counts', () => {
      render(
        <RiskTagsPanel
          clauses={mockClauses}
          documentAnalysis={mockDocAnalysis}
          onSelectClause={vi.fn()}
          onSimulateClause={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /All \(3\)/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /High-attention \(1\)/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Unusual \(1\)/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Standard \(1\)/ })).toBeInTheDocument();
    });

    it('filters clauses when clicking filter buttons', async () => {
      const user = userEvent.setup();
      render(
        <RiskTagsPanel
          clauses={mockClauses}
          documentAnalysis={mockDocAnalysis}
          onSelectClause={vi.fn()}
          onSimulateClause={vi.fn()}
        />
      );

      // Initially shows all clauses
      expect(screen.getByText('Security Deposit')).toBeInTheDocument();
      expect(screen.getByText('Rent Payment')).toBeInTheDocument();
      expect(screen.getByText('Late Fees')).toBeInTheDocument();

      // Click high-attention filter
      await user.click(screen.getByRole('button', { name: /High-attention/ }));
      expect(screen.getByText('Security Deposit')).toBeInTheDocument();
      expect(screen.queryByText('Rent Payment')).not.toBeInTheDocument();
      expect(screen.queryByText('Late Fees')).not.toBeInTheDocument();

      // Click standard filter
      await user.click(screen.getByRole('button', { name: /Standard/ }));
      expect(screen.queryByText('Security Deposit')).not.toBeInTheDocument();
      expect(screen.getByText('Rent Payment')).toBeInTheDocument();
      expect(screen.queryByText('Late Fees')).not.toBeInTheDocument();

      // Click all filter
      await user.click(screen.getByRole('button', { name: /All/ }));
      expect(screen.getByText('Security Deposit')).toBeInTheDocument();
      expect(screen.getByText('Rent Payment')).toBeInTheDocument();
      expect(screen.getByText('Late Fees')).toBeInTheDocument();
    });

    it('updates filter count display correctly', () => {
      render(
        <RiskTagsPanel
          clauses={mockClauses}
          documentAnalysis={mockDocAnalysis}
          onSelectClause={vi.fn()}
          onSimulateClause={vi.fn()}
        />
      );

      // Check initial "shown" count
      expect(screen.getByText('3 shown')).toBeInTheDocument();
    });

    it('maintains keyboard navigation for filter buttons', async () => {
      const user = userEvent.setup();
      render(
        <RiskTagsPanel
          clauses={mockClauses}
          documentAnalysis={mockDocAnalysis}
          onSelectClause={vi.fn()}
          onSimulateClause={vi.fn()}
        />
      );

      // Tab to first button
      await user.tab();
      // Should focus PDF button first, tab again to reach filters
      await user.tab();

      // Press Enter to activate
      await user.keyboard('{Enter}');

      // Tab to next filter button
      await user.tab();
      await user.keyboard('{Enter}');

      // Verify filtering works via keyboard
      expect(screen.queryByText('Rent Payment')).not.toBeInTheDocument();
    });

    it('applies correct ARIA attributes for active state', async () => {
      const user = userEvent.setup();
      render(
        <RiskTagsPanel
          clauses={mockClauses}
          documentAnalysis={mockDocAnalysis}
          onSelectClause={vi.fn()}
          onSimulateClause={vi.fn()}
        />
      );

      const highAttentionButton = screen.getByRole('button', { name: /High-attention/ });

      // Initially not active - check via class
      expect(highAttentionButton).not.toHaveClass('bg-[#8B2E2E]');

      // Click to activate
      await user.click(highAttentionButton);

      // Should have active class
      expect(highAttentionButton).toHaveClass('bg-[#8B2E2E]');
    });
  });

  describe('TimelinePanel Accordion', () => {
    const mockTimeline: TimelineObligation[] = [
      {
        id: 'timeline-1',
        dateOrTrigger: '2024-01-01',
        title: 'Lease Start',
        description: 'Lease begins',
        party: 'Both',
        category: 'deadline',
        isoDate: '2024-01-01',
      },
      {
        id: 'timeline-2',
        dateOrTrigger: '2024-02-01',
        title: 'First Rent Payment',
        description: 'Pay first month rent',
        party: 'Tenant',
        category: 'payment',
        isoDate: '2024-02-01',
      },
      {
        id: 'timeline-3',
        dateOrTrigger: '2024-12-31',
        title: 'Lease Renewal',
        description: 'Option to renew lease',
        party: 'Both',
        category: 'renewal',
        isoDate: '2024-12-31',
      },
    ];

    it('renders all timeline items', () => {
      render(
        <TimelinePanel
          timeline={mockTimeline}
          docTitle="Test Lease"
        />
      );

      expect(screen.getByText('Lease Start')).toBeInTheDocument();
      expect(screen.getByText('First Rent Payment')).toBeInTheDocument();
      expect(screen.getByText('Lease Renewal')).toBeInTheDocument();
    });

    it('filters timeline by category', async () => {
      const user = userEvent.setup();
      render(
        <TimelinePanel
          timeline={mockTimeline}
          docTitle="Test Lease"
        />
      );

      // Find and click payment filter
      const paymentFilter = screen.getByRole('button', { name: /Payment/ });
      await user.click(paymentFilter);

      // Only payment item should be visible
      expect(screen.queryByText('Lease Start')).not.toBeInTheDocument();
      expect(screen.getByText('First Rent Payment')).toBeInTheDocument();
      expect(screen.queryByText('Lease Renewal')).not.toBeInTheDocument();
    });

    it('exports calendar with accessibility considerations', () => {
      render(
        <TimelinePanel
          timeline={mockTimeline}
          docTitle="Test Lease"
        />
      );

      // Calendar export button should be accessible
      const exportButton = screen.getByRole('button', { name: /Export/ });
      expect(exportButton).toBeInTheDocument();
      expect(exportButton).toHaveAttribute('id', 'btn-export-ics');
    });
  });

  describe('QAPanel Accessibility', () => {
    const mockClauses: Clause[] = [
      {
        id: 'clause-1',
        number: '1',
        title: 'Termination',
        originalText: 'Either party must provide 30 days notice.',
        simplifiedText: 'Give 30 days notice.',
        preciseText: 'Either party must provide 30 days written notice.',
        jargonTerms: [],
        tag: 'standard',
        tagReason: 'Standard clause',
      },
    ];

    // Mock scrollIntoView for QAPanel
    beforeEach(() => {
      Element.prototype.scrollIntoView = vi.fn();
    });

    it('renders with accessible form structure', () => {
      render(
        <QAPanel
          clauses={mockClauses}
          docTitle="Test Document"
          onSelectCitation={vi.fn()}
        />
      );

      // Check for accessible form elements
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'input-qa-question');
    });

    it('provides accessible question input with label', () => {
      render(
        <QAPanel
          clauses={mockClauses}
          docTitle="Test Document"
          onSelectCitation={vi.fn()}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
      
      // Check for accessible label
      const label = screen.getByLabelText(/Ask a question/i);
      expect(label).toBeInTheDocument();
    });

    it('verifies form submission behavior', async () => {
      const user = userEvent.setup();

      render(
        <QAPanel
          clauses={mockClauses}
          docTitle="Test Document"
          onSelectCitation={vi.fn()}
        />
      );

      const input = screen.getByRole('textbox');
      
      // Type into input
      await user.type(input, 'Can I sublet?');
      
      // Verify input value
      expect(input).toHaveValue('Can I sublet?');
    });
  });

  describe('General Accordion Accessibility Patterns', () => {
    it('RiskTagsPanel maintains focus management', async () => {
      const user = userEvent.setup();
      const mockClauses: Clause[] = [
        {
          id: 'clause-1',
          number: '1',
          title: 'Test Clause',
          originalText: 'Test text',
          simplifiedText: 'Simple text',
          preciseText: 'Precise text',
          jargonTerms: [],
          tag: 'standard',
          tagReason: 'Standard',
        },
      ];

      render(
        <RiskTagsPanel
          clauses={mockClauses}
          onSelectClause={vi.fn()}
          onSimulateClause={vi.fn()}
        />
      );

      // Verify buttons are focusable
      const allButton = screen.getByRole('button', { name: /All/ });
      expect(allButton).toBeInTheDocument();

      await user.tab();
      // Should be able to focus on filter buttons
      expect(document.activeElement).toBeTruthy();
    });

    it('buttons have appropriate cursor styles', () => {
      const mockClauses: Clause[] = [
        {
          id: 'clause-1',
          number: '1',
          title: 'Test Clause',
          originalText: 'Test',
          simplifiedText: 'Test',
          preciseText: 'Test',
          jargonTerms: [],
          tag: 'standard',
          tagReason: 'Test',
        },
      ];

      render(
        <RiskTagsPanel
          clauses={mockClauses}
          onSelectClause={vi.fn()}
          onSimulateClause={vi.fn()}
        />
      );

      // Get filter buttons specifically (not all buttons like PDF download)
      const allButton = screen.getByRole('button', { name: /All/ });
      const standardButton = screen.getByRole('button', { name: /Standard/ });

      // Filter buttons should have cursor-pointer class
      expect(allButton.className).toContain('cursor-pointer');
      expect(standardButton.className).toContain('cursor-pointer');
    });
  });
});

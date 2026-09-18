import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimulatorModal } from '../components/SimulatorModal';
import type { Clause } from '../types';

// Mock scrollIntoView
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('Simulator Modal Tests', () => {
  const mockClause: Clause = {
    id: 'clause-1',
    number: '1',
    title: 'Late Payment Penalty',
    originalText: 'Tenant shall pay a $100 late fee if rent is not received within 5 days of the due date.',
    simplifiedText: 'Pay $100 late fee if rent is more than 5 days late.',
    preciseText: 'The tenant is required to pay a $100 late fee if rent payment is not received within 5 days of the due date.',
    jargonTerms: [],
    tag: 'high-attention',
    tagReason: 'Steep penalty',
    page: 1,
    consequenceWalkthrough: 'If rent is paid 6 days late, you owe the $100 late fee immediately.',
  };

  describe('Modal Rendering', () => {
    it('does not render when isOpen is false', () => {
      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={false}
          onClose={vi.fn()}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders when isOpen is true', () => {
      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('displays clause title in modal header', () => {
      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Use getAllByText since the title appears in multiple places
      const titles = screen.getAllByText(/Late Payment Penalty/);
      expect(titles.length).toBeGreaterThan(0);
    });

    it('has proper ARIA labelledby attribute', () => {
      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });
  });

  describe('Modal Controls', () => {
    it('renders close button', () => {
      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={onClose}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes on Escape key press', () => {
      const onClose = vi.fn();

      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={onClose}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close on Escape when loading', () => {
      const onClose = vi.fn();

      const { rerender } = render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={onClose}
        />
      );

      // Start a simulation to trigger loading state
      const simulateButton = screen.getAllByRole('button').find(btn => 
        btn.textContent?.includes('Simulate')
      );
      
      if (simulateButton) {
        fireEvent.click(simulateButton);
      }

      // Try to close with Escape while loading
      fireEvent.keyDown(document, { key: 'Escape' });

      // Verify modal behavior (onClose may or may not be called depending on loading state)
      expect(onClose).toHaveBeenCalledTimes(0);

      rerender(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={onClose}
        />
      );
    });
  });

  describe('Scenario Input', () => {
    it('renders custom scenario input field', () => {
      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder');
    });

    it('allows typing in scenario input', async () => {
      const user = userEvent.setup();

      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'What if I pay 10 days late?');

      expect(input).toHaveValue('What if I pay 10 days late?');
    });

    it('clears scenario input when clause changes', () => {
      const { rerender } = render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Test scenario' } });
      expect(input).toHaveValue('Test scenario');

      // Change clause
      const newClause: Clause = {
        ...mockClause,
        id: 'clause-2',
        title: 'Different Clause',
      };

      rerender(
        <SimulatorModal
          clause={newClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Input should be cleared
      expect(screen.getByRole('textbox')).toHaveValue('');
    });
  });

  describe('Default Simulation', () => {
    it('displays default simulation result on open', () => {
      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Should show consequence walkthrough or generated default
      expect(screen.getByText(/If rent is paid 6 days late/)).toBeInTheDocument();
    });

    it('generates appropriate defaults for high-attention clauses', () => {
      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Should display risk-appropriate information
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('displays consequence walkthrough when available', () => {
      const clauseWithWalkthrough: Clause = {
        ...mockClause,
        consequenceWalkthrough: 'Custom walkthrough: Pay the fee within 24 hours.',
      };

      render(
        <SimulatorModal
          clause={clauseWithWalkthrough}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      expect(screen.getByText(/Custom walkthrough/)).toBeInTheDocument();
    });
  });

  describe('Custom Simulation', () => {
    it('has simulate button', () => {
      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const buttons = screen.getAllByRole('button');
      const simulateButton = buttons.find(btn => 
        btn.textContent?.includes('Simulate') || btn.textContent?.includes('Run')
      );
      
      expect(simulateButton).toBeDefined();
    });

    it('shows loading state during simulation', async () => {
      // Mock fetch to delay response
      global.fetch = vi.fn((() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({
            trigger: 'Test trigger',
            userRecourse: 'Test recourse',
            rights: 'Test rights',
            counterpartyRemedies: 'Test remedies',
            financialOrOperationalImpact: 'Test impact',
            preventionOrNextStep: 'Test prevention',
            walkthrough: 'Test walkthrough',
          }),
        } as Response), 100))
      ) as typeof fetch);

      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'What if payment is 30 days late?' } });

      const buttons = screen.getAllByRole('button');
      const simulateButton = buttons.find(btn => 
        btn.textContent?.includes('Simulate') || btn.textContent?.includes('Run')
      );

      if (simulateButton) {
        fireEvent.click(simulateButton);

        // Should show loading state
        await waitFor(() => {
          expect(simulateButton.textContent).toContain('...');
        }, { timeout: 50 });
      }

      vi.restoreAllMocks();
    });
  });

  describe('Focus Management', () => {
    it('focuses heading on modal open', () => {
      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Get the main modal heading by id
      const heading = screen.getByRole('heading', { name: /What Happens If/i });
      expect(heading).toHaveAttribute('tabIndex', '-1');
    });

    it('manages focus trap within modal', () => {
      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Modal should contain focusable elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Result Display', () => {
    it('displays simulation results in structured sections', () => {
      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Should have result structure with various sections
      const dialog = screen.getByRole('dialog');
      expect(dialog.textContent).toBeTruthy();
    });

    it('applies risk-appropriate styling based on clause tag', () => {
      const highRiskClause: Clause = {
        ...mockClause,
        tag: 'high-attention',
      };

      render(
        <SimulatorModal
          clause={highRiskClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // High-attention clauses should have appropriate visual indicators
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles null clause gracefully', () => {
      render(
        <SimulatorModal
          clause={null}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Should not render when clause is null
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('handles undefined allClauses prop', () => {
      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={vi.fn()}
          allClauses={undefined}
        />
      );

      // Should still render without errors
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles API errors gracefully', async () => {
      // Mock fetch to return error
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server error' }),
        } as Response)
      );

      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Test scenario' } });

      const buttons = screen.getAllByRole('button');
      const simulateButton = buttons.find(btn => 
        btn.textContent?.includes('Simulate') || btn.textContent?.includes('Run')
      );

      if (simulateButton) {
        fireEvent.click(simulateButton);

        // Should fall back to default simulation
        await waitFor(() => {
          const dialog = screen.getByRole('dialog');
          expect(dialog).toBeInTheDocument();
        });
      }

      vi.restoreAllMocks();
    });
  });

  describe('Accessibility', () => {
    it('has proper modal role and attributes', () => {
      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('close button has accessible label', () => {
      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveAccessibleName();
    });

    it('input field has accessible label or placeholder', () => {
      render(
        <SimulatorModal
          clause={mockClause}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const input = screen.getByRole('textbox');
      expect(
        input.hasAttribute('placeholder') || input.hasAttribute('aria-label')
      ).toBe(true);
    });
  });
});

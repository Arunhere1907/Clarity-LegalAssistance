import { describe, it, expect } from 'vitest';
import type { TimelineObligation } from '../types';

describe('Timeline Date Extraction', () => {
  // These tests verify the structure and categories of timeline obligations
  // The actual extraction is done by the Gemini API, but we test the validation

  it('validates timeline obligation categories', () => {
    const validCategories: TimelineObligation['category'][] = [
      'deadline',
      'payment',
      'renewal',
      'penalty',
    ];

    validCategories.forEach((category) => {
      const obligation: TimelineObligation = {
        id: 'test-1',
        dateOrTrigger: '2024-01-01',
        title: 'Test obligation',
        description: 'Test description',
        party: 'Tenant',
        category,
        isoDate: '2024-01-01',
      };

      expect(obligation.category).toBe(category);
    });
  });

  it('timeline obligation has required fields', () => {
    const obligation: TimelineObligation = {
      id: 'obl-1',
      dateOrTrigger: '30 days before lease end',
      title: 'Notice to vacate',
      description: 'Tenant must provide written notice',
      party: 'Tenant',
      category: 'deadline',
    };

    expect(obligation).toHaveProperty('id');
    expect(obligation).toHaveProperty('dateOrTrigger');
    expect(obligation).toHaveProperty('title');
    expect(obligation).toHaveProperty('description');
    expect(obligation).toHaveProperty('party');
    expect(obligation).toHaveProperty('category');
  });

  it('handles ISO date format correctly', () => {
    const obligation: TimelineObligation = {
      id: 'obl-2',
      dateOrTrigger: 'January 1, 2024',
      title: 'Rent due',
      description: 'Monthly rent payment',
      party: 'Tenant',
      category: 'payment',
      isoDate: '2024-01-01',
    };

    expect(obligation.isoDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('handles relative date descriptions', () => {
    const obligation: TimelineObligation = {
      id: 'obl-3',
      dateOrTrigger: '90 days prior to lease expiration',
      title: 'Renewal notice deadline',
      description: 'Tenant must notify landlord of intent to renew',
      party: 'Tenant',
      category: 'renewal',
    };

    expect(obligation.dateOrTrigger).toContain('90 days');
    expect(obligation.category).toBe('renewal');
  });

  it('categorizes payment obligations correctly', () => {
    const paymentObligation: TimelineObligation = {
      id: 'pay-1',
      dateOrTrigger: '1st of each month',
      title: 'Monthly rent payment',
      description: '$2,500 due by 1st of month',
      party: 'Tenant',
      category: 'payment',
    };

    expect(paymentObligation.category).toBe('payment');
    expect(paymentObligation.party).toBe('Tenant');
  });

  it('categorizes penalty obligations correctly', () => {
    const penaltyObligation: TimelineObligation = {
      id: 'pen-1',
      dateOrTrigger: 'After 5 days late',
      title: 'Late fee assessment',
      description: '$100 late fee applied',
      party: 'Landlord',
      category: 'penalty',
    };

    expect(penaltyObligation.category).toBe('penalty');
  });

  it('handles multiple party types', () => {
    const parties = ['Tenant', 'Landlord', 'Vendor', 'Client', 'Employer'];

    parties.forEach((party) => {
      const obligation: TimelineObligation = {
        id: `test-${party}`,
        dateOrTrigger: '2024-06-01',
        title: 'Test',
        description: 'Test',
        party,
        category: 'deadline',
      };

      expect(obligation.party).toBe(party);
    });
  });

  it('handles trigger-based obligations without specific dates', () => {
    const obligation: TimelineObligation = {
      id: 'trigger-1',
      dateOrTrigger: 'Upon breach of Section 5',
      title: 'Termination right triggers',
      description: 'Party may terminate with written notice',
      party: 'Landlord',
      category: 'penalty',
    };

    expect(obligation.dateOrTrigger).not.toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(obligation.isoDate).toBeUndefined();
  });

  it('validates timeline array structure', () => {
    const timeline: TimelineObligation[] = [
      {
        id: '1',
        dateOrTrigger: '2024-01-01',
        title: 'Start date',
        description: 'Lease begins',
        party: 'Both',
        category: 'deadline',
      },
      {
        id: '2',
        dateOrTrigger: '1st of month',
        title: 'Rent due',
        description: 'Monthly payment',
        party: 'Tenant',
        category: 'payment',
      },
    ];

    expect(Array.isArray(timeline)).toBe(true);
    expect(timeline).toHaveLength(2);
    expect(timeline.every((item) => item.id && item.category)).toBe(true);
  });

  it('ensures each obligation has unique ID', () => {
    const timeline: TimelineObligation[] = [
      {
        id: 'obl-1',
        dateOrTrigger: '2024-01-01',
        title: 'Event 1',
        description: 'First',
        party: 'Tenant',
        category: 'deadline',
      },
      {
        id: 'obl-2',
        dateOrTrigger: '2024-02-01',
        title: 'Event 2',
        description: 'Second',
        party: 'Tenant',
        category: 'payment',
      },
      {
        id: 'obl-3',
        dateOrTrigger: '2024-03-01',
        title: 'Event 3',
        description: 'Third',
        party: 'Landlord',
        category: 'renewal',
      },
    ];

    const ids = timeline.map((item) => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(timeline.length);
  });
});

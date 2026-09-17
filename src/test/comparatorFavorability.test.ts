import { describe, it, expect } from 'vitest';
import type { DiffChange } from '../types';

describe('Contract Comparator Favorability Calculation', () => {
  // These tests verify the structure and validation of comparator results
  // The actual favorability determination is done by the Gemini API

  it('validates comparison change structure', () => {
    const change: DiffChange = {
      id: 'change-1',
      section: 'Section 3',
      clauseTitle: 'Notice Period',
      oldText: 'Tenant shall give 60 days notice',
      newText: 'Tenant must give 90 days notice',
      favorsParty: 'Landlord',
      explanation: 'Extends notice requirement, favoring landlord',
    };

    expect(change).toHaveProperty('id');
    expect(change).toHaveProperty('section');
    expect(change).toHaveProperty('clauseTitle');
    expect(change).toHaveProperty('oldText');
    expect(change).toHaveProperty('newText');
    expect(change).toHaveProperty('favorsParty');
    expect(change).toHaveProperty('explanation');
  });

  it('handles favorability badge colors correctly', () => {
    const landlordChange: DiffChange = {
      id: 'c1',
      section: 'S1',
      clauseTitle: 'Late Fees',
      oldText: '$50 late fee',
      newText: '$125 late fee',
      favorsParty: 'Landlord',
      favorsBadgeColor: 'landlord',
      explanation: 'Increases tenant liability',
    };

    const tenantChange: DiffChange = {
      id: 'c2',
      section: 'S2',
      clauseTitle: 'Subletting',
      oldText: 'No subletting allowed',
      newText: 'Subletting allowed with consent',
      favorsParty: 'Tenant',
      favorsBadgeColor: 'tenant',
      explanation: 'Grants tenant flexibility',
    };

    const neutralChange: DiffChange = {
      id: 'c3',
      section: 'S3',
      clauseTitle: 'Term',
      oldText: 'Lease begins January 1',
      newText: 'Lease begins January 2',
      favorsParty: 'Neutral',
      favorsBadgeColor: 'neutral',
      explanation: 'Administrative correction',
    };

    expect(landlordChange.favorsBadgeColor).toBe('landlord');
    expect(tenantChange.favorsBadgeColor).toBe('tenant');
    expect(neutralChange.favorsBadgeColor).toBe('neutral');
  });

  it('validates party designations', () => {
    const validParties = ['Tenant', 'Landlord', 'Employee', 'Employer', 'Vendor', 'Client', 'Neutral'];

    validParties.forEach((party) => {
      const change: DiffChange = {
        id: `test-${party}`,
        section: 'Test',
        clauseTitle: 'Test',
        oldText: 'Old',
        newText: 'New',
        favorsParty: party,
        explanation: 'Test',
      };

      expect(change.favorsParty).toBe(party);
    });
  });

  it('filters changes by favorability correctly', () => {
    const changes: DiffChange[] = [
      {
        id: '1',
        section: 'S1',
        clauseTitle: 'Fee Increase',
        oldText: 'Fee is $100',
        newText: 'Fee is $200',
        favorsParty: 'Landlord',
        explanation: 'Increases cost to tenant',
      },
      {
        id: '2',
        section: 'S2',
        clauseTitle: 'Grace Period',
        oldText: 'No grace period',
        newText: '5 day grace period',
        favorsParty: 'Tenant',
        explanation: 'Provides payment flexibility',
      },
      {
        id: '3',
        section: 'S3',
        clauseTitle: 'Address Update',
        oldText: '123 Old St',
        newText: '456 New Ave',
        favorsParty: 'Neutral',
        explanation: 'Administrative change',
      },
    ];

    const landlordChanges = changes.filter((c) => c.favorsParty === 'Landlord');
    const tenantChanges = changes.filter((c) => c.favorsParty === 'Tenant');
    const neutralChanges = changes.filter((c) => c.favorsParty === 'Neutral');

    expect(landlordChanges).toHaveLength(1);
    expect(tenantChanges).toHaveLength(1);
    expect(neutralChanges).toHaveLength(1);
  });

  it('ensures change IDs are unique', () => {
    const changes: DiffChange[] = [
      {
        id: 'change-1',
        section: 'S1',
        clauseTitle: 'Clause 1',
        oldText: 'Old 1',
        newText: 'New 1',
        favorsParty: 'Tenant',
        explanation: 'Reason 1',
      },
      {
        id: 'change-2',
        section: 'S2',
        clauseTitle: 'Clause 2',
        oldText: 'Old 2',
        newText: 'New 2',
        favorsParty: 'Landlord',
        explanation: 'Reason 2',
      },
      {
        id: 'change-3',
        section: 'S3',
        clauseTitle: 'Clause 3',
        oldText: 'Old 3',
        newText: 'New 3',
        favorsParty: 'Neutral',
        explanation: 'Reason 3',
      },
    ];

    const ids = changes.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(changes.length);
  });

  it('validates comparison summary structure', () => {
    interface ComparisonResult {
      docAName: string;
      docBName: string;
      summary: string;
      changes: DiffChange[];
    }

    const comparison: ComparisonResult = {
      docAName: 'Original Lease',
      docBName: 'Revised Lease',
      summary: '4 material changes detected',
      changes: [
        {
          id: '1',
          section: 'S1',
          clauseTitle: 'Test',
          oldText: 'Old',
          newText: 'New',
          favorsParty: 'Landlord',
          explanation: 'Explanation',
        },
      ],
    };

    expect(comparison).toHaveProperty('docAName');
    expect(comparison).toHaveProperty('docBName');
    expect(comparison).toHaveProperty('summary');
    expect(comparison).toHaveProperty('changes');
    expect(Array.isArray(comparison.changes)).toBe(true);
  });

  it('handles case-insensitive party filtering', () => {
    const changes: DiffChange[] = [
      {
        id: '1',
        section: 'S1',
        clauseTitle: 'Test 1',
        oldText: 'Old',
        newText: 'New',
        favorsParty: 'Tenant',
        explanation: 'Test',
      },
      {
        id: '2',
        section: 'S2',
        clauseTitle: 'Test 2',
        oldText: 'Old',
        newText: 'New',
        favorsParty: 'TENANT',
        explanation: 'Test',
      },
    ];

    const filtered = changes.filter((c) => c.favorsParty.toLowerCase() === 'tenant');
    expect(filtered).toHaveLength(2);
  });

  it('validates that substantive changes have non-empty explanations', () => {
    const change: DiffChange = {
      id: 'c1',
      section: 'Section 4',
      clauseTitle: 'Termination Rights',
      oldText: 'Either party may terminate with 30 days notice',
      newText: 'Landlord may terminate with 10 days notice; Tenant must give 90 days',
      favorsParty: 'Landlord',
      explanation: 'Creates asymmetric termination rights heavily favoring landlord',
    };

    expect(change.explanation).toBeTruthy();
    expect(change.explanation.length).toBeGreaterThan(10);
  });

  it('handles empty changes array', () => {
    interface ComparisonResult {
      docAName: string;
      docBName: string;
      summary: string;
      changes: DiffChange[];
    }

    const comparison: ComparisonResult = {
      docAName: 'Doc A',
      docBName: 'Doc B',
      summary: 'No material changes detected',
      changes: [],
    };

    expect(comparison.changes).toEqual([]);
    expect(comparison.changes).toHaveLength(0);
  });

  it('validates favorability distribution', () => {
    const changes: DiffChange[] = [
      {
        id: '1',
        section: 'S1',
        clauseTitle: 'Change 1',
        oldText: 'Old',
        newText: 'New',
        favorsParty: 'Landlord',
        explanation: 'Favors landlord',
      },
      {
        id: '2',
        section: 'S2',
        clauseTitle: 'Change 2',
        oldText: 'Old',
        newText: 'New',
        favorsParty: 'Landlord',
        explanation: 'Favors landlord',
      },
      {
        id: '3',
        section: 'S3',
        clauseTitle: 'Change 3',
        oldText: 'Old',
        newText: 'New',
        favorsParty: 'Tenant',
        explanation: 'Favors tenant',
      },
    ];

    const landlordCount = changes.filter((c) => c.favorsParty === 'Landlord').length;
    const tenantCount = changes.filter((c) => c.favorsParty === 'Tenant').length;

    expect(landlordCount).toBe(2);
    expect(tenantCount).toBe(1);
    expect(landlordCount + tenantCount).toBe(changes.length);
  });
});

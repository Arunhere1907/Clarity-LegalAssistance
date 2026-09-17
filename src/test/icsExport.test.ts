import { describe, it, expect } from 'vitest';
import { generateICS } from '../utils/icsExport';
import type { TimelineObligation } from '../types';

// ---------------------------------------------------------------------------
// ICS export generation tests
// ---------------------------------------------------------------------------

const sampleObligations: TimelineObligation[] = [
  {
    id: 'ob-1',
    title: 'Rent Payment Due',
    description: 'Monthly rent due on the 1st',
    party: 'Tenant',
    category: 'payment',
    dateOrTrigger: '1st of each month',
    isoDate: '2026-10-01',
  },
  {
    id: 'ob-2',
    title: 'Notice to Vacate',
    description: 'Send certified mail notice 90 days before lease end',
    party: 'Tenant',
    category: 'deadline',
    dateOrTrigger: '90 days prior to September 30, 2027',
    isoDate: '2027-07-02',
  },
];

describe('generateICS', () => {
  it('produces valid iCalendar structure', () => {
    const ics = generateICS('Test Lease', sampleObligations);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
  });

  it('creates one VEVENT per obligation', () => {
    const ics = generateICS('Test Lease', sampleObligations);
    const eventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;
    expect(eventCount).toBe(sampleObligations.length);
  });

  it('uses isoDate when available', () => {
    const ics = generateICS('Test Lease', sampleObligations);
    expect(ics).toContain('DTSTART:20261001');
    expect(ics).toContain('DTSTART:20270702');
  });

  it('falls back to a relative date when isoDate is absent', () => {
    const noDateObs: TimelineObligation[] = [
      {
        id: 'ob-3',
        title: 'Penalty Trigger',
        description: 'Penalty if late fee unpaid',
        party: 'Landlord',
        category: 'penalty',
        dateOrTrigger: 'After 5-day grace period',
      },
    ];
    const ics = generateICS('Lease', noDateObs);
    expect(ics).toContain('BEGIN:VEVENT');
    // Should still have a DTSTART even without isoDate
    expect(ics).toContain('DTSTART:');
  });

  it('sanitises special characters in obligation text', () => {
    const specialObs: TimelineObligation[] = [
      {
        id: 'ob-4',
        title: 'Payment; Details, Info',
        description: 'Amount: $1,000; per month',
        party: 'Tenant',
        category: 'payment',
        dateOrTrigger: '1st of month',
        isoDate: '2026-11-01',
      },
    ];
    const ics = generateICS('Doc', specialObs);
    // Commas and semicolons should be escaped in ICS
    expect(ics).toContain('\\,');
    expect(ics).toContain('\\;');
  });

  it('includes a 7-day VALARM reminder', () => {
    const ics = generateICS('Lease', sampleObligations);
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('TRIGGER:-P7D');
  });

  it('generates valid output for an empty obligations array', () => {
    const ics = generateICS('Empty Doc', []);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).not.toContain('BEGIN:VEVENT');
  });
});

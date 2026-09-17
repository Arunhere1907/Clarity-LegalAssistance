import { TimelineObligation } from '../types';

export function generateICS(docTitle: string, obligations: TimelineObligation[]): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Clarity Legal Assistant//Legal Obligations Timeline//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${cleanIcsText(docTitle)} Obligations`
  ];

  obligations.forEach((ob, idx) => {
    // Generate a valid start date
    let dtStart = '';
    let dtEnd = '';
    
    if (ob.isoDate) {
      const dateParts = ob.isoDate.split('-');
      if (dateParts.length === 3) {
        const y = dateParts[0];
        const m = dateParts[1].padStart(2, '0');
        const d = dateParts[2].padStart(2, '0');
        dtStart = `${y}${m}${d}T090000Z`;
        dtEnd = `${y}${m}${d}T100000Z`;
      }
    }

    if (!dtStart) {
      // Fallback relative event: 30 days ahead from today
      const target = new Date();
      target.setDate(target.getDate() + 30 + (idx * 15));
      const y = target.getFullYear();
      const m = String(target.getMonth() + 1).padStart(2, '0');
      const d = String(target.getDate()).padStart(2, '0');
      dtStart = `${y}${m}${d}T090000Z`;
      dtEnd = `${y}${m}${d}T100000Z`;
    }

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:clarity-ob-${ob.id}-${Date.now()}@clarity.legal`,
      `DTSTAMP:${timestamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:[Legal Obligation] ${cleanIcsText(ob.title)}`,
      `DESCRIPTION:${cleanIcsText(ob.description)} (Party: ${cleanIcsText(ob.party)})\\nTrigger: ${cleanIcsText(ob.dateOrTrigger)}\\nDocument: ${cleanIcsText(docTitle)}`,
      `STATUS:CONFIRMED`,
      'BEGIN:VALARM',
      'TRIGGER:-P7D',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: 7 days until legal deadline: ${cleanIcsText(ob.title)}`,
      'END:VALARM',
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
}

function cleanIcsText(text: string): string {
  return text.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

export function downloadICSFile(filename: string, icsData: string) {
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

import { prisma } from '../lib/prisma';
import { sendRetestReminder } from '../services/email';

const REMINDER_DAYS = Number(process.env.RETEST_REMINDER_DAYS ?? 85);
const WINDOW_DAYS = Number(process.env.RETEST_REMINDER_WINDOW ?? 3);

/**
 * Sends 90-day retest reminders for published reports at day 85–88
 * (no newer final report for the same patient).
 */
export async function runRetestReminders(): Promise<{ sent: number; skipped: number }> {
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - REMINDER_DAYS - WINDOW_DAYS);
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() - REMINDER_DAYS);

  const candidates = await prisma.reportCard.findMany({
    where: {
      status: 'final',
      publishedAt: { gte: windowStart, lte: windowEnd },
      retestReminderSentAt: null,
    },
    include: { patient: true },
    orderBy: { publishedAt: 'desc' },
  });

  let sent = 0;
  let skipped = 0;

  for (const report of candidates) {
    const newer = await prisma.reportCard.findFirst({
      where: {
        patientId: report.patientId,
        status: 'final',
        publishedAt: { gt: report.publishedAt ?? report.createdAt },
      },
    });
    if (newer) {
      skipped++;
      await prisma.reportCard.update({
        where: { id: report.id },
        data: { retestReminderSentAt: now },
      });
      continue;
    }

    const previousBioAge = report.biologicalAge;
    await sendRetestReminder(
      report.patient.email,
      report.patient.firstName,
      report.patientId,
      previousBioAge
    );

    await prisma.reportCard.update({
      where: { id: report.id },
      data: { retestReminderSentAt: now },
    });
    sent++;
  }

  return { sent, skipped };
}

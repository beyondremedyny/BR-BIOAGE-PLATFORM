import cron from 'node-cron';
import { runRetestReminders } from './jobs/retestReminders';

const schedule = process.env.RETEST_CRON_SCHEDULE ?? '0 9 * * *';

export function startScheduler() {
  if (process.env.ENABLE_RETEST_CRON !== 'true') return;

  cron.schedule(schedule, async () => {
    try {
      const result = await runRetestReminders();
      console.log('[retest-cron]', result);
    } catch (err) {
      console.error('[retest-cron] failed', err);
    }
  });

  console.log(`Retest reminder cron scheduled: ${schedule}`);
}

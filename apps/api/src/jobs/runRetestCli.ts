import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { runRetestReminders } from './retestReminders';

runRetestReminders()
  .then((result) => {
    console.log('Retest reminders complete:', result);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

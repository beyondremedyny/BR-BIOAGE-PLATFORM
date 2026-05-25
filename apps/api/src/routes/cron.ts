import { Router } from 'express';
import { runRetestReminders } from '../jobs/retestReminders';

export const cronRouter = Router();

cronRouter.post('/retest-reminders', async (req, res, next) => {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers['x-cron-secret'] !== secret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await runRetestReminders();
    res.json(result);
  } catch (e) {
    next(e);
  }
});

import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { clerkMiddleware } from '@clerk/express';
import { intakeRouter } from './routes/intake';
import { labsRouter } from './routes/labs';
import { reportsRouter } from './routes/reports';
import { patientsRouter } from './routes/patients';
import { cronRouter } from './routes/cron';
import { startScheduler } from './scheduler';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:5173';

app.use(
  cors({
    origin: [appUrl, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '15mb' }));
app.use(clerkMiddleware());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'br-bioage-api' });
});

app.use('/api/intake', intakeRouter);
app.use('/api/labs', labsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/cron', cronRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`BR BioAge API listening on port ${PORT}`);
  startScheduler();
});

import { Router } from 'express';
import { getAuth } from '@clerk/express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireClinician } from '../middleware/auth';

export const patientsRouter = Router();

// GET /patients/me — current patient's full record (must be before /:id)
patientsRouter.get('/me', requireAuth(), async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const patient = await prisma.patient.findUnique({
      where: { clerkId: userId },
      include: {
        intakeSessions: { orderBy: { createdAt: 'desc' }, take: 1 },
        labUploads: { orderBy: { createdAt: 'desc' }, take: 5 },
        reportCards: {
          where: { status: 'published' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (e) {
    next(e);
  }
});

patientsRouter.get('/', requireAuth(), requireClinician, async (_req, res, next) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        intakeSessions: { orderBy: { createdAt: 'desc' }, take: 1 },
        labUploads: { where: { confirmedAt: null }, take: 3 },
        reportCards: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    res.json(patients);
  } catch (e) {
    next(e);
  }
});

patientsRouter.get('/:id', requireAuth(), async (req, res, next) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        intakeSessions: { orderBy: { createdAt: 'desc' } },
        labUploads: { orderBy: { createdAt: 'desc' } },
        reportCards: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (e) {
    next(e);
  }
});

patientsRouter.post('/', requireAuth(), requireClinician, async (req, res, next) => {
  try {
    const data = req.body as {
      clerkId: string;
      firstName: string;
      lastName: string;
      email: string;
      dateOfBirth: string;
      sex: string;
      phone?: string;
    };
    const patient = await prisma.patient.create({
      data: {
        clerkId: data.clerkId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        dateOfBirth: new Date(data.dateOfBirth),
        sex: data.sex,
        phone: data.phone ?? null,
      },
    });
    res.status(201).json(patient);
  } catch (e) {
    next(e);
  }
});

import { getAuth, requireAuth } from '@clerk/express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export { requireAuth };

export async function getOrCreatePatient(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    let patient = await prisma.patient.findUnique({ where: { clerkId: userId } });
    if (!patient) {
      const email = (req.body?.email as string) || `${userId}@clerk.placeholder`;
      patient = await prisma.patient.create({
        data: {
          clerkId: userId,
          firstName: (req.body?.firstName as string) || 'Patient',
          lastName: (req.body?.lastName as string) || '',
          email,
          dateOfBirth: req.body?.dateOfBirth
            ? new Date(req.body.dateOfBirth as string)
            : new Date('1980-01-01'),
          sex: (req.body?.sex as string) || 'Male',
          phone: (req.body?.phone as string) || null,
        },
      });
    }
    (req as Request & { patient: typeof patient }).patient = patient;
    next();
  } catch (e) {
    next(e);
  }
}

export async function requireClinician(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const clinician = await prisma.clinician.findUnique({ where: { clerkId: userId } });
    if (!clinician) return res.status(403).json({ error: 'Clinician access required' });

    (req as Request & { clinician: typeof clinician }).clinician = clinician;
    next();
  } catch (e) {
    next(e);
  }
}

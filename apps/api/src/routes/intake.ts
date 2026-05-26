import { Router } from 'express';
import { processIntakeSubmission, type IntakeAnswers } from '../../../../packages/shared/src';
import { prisma } from '../lib/prisma';
import { getOrCreatePatient, requireAuth } from '../middleware/auth';
import { sendIntakeComplete } from '../services/email';

export const intakeRouter = Router();

intakeRouter.post('/sessions', requireAuth(), getOrCreatePatient, async (req, res, next) => {
  try {
    const patient = (req as typeof req & { patient: { id: string } }).patient;
    const session = await prisma.intakeSession.create({
      data: {
        patientId: patient.id,
        answers: {},
        redFlags: [],
        medicationFlags: [],
      },
    });
    res.json(session);
  } catch (e) {
    next(e);
  }
});

intakeRouter.put('/sessions/:id', requireAuth(), getOrCreatePatient, async (req, res, next) => {
  try {
    const patient = (req as typeof req & { patient: { id: string } }).patient;
    const answers = (req.body.answers ?? {}) as IntakeAnswers;
    const biometrics = req.body.biometrics;

    const session = await prisma.intakeSession.updateMany({
      where: { id: req.params.id, patientId: patient.id },
      data: {
        answers,
        ...(biometrics !== undefined ? { biometrics } : {}),
      },
    });
    if (session.count === 0) return res.status(404).json({ error: 'Session not found' });
    const updated = await prisma.intakeSession.findUnique({ where: { id: req.params.id } });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

intakeRouter.get('/sessions/:id', requireAuth(), getOrCreatePatient, async (req, res, next) => {
  try {
    const patient = (req as typeof req & { patient: { id: string } }).patient;
    const session = await prisma.intakeSession.findFirst({
      where: { id: req.params.id, patientId: patient.id },
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (e) {
    next(e);
  }
});

intakeRouter.post('/sessions/:id/submit', requireAuth(), getOrCreatePatient, async (req, res, next) => {
  try {
    const patient = (req as typeof req & { patient: { id: string; email: string; firstName: string } }).patient;
    const answers = (req.body.answers ?? {}) as IntakeAnswers;
    const result = processIntakeSubmission(answers);

    const session = await prisma.intakeSession.update({
      where: { id: req.params.id },
      data: {
        answers,
        completedAt: new Date(),
        redFlagTriggered: result.redFlagTriggered,
        redFlags: result.redFlags,
        domain5Delta: result.domain5Delta,
        domain5Tier: result.domain5Tier,
        clinicalRiskTier: result.clinicalRiskTier,
        medicationFlags: result.medicationFlags,
        biometrics: req.body.biometrics ?? undefined,
      },
    });

    if (!result.redFlagTriggered) {
      await sendIntakeComplete(patient.email, patient.firstName);
    }

    res.json(session);
  } catch (e) {
    next(e);
  }
});

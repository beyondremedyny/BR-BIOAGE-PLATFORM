import { Router } from 'express';
import type { ScoredMarker } from '../../../../packages/shared/src';
import { prisma } from '../lib/prisma';
import { requireAuth, requireClinician } from '../middleware/auth';
import { buildReportFromSources } from '../services/reportBuilder';
import { sendReportPublished } from '../services/email';
import { generateReportPdf } from '../services/pdfGenerator';
import { uploadBuffer } from '../services/s3';

export const reportsRouter = Router();

reportsRouter.post('/', requireAuth(), requireClinician, async (req, res, next) => {
  try {
    const clinician = (req as typeof req & { clinician: { id: string } }).clinician;
    const { patientId, intakeSessionId, labUploadIds } = req.body as {
      patientId: string;
      intakeSessionId?: string;
      labUploadIds?: string[];
    };

    const built = await buildReportFromSources({
      patientId,
      intakeSessionId,
      labUploadIds: labUploadIds ?? [],
    });

    const report = await prisma.reportCard.create({
      data: {
        patientId,
        clinicianId: clinician.id,
        intakeSessionId: intakeSessionId ?? null,
        labUploadIds: labUploadIds ?? [],
        d1Delta: built.d1Delta,
        d2Delta: built.d2Delta,
        d3Delta: built.d3Delta,
        d4Delta: built.d4Delta,
        d5Delta: built.d5Delta,
        markers: built.markers as object,
        masterDelta: built.masterDelta,
        biologicalAge: built.biologicalAge,
        chronologicalAge: built.chronologicalAge,
        confidence: built.confidence,
        clinicalRiskTier: built.clinicalRiskTier,
        biometrics: built.biometrics as object | undefined,
        status: 'draft',
      },
    });
    res.status(201).json(report);
  } catch (e) {
    next(e);
  }
});

reportsRouter.get('/:id', requireAuth(), async (req, res, next) => {
  try {
    const report = await prisma.reportCard.findUnique({
      where: { id: req.params.id },
      include: { patient: true, clinician: true },
    });
    if (!report) return res.status(404).json({ error: 'Not found' });
    res.json(report);
  } catch (e) {
    next(e);
  }
});

reportsRouter.put('/:id', requireAuth(), requireClinician, async (req, res, next) => {
  try {
    const { recommendations, status, markers, biometrics } = req.body;
    const report = await prisma.reportCard.update({
      where: { id: req.params.id },
      data: {
        ...(recommendations !== undefined ? { recommendations } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(markers !== undefined ? { markers } : {}),
        ...(biometrics !== undefined ? { biometrics } : {}),
      },
    });
    res.json(report);
  } catch (e) {
    next(e);
  }
});

reportsRouter.post('/:id/publish', requireAuth(), requireClinician, async (req, res, next) => {
  try {
    const existing = await prisma.reportCard.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const markers = (existing.markers ?? {}) as Record<string, ScoredMarker>;
    const recommendations = existing.recommendations as string[] | null;

    let pdfUrl: string | null = existing.pdfUrl;
    if (process.env.SKIP_PDF_GENERATION !== 'true') {
      try {
        const pdfBuffer = await generateReportPdf({
          patientName: `${existing.patient.firstName} ${existing.patient.lastName}`,
          assessmentDate: existing.assessmentDate,
          biologicalAge: existing.biologicalAge,
          chronologicalAge: existing.chronologicalAge,
          masterDelta: existing.masterDelta,
          confidence: existing.confidence ?? 0,
          deltas: {
            d1: existing.d1Delta,
            d2: existing.d2Delta,
            d3: existing.d3Delta,
            d4: existing.d4Delta,
            d5: existing.d5Delta,
          },
          markers,
          clinicalRiskTier: existing.clinicalRiskTier,
          recommendations: Array.isArray(recommendations) ? recommendations : null,
        });
        pdfUrl = await uploadBuffer(
          `reports/${existing.id}/bioage-report.pdf`,
          pdfBuffer,
          'application/pdf'
        );
      } catch (pdfErr) {
        console.error('[publish] PDF generation failed', pdfErr);
        if (process.env.REQUIRE_PDF_ON_PUBLISH === 'true') throw pdfErr;
      }
    }

    const report = await prisma.reportCard.update({
      where: { id: req.params.id },
      data: {
        status: 'final',
        publishedAt: new Date(),
        pdfUrl,
      },
      include: { patient: true },
    });

    if (report.patient) {
      await sendReportPublished(
        report.patient.email,
        report.patient.firstName,
        report.id,
        pdfUrl
      );
    }
    res.json(report);
  } catch (e) {
    next(e);
  }
});

reportsRouter.get('/:id/pdf', requireAuth(), async (req, res, next) => {
  try {
    const report = await prisma.reportCard.findUnique({ where: { id: req.params.id } });
    if (!report?.pdfUrl) return res.status(404).json({ error: 'PDF not available' });
    res.redirect(report.pdfUrl);
  } catch (e) {
    next(e);
  }
});

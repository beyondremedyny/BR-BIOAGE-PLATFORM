import { Router } from 'express';
import {
  buildScoredMarker,
  rescoreMarkers,
  MARKER_LABELS,
  type ScoredMarker,
} from '@br-bioage/shared';
import { prisma } from '../lib/prisma';
import { getOrCreatePatient, requireAuth, requireClinician } from '../middleware/auth';
import { extractLabsFromFile, mapAndScoreMarkers } from '../services/labExtraction';
import { getPresignedUploadUrl, getSignedReadUrl } from '../services/s3';
import { sendLabUploaded } from '../services/email';

export const labsRouter = Router();

labsRouter.post('/upload', requireAuth(), getOrCreatePatient, async (req, res, next) => {
  try {
    const patient = (req as typeof req & { patient: { id: string } }).patient;
    const { fileName, fileType } = req.body as { fileName: string; fileType: string };
    if (!fileName || !fileType) return res.status(400).json({ error: 'fileName and fileType required' });

    const { uploadUrl, s3Key, s3Url } = await getPresignedUploadUrl(patient.id, fileName, fileType);
    const upload = await prisma.labUpload.create({
      data: {
        patientId: patient.id,
        s3Key,
        s3Url,
        fileName,
        fileType,
      },
    });
    res.json({ uploadUrl, upload });
  } catch (e) {
    next(e);
  }
});

labsRouter.post('/extract', requireAuth(), getOrCreatePatient, async (req, res, next) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'AI extraction not configured' });

    const { uploadId, base64Data, mediaType } = req.body as {
      uploadId: string;
      base64Data: string;
      mediaType: string;
    };

    const upload = await prisma.labUpload.findUnique({ where: { id: uploadId } });
    if (!upload) return res.status(404).json({ error: 'Upload not found' });

    const extracted = await extractLabsFromFile(base64Data, mediaType, apiKey);
    const { mapped, unmapped } = mapAndScoreMarkers(extracted);

    const updated = await prisma.labUpload.update({
      where: { id: uploadId },
      data: {
        extractedRaw: extracted as object,
        extractedMarkers: mapped as object,
        unmappedMarkers: unmapped as object,
        labSource: extracted.lab_source ?? null,
        reportDate: extracted.report_date ?? null,
        aiNotes: extracted.notes ?? null,
      },
    });

    res.json({
      upload: updated,
      markerCount: Object.keys(mapped).length,
      unmappedCount: unmapped.length,
    });
  } catch (e) {
    next(e);
  }
});

labsRouter.get('/uploads/:id', requireAuth(), async (req, res, next) => {
  try {
    const upload = await prisma.labUpload.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });
    if (!upload) return res.status(404).json({ error: 'Not found' });
    const imageUrl = await getSignedReadUrl(upload.s3Key);
    res.json({ ...upload, imageUrl });
  } catch (e) {
    next(e);
  }
});

labsRouter.put('/uploads/:id/markers', requireAuth(), requireClinician, async (req, res, next) => {
  try {
    const { markers: bodyMarkers, edits } = req.body as {
      markers?: Record<string, ScoredMarker>;
      edits?: Record<string, { value: number }>;
    };

    const upload = await prisma.labUpload.findUnique({ where: { id: req.params.id } });
    if (!upload) return res.status(404).json({ error: 'Upload not found' });

    let nextMarkers = (upload.extractedMarkers ?? {}) as Record<string, ScoredMarker>;
    const errors: Record<string, string> = {};

    if (bodyMarkers) {
      nextMarkers = bodyMarkers;
    } else if (edits) {
      const result = rescoreMarkers(nextMarkers, edits);
      nextMarkers = result.markers;
      Object.assign(errors, result.errors);
    } else {
      return res.status(400).json({ error: 'markers or edits required' });
    }

    const updated = await prisma.labUpload.update({
      where: { id: req.params.id },
      data: { extractedMarkers: nextMarkers as object },
    });

    res.json({ upload: updated, markers: nextMarkers, errors });
  } catch (e) {
    next(e);
  }
});

labsRouter.patch('/uploads/:id/markers/:markerId', requireAuth(), requireClinician, async (req, res, next) => {
  try {
    const { value, unit, flag, referenceRange } = req.body as {
      value: number;
      unit?: string;
      flag?: string | null;
      referenceRange?: string | null;
    };

    if (value === undefined || Number.isNaN(Number(value))) {
      return res.status(400).json({ error: 'Valid numeric value required' });
    }

    const markerId = req.params.markerId as string;
    const upload = await prisma.labUpload.findUnique({ where: { id: req.params.id } });
    if (!upload) return res.status(404).json({ error: 'Upload not found' });

    const existing = ((upload.extractedMarkers ?? {}) as Record<string, ScoredMarker>)[markerId as string];
    const rescored = buildScoredMarker(markerId, Number(value), {
      unit: unit ?? existing?.unit,
      flag: flag ?? existing?.flag ?? null,
      referenceRange: referenceRange ?? existing?.referenceRange ?? null,
      label: existing?.label ?? MARKER_LABELS[markerId as string],
      rawValue: String(value),
    });

    if (!rescored) {
      return res.status(422).json({
        error: 'Value rejected — outside physiologically plausible range',
        markerId,
      });
    }

    const markers = { ...(upload.extractedMarkers as Record<string, ScoredMarker>), [markerId as string]: rescored };
    const updated = await prisma.labUpload.update({
      where: { id: req.params.id },
      data: { extractedMarkers: markers as object },
    });

    res.json({ upload: updated, marker: rescored });
  } catch (e) {
    next(e);
  }
});

labsRouter.put('/uploads/:id/confirm', requireAuth(), requireClinician, async (req, res, next) => {
  try {
    const clinician = (req as typeof req & { clinician: { id: string } }).clinician;
    const { markers } = req.body as { markers?: Record<string, unknown> };

    const updated = await prisma.labUpload.update({
      where: { id: req.params.id },
      data: {
        confirmedAt: new Date(),
        confirmedBy: clinician.id,
        ...(markers ? { extractedMarkers: markers as object } : {}),
      },
      include: { patient: true },
    });

    res.json(updated);
  } catch (e) {
    next(e);
  }
});

labsRouter.post('/uploads/:id/patient-confirm', requireAuth(), getOrCreatePatient, async (req, res, next) => {
  try {
    const patient = (req as typeof req & { patient: { id: string; firstName: string; lastName: string } }).patient;
    const upload = await prisma.labUpload.findFirst({
      where: { id: req.params.id, patientId: patient.id },
    });
    if (!upload) return res.status(404).json({ error: 'Not found' });

    const notifyEmail = process.env.CLINICIAN_NOTIFY_EMAIL;
    if (notifyEmail) {
      await sendLabUploaded(
        notifyEmail,
        `${patient.firstName} ${patient.lastName}`,
        patient.id
      );
    }
    res.json({ ok: true, upload });
  } catch (e) {
    next(e);
  }
});

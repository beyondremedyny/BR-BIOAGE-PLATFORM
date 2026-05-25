import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.RESEND_FROM_EMAIL ?? 'noreply@beyondremedyny.com';
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:5173';

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.log('[email stub]', { to, subject });
    return;
  }
  await resend.emails.send({ from, to, subject, html });
}

export async function sendIntakeComplete(patientEmail: string, patientName: string) {
  await send(
    patientEmail,
    'Beyond Remedy — Intake Complete',
    `<p>Dear ${patientName},</p>
     <p>Your BioAge intake is complete. Your clinical team will reach out within 24 hours to schedule your bloodwork panel.</p>
     <p><a href="${appUrl}/patient/dashboard">View Dashboard</a></p>`
  );
}

export async function sendLabUploaded(clinicianEmail: string, patientName: string, patientId: string) {
  await send(
    clinicianEmail,
    `Lab Upload Ready — ${patientName}`,
    `<p>A new lab report was uploaded for ${patientName}.</p>
     <p><a href="${appUrl}/clinician/patient/${patientId}/labs">Review Extraction</a></p>`
  );
}

export async function sendReportPublished(
  patientEmail: string,
  patientName: string,
  reportId: string,
  pdfUrl?: string | null
) {
  const pdfLink = pdfUrl
    ? `<p><a href="${pdfUrl}">Download PDF Report</a></p>`
    : '';
  await send(
    patientEmail,
    'Your Beyond Remedy BioAge Report Is Ready',
    `<p>Dear ${patientName},</p>
     <p>Your personalized BioAge Report Card has been published.</p>
     <p><a href="${appUrl}/patient/report/${reportId}">View Your Report</a></p>
     ${pdfLink}`
  );
}

export async function sendRetestReminder(
  patientEmail: string,
  patientName: string,
  patientId: string,
  previousBioAge: number | null
) {
  const bioNote =
    previousBioAge !== null
      ? `<p>Your last BioAge was <strong>${previousBioAge}</strong>. A 90-day retest helps track your progress.</p>`
      : `<p>It has been approximately 90 days since your last BioAge assessment.</p>`;

  await send(
    patientEmail,
    'Beyond Remedy — Time For Your 90-Day BioAge Retest',
    `<p>Dear ${patientName},</p>
     ${bioNote}
     <p>Upload your latest labs to generate an updated report and see how your biological age has changed.</p>
     <p><a href="${appUrl}/patient/upload">Upload Labs</a></p>
     <p style="color:#888;font-size:12px">Questions? Contact your Beyond Remedy clinical team.</p>`
  );
}

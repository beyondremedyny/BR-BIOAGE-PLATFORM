import { buildReportPdfHtml, type ReportPdfData } from './reportPdfHtml';

export async function generateReportPdf(data: ReportPdfData): Promise<Buffer> {
  const html = buildReportPdfHtml(data);
  return Buffer.from(html, 'utf-8');
}

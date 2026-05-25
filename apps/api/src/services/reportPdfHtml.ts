import { formatDelta } from '@br-bioage/shared';
import type { ScoredMarker } from '@br-bioage/shared';

const DOMAIN_NAMES: Record<string, string> = {
  d1: 'Metabolic Health',
  d2: 'Cardiovascular & Autonomic',
  d3: 'Hormonal & Endocrine',
  d4: 'Cellular & Epigenetic',
  d5: 'Functional & Lifestyle',
};

const STATUS_COLORS: Record<string, string> = {
  optimal: '#4ade80',
  good: '#fbbf24',
  watch: '#fb923c',
  risk: '#f87171',
  pending: '#9ca3af',
};

const STATUS_LABELS: Record<string, string> = {
  optimal: 'Optimal',
  good: 'Good',
  watch: 'Monitor',
  risk: 'Priority',
  pending: 'Pending',
};

function stars(n: number): string {
  const filled = Math.min(5, Math.max(0, n));
  return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}

function markerRows(markers: ScoredMarker[]): string {
  if (markers.length === 0) {
    return '<tr><td colspan="4" style="padding:12px;color:#9ca3af;text-align:center">Pending — Labs Required</td></tr>';
  }
  return markers
    .map(
      (m) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #ffffff10;font-family:Poppins,sans-serif">${m.label}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #ffffff10;font-family:Orbitron,sans-serif">${m.value} ${m.unit}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #ffffff10;font-family:Orbitron,sans-serif;font-weight:700">${formatDelta(m.score)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #ffffff10">
        <span style="color:${STATUS_COLORS[m.status]};font-family:Orbitron,sans-serif;font-size:11px">${STATUS_LABELS[m.status]}</span>
      </td>
    </tr>`
    )
    .join('');
}

export interface ReportPdfData {
  patientName: string;
  assessmentDate: Date;
  biologicalAge: number | null;
  chronologicalAge: number | null;
  masterDelta: number | null;
  confidence: number;
  deltas: { d1: number | null; d2: number | null; d3: number | null; d4: number | null; d5: number | null };
  markers: Record<string, ScoredMarker>;
  clinicalRiskTier?: string | null;
  recommendations?: string[] | null;
}

export function buildReportPdfHtml(data: ReportPdfData): string {
  const byDomain = (d: string) => Object.values(data.markers).filter((m) => m.domain === d);
  const bioDisplay =
    data.biologicalAge !== null
      ? String(data.biologicalAge)
      : '<span style="font-size:14px;color:#9ca3af">Pending — Labs Required</span>';

  const domainBlocks = (['d1', 'd2', 'd3', 'd4'] as const)
    .map((key) => {
      const delta = data.deltas[key];
      const title = DOMAIN_NAMES[key];
      return `
      <div style="margin-bottom:24px;border:1px solid #ffffff10;border-radius:16px;overflow:hidden;background:#ffffff05">
        <div style="background:linear-gradient(90deg,#5a3fd4,#7a5fff);padding:16px 20px">
          <div style="font-family:Orbitron,sans-serif;font-size:10px;letter-spacing:0.35em;color:#b8a4ff">${key.toUpperCase()}</div>
          <div style="font-family:Orbitron,sans-serif;font-size:16px;font-weight:600;color:#fafafa;margin-top:4px">${title}</div>
          <div style="font-family:Orbitron,sans-serif;font-size:22px;font-weight:700;color:#fafafa;margin-top:6px">
            ${delta !== null && delta !== undefined ? formatDelta(delta) : 'Pending — Labs Required'}
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="color:#e3cbbe;font-size:11px;font-family:Orbitron,sans-serif">
              <th style="text-align:left;padding:10px 12px">Marker</th>
              <th style="text-align:left;padding:10px 12px">Value</th>
              <th style="text-align:left;padding:10px 12px">Delta</th>
              <th style="text-align:left;padding:10px 12px">Status</th>
            </tr>
          </thead>
          <tbody>${markerRows(byDomain(key))}</tbody>
        </table>
      </div>`;
    })
    .join('');

  const recs =
    data.recommendations && data.recommendations.length > 0
      ? `<div style="margin-top:32px;padding:20px;border:1px solid #ffffff10;border-radius:16px;background:#ffffff05">
          <div style="font-family:Orbitron,sans-serif;font-size:10px;letter-spacing:0.35em;color:#e3cbbe">PROTOCOL RECOMMENDATIONS</div>
          <ul style="margin:12px 0 0;padding-left:20px;font-family:Poppins,sans-serif;color:#fafafa;line-height:1.6">
            ${data.recommendations.map((r) => `<li>${r}</li>`).join('')}
          </ul>
        </div>`
      : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700&family=Poppins:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    @page { size: letter; margin: 0.5in; }
    * { box-sizing: border-box; }
  </style>
</head>
<body style="width:1200px;margin:0;padding:40px;background:linear-gradient(180deg,#383838,#1e1e2e);color:#fafafa;font-family:Poppins,sans-serif">
  <div style="text-align:center;margin-bottom:32px">
    <div style="font-family:Orbitron,sans-serif;font-size:11px;letter-spacing:0.5em;color:#b8a4ff">BEYOND REMEDY</div>
    <h1 style="font-family:Orbitron,sans-serif;font-size:28px;margin:12px 0 4px">BioAge Report Card</h1>
    <p style="color:#e3cbbe;margin:0">${data.patientName}</p>
    <p style="color:#9ca3af;font-size:13px;margin:4px 0 0">${data.assessmentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div style="display:flex;justify-content:center;margin-bottom:32px">
    <div style="text-align:center">
      <div style="width:160px;height:160px;border-radius:50%;border:3px solid #7a5fff;display:flex;align-items:center;justify-content:center;margin:0 auto;box-shadow:0 0 48px #7a5fff44">
        <span style="font-family:Orbitron,sans-serif;font-size:48px;font-weight:700">${bioDisplay}</span>
      </div>
      <p style="font-family:Orbitron,sans-serif;font-size:10px;letter-spacing:0.35em;color:#e3cbbe;margin-top:12px">BIOLOGICAL AGE</p>
      ${data.chronologicalAge !== null ? `<p style="color:#e3cbbe;font-size:13px">Chronological: <strong style="font-family:Orbitron,sans-serif">${data.chronologicalAge}</strong></p>` : ''}
      <p style="font-family:Orbitron,sans-serif;font-size:18px;font-weight:700;color:#7a5fff;margin:8px 0">${formatDelta(data.masterDelta)}</p>
      <p style="font-family:Orbitron,sans-serif;color:#b8a4ff;letter-spacing:0.2em">${stars(data.confidence)}</p>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:32px">
    ${(['d1', 'd2', 'd3', 'd4', 'd5'] as const)
      .map((k) => {
        const d = data.deltas[k];
        return `<div style="text-align:center;padding:14px;border:1px solid #ffffff10;border-radius:12px;background:#ffffff05">
          <div style="font-family:Orbitron,sans-serif;font-size:9px;color:#e3cbbe;letter-spacing:0.2em">${k.toUpperCase()}</div>
          <div style="font-family:Orbitron,sans-serif;font-size:16px;font-weight:700;margin-top:6px">${d !== null && d !== undefined ? formatDelta(d) : '—'}</div>
        </div>`;
      })
      .join('')}
  </div>

  ${data.clinicalRiskTier ? `<p style="text-align:center;color:#e3cbbe;margin-bottom:24px">Clinical Risk Tier: <strong>${data.clinicalRiskTier}</strong></p>` : ''}

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
    ${domainBlocks}
  </div>

  ${
    data.deltas.d5 !== null && data.deltas.d5 !== undefined
      ? `<div style="margin-top:24px;padding:16px 20px;border:1px solid #ffffff10;border-radius:16px;background:#ffffff05">
          <span style="font-family:Orbitron,sans-serif;font-size:10px;letter-spacing:0.35em;color:#e3cbbe">DOMAIN 5 — LIFESTYLE</span>
          <span style="font-family:Orbitron,sans-serif;font-size:20px;font-weight:700;margin-left:16px">${formatDelta(data.deltas.d5)}</span>
        </div>`
      : ''
  }

  ${recs}

  <p style="margin-top:40px;text-align:center;font-size:11px;color:#9ca3af">
    Beyond Remedy · Physician-Supervised Longevity Medicine · Confidential Clinical Document
  </p>
</body>
</html>`;
}

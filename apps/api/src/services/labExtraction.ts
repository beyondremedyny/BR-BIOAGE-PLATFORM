import type { LabExtractionResult } from '../../../../packages/shared/src';
import { mapAndScoreMarkers } from '../../../../packages/shared/src';

const LAB_EXTRACTION_SYSTEM_PROMPT = `
You are a clinical laboratory report parser for Beyond Remedy, a physician-supervised longevity medicine company.

Your task is to extract every numeric biomarker value from the provided lab report image or PDF.

CRITICAL RULES:
1. Extract EVERY numeric value you can see — do not skip any
2. Use the EXACT marker name as it appears on the report, converted to lowercase
3. Include reference ranges exactly as shown
4. Flag values marked H (high), L (low), or * (abnormal) from the original report
5. If you cannot read a value clearly, skip it rather than guess
6. Return ONLY valid JSON — no markdown, no explanation, no code blocks

RETURN FORMAT:
{
  "lab_source": "name of lab if visible (Quest Diagnostics / LabCorp / Hospital name / Unknown)",
  "report_date": "date if visible in any format / Unknown",
  "patient_name": "patient name if visible / Unknown",
  "ordering_physician": "physician name if visible / Unknown",
  "markers": [
    {
      "name": "exact marker name lowercase",
      "value": "numeric value as string",
      "unit": "unit as shown on report",
      "reference_range": "reference range string or null",
      "flag": "H or L or * or null"
    }
  ],
  "notes": "any observations about image quality, partial visibility, or important clinical context visible on the report"
}

If the image is NOT a lab report: { "error": "clear description of what the image actually shows" }
If image quality is too poor to read: { "error": "image quality insufficient — please upload a clearer photo" }
`;

export async function extractLabsFromFile(
  base64Data: string,
  mediaType: string,
  anthropicApiKey: string
): Promise<LabExtractionResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: LAB_EXTRACTION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Data },
            },
            {
              type: 'text',
              text: 'Please extract all laboratory values from this report. Return only the JSON object.',
            },
          ],
        },
      ],
    }),
  });

  const data = (await response.json()) as {
    error?: { message?: string };
    content?: { type: string; text?: string }[];
  };
  if (!response.ok) throw new Error(data.error?.message || 'AI extraction failed');

  const text = data.content?.find((b) => b.type === 'text')?.text || '';
  const cleaned = text.replace(/```json|```/g, '').trim();

  let parsed: LabExtractionResult & { error?: string };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned malformed JSON');
  }

  if (parsed.error) throw new Error(parsed.error);

  return parsed;
}

export { mapAndScoreMarkers };

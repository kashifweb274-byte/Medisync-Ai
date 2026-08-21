const CATEGORIES = [
  { key: 'cbc', label: 'Complete Blood Count (CBC)', match: /cbc|blood|hemogram/i, unit: '' },
  { key: 'lipid', label: 'Lipid Profile', match: /lipid|cholesterol|hdl|ldl/i, unit: 'mg/dL' },
  { key: 'glucose', label: 'Blood Glucose', match: /glucose|sugar|hb1ac|diabetic/i, unit: 'mg/dL' },
  { key: 'liver', label: 'Liver Function Test (LFT)', match: /liver|sgpt|sgot|bilirubin/i, unit: 'U/L' },
  { key: 'kidney', label: 'Kidney Function Test (KFT)', match: /kidney|creatinine|urea|renal/i, unit: 'mg/dL' },
  { key: 'thyroid', label: 'Thyroid Panel', match: /thyroid|tsh|t3|t4/i, unit: 'µIU/mL' },
  { key: 'imaging', label: 'Imaging / X-Ray Report', match: /x-?ray|ct|mri|scan|ultrasound|imaging/i, unit: '' },
]

export function detectCategory(filename = '') {
  for (const c of CATEGORIES) {
    if (c.match.test(filename)) return c
  }
  return CATEGORIES[0]
}

/**
 * Analyze an uploaded file.
 * This helper intentionally does not fabricate values. It returns a clean
 * empty analysis state so the backend OCR result remains the single source of truth.
 */
export function analyzeReport(file, ctx = {}) {
  const category = detectCategory(file?.name || '')

  return {
    id: `rpt-${Date.now()}`,
    fileName: file?.name || 'report.pdf',
    size: file?.size || 0,
    category: category.key,
    categoryLabel: category.label,
    analyzedAt: new Date().toISOString(),
    params: [],
    flags: [],
    flaggedCount: 0,
    healthScore: 0,
    status: 'Pending',
    summary: 'OCR extraction failed. Clear image required.',
    recommendations: ['Upload a clear PDF or image for OCR extraction.'],
    patientName: ctx.patientName || 'You',
    doctorName: ctx.doctorName || 'Dr. S. Iyer (Primary Care)',
  }
}

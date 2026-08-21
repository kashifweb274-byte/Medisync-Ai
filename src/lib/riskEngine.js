/**
 * Health-risk engine.
 *
 * Combines the patient's latest vitals, active report flags and medication
 * adherence into a 0–100 risk score, a Low/Moderate/High level, and a set of
 * explainable AI insight cards (each with a severity, confidence and source).
 */

import { clamp } from './format'

export const SEVERITY = { LOW: 'low', MODERATE: 'moderate', HIGH: 'high' }

function severityFor(score) {
  if (score >= 70) return SEVERITY.HIGH
  if (score >= 40) return SEVERITY.MODERATE
  return SEVERITY.LOW
}

/**
 * @param {object} input
 * @param {object} input.vitals   latest reading { bpSystolic, bpDiastolic, glucose, heartRate, spo2, bmi }
 * @param {Array}  input.reports  analyzed reports
 * @param {object} input.adherence { percent }
 * @returns {{ score, level, levelLabel, insights: Array<object>, drivers: Array<string> }}
 */
export function computeRisk({ vitals = {}, reports = [], adherence = {} }) {
  const scores = []

  // --- Vitals scoring -----------------------------------------------------
  if (vitals.bpSystolic) {
    const s = vitals.bpSystolic
    scores.push(s >= 160 ? 28 : s >= 140 ? 22 : s >= 130 ? 14 : s >= 120 ? 6 : 2)
  }
  if (vitals.glucose) {
    const g = vitals.glucose
    scores.push(g >= 180 ? 26 : g >= 126 ? 20 : g >= 100 ? 10 : 2)
  }
  if (vitals.heartRate) {
    const hr = vitals.heartRate
    scores.push(hr > 100 || hr < 55 ? 16 : hr > 90 ? 8 : 3)
  }
  if (vitals.spo2) {
    const o = vitals.spo2
    scores.push(o < 94 ? 24 : o < 97 ? 12 : 2)
  }
  if (vitals.bmi) {
    const b = vitals.bmi
    scores.push(b > 32 ? 16 : b > 27 ? 9 : b > 25 ? 4 : 1)
  }

  // --- Report flags -------------------------------------------------------
  let flagCount = 0
  reports.forEach((r) => {
    flagCount += r.flags?.length || 0
  })
  scores.push(flagCount >= 4 ? 22 : flagCount >= 2 ? 13 : flagCount >= 1 ? 6 : 1)

  // --- Adherence ------------------------------------------------------------
  const adh = adherence.percent ?? 100
  scores.push(adh < 60 ? 18 : adh < 75 ? 12 : adh < 90 ? 6 : 1)

  const raw = scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length)
  const score = Math.round(clamp(raw * 2.1, 4, 96))
  const level = severityFor(score)

  const insights = buildInsights({ vitals, reports, adherence, score, level })
  const drivers = insights.filter((i) => i.severity !== SEVERITY.LOW).map((i) => i.title)

  return {
    score,
    level,
    levelLabel: level === SEVERITY.HIGH ? 'High risk' : level === SEVERITY.MODERATE ? 'Moderate risk' : 'Low risk',
    insights,
    drivers,
  }
}

function buildInsights({ vitals, reports, adherence, score, level }) {
  const list = []

  if (vitals.bpSystolic >= 130) {
    list.push({
      id: 'bp',
      severity: vitals.bpSystolic >= 140 ? SEVERITY.HIGH : SEVERITY.MODERATE,
      title: 'Blood pressure trending above target',
      detail: `Your latest reading of ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg is above the 130/80 target. Sustained elevation increases cardiovascular strain.`,
      confidence: 88,
      source: 'Vitals monitor',
      action: 'Monitor BP at the same time daily; review readings with your doctor if it stays ≥140/90 for 3 days.',
    })
  }
  if (vitals.glucose >= 100) {
    list.push({
      id: 'glu',
      severity: vitals.glucose >= 126 ? SEVERITY.HIGH : SEVERITY.MODERATE,
      title: 'Fasting glucose elevated',
      detail: `Fasting glucose of ${vitals.glucose} mg/dL sits above the normal range. This is an early signal for prediabetic or diabetic patterns.`,
      confidence: 84,
      source: 'Vitals monitor',
      action: 'Reduce added sugar, walk 30 min after meals, and repeat the test in 2 weeks.',
    })
  }
  const ldlFlag = reports.flatMap((r) => r.flags || []).find((f) => f.name === 'LDL Cholesterol')
  if (ldlFlag) {
    list.push({
      id: 'ldl',
      severity: SEVERITY.MODERATE,
      title: 'LDL cholesterol above reference range',
      detail: `Report ${reports.find((r) => (r.flags || []).includes(ldlFlag))?.fileName || 'analysis'} shows LDL at ${ldlFlag.value} mg/dL (target < 100).`,
      confidence: 81,
      source: 'Lab report analysis',
      action: 'Prioritize fiber-rich foods and unsaturated fats; re-test after 6 weeks.',
    })
  }
  if ((adherence.percent ?? 100) < 85) {
    list.push({
      id: 'adh',
      severity: (adherence.percent ?? 100) < 70 ? SEVERITY.HIGH : SEVERITY.MODERATE,
      title: 'Medication adherence below target',
      detail: `Adherence over the last 7 days is ${Math.round(adherence.percent ?? 0)}%. Missed doses can silently undo treatment gains.`,
      confidence: 92,
      source: 'Adherence tracker',
      action: 'Turn on reminders and link this medication to an existing daily habit.',
    })
  }
  if (reports.length && (reports[0].healthScore ?? 100) < 65) {
    list.push({
      id: 'rpt',
      severity: SEVERITY.MODERATE,
      title: 'Recent lab summary indicates monitoring needed',
      detail: `Your latest analysis scored ${reports[0].healthScore}/100 with ${reports[0].flaggedCount} flagged parameter(s).`,
      confidence: 78,
      source: 'Lab report analysis',
      action: 'Bring the AI summary to your next consultation for clinical correlation.',
    })
  }

  // Fallback — always have at least one insight
  if (!list.length) {
    list.push({
      id: 'stable',
      severity: SEVERITY.LOW,
      title: 'Vitals stable — no urgent signals',
      detail: 'Your recent readings, lab results and medication adherence are within healthy ranges. Continue your current routine.',
      confidence: 95,
      source: 'Continuous monitoring',
      action: 'Keep tracking daily vitals and attend your next scheduled follow-up.',
    })
  }

  return list.sort((a, b) => sevNum(b.severity) - sevNum(a.severity))
}

function sevNum(s) {
  return s === SEVERITY.HIGH ? 3 : s === SEVERITY.MODERATE ? 2 : 1
}

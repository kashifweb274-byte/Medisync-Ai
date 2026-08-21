/**
 * Seeded mock data for MediSync AI.
 *
 * All dates are relative to "today" so the demo always looks alive.
 * Doctors are now fetched from the backend API (GET /api/doctors).
 * This file retains patient/demo data for localStorage seeding only.
 */

import { addDays, todayISO } from '../lib/format'

const iso = todayISO()

/* ------------------------------------------------------------------ patient */
export const patientProfile = {
  id: 'p1',
  name: 'Aarav Mehta',
  email: 'aarav.mehta@example.com',
  phone: '+91 98765 43210',
  age: 34,
  gender: 'Male',
  bloodGroup: 'O+',
  heightCm: 172,
  weightKg: 78,
  allergies: ['Penicillin'],
  conditions: ['Mild hypertension', 'Prediabetic (early)'],
  location: 'Bengaluru, Karnataka',
}

export const vitalsHistory = [
  { date: addDays(iso, -27), bpSystolic: 132, bpDiastolic: 86, heartRate: 78, glucose: 108, spo2: 98, bmi: 26.4 },
  { date: addDays(iso, -22), bpSystolic: 130, bpDiastolic: 84, heartRate: 76, glucose: 104, spo2: 98, bmi: 26.3 },
  { date: addDays(iso, -16), bpSystolic: 134, bpDiastolic: 88, heartRate: 80, glucose: 112, spo2: 97, bmi: 26.5 },
  { date: addDays(iso, -9), bpSystolic: 128, bpDiastolic: 82, heartRate: 74, glucose: 106, spo2: 98, bmi: 26.3 },
  { date: addDays(iso, -4), bpSystolic: 131, bpDiastolic: 85, heartRate: 77, glucose: 109, spo2: 98, bmi: 26.4 },
  { date: addDays(iso, -1), bpSystolic: 129, bpDiastolic: 83, heartRate: 76, glucose: 105, spo2: 98, bmi: 26.3 },
]

export const latestVitals = {
  ...vitalsHistory[vitalsHistory.length - 1],
  updatedAt: 'today, 8:00 AM',
}

/* ----------------------------------------------------------------- appointments */
function doseId() {
  return `dose-${Math.random().toString(36).slice(2, 8)}`
}

/** Build a medication with a 7-day dose log. */
function buildMed(id, name, { dosage, times, color, adherence = 0.9, scheduledDays = 7 }) {
  const doses = []
  for (let i = scheduledDays - 1; i >= 0; i--) {
    const date = addDays(iso, -i)
    times.forEach((t, idx) => {
      const taken =
        date === iso
          ? null // today's future doses are pending
          : Math.random() < adherence
            ? true
            : Math.random() < 0.5
              ? false
              : null
      doses.push({ id: doseId(), time: t, date, taken, medId: id, slot: idx })
    })
  }
  return {
    id,
    name,
    dosage,
    times,
    color,
    started: addDays(iso, -40),
    doseCount: times.length,
    doses,
  }
}

export const medications = [
  buildMed('m1', 'Amlodipine 5 mg', { dosage: '1 tablet · oral', times: ['08:00', '20:00'], color: '#0891b2', adherence: 0.92 }),
  buildMed('m2', 'Metformin 500 mg', { dosage: '1 tablet · with meals', times: ['08:30', '13:30', '20:30'], color: '#059669', adherence: 0.86 }),
  buildMed('m3', 'Vitamin D3 60K IU', { dosage: '1 tablet · weekly', times: ['09:00'], color: '#d97706', adherence: 0.95 }),
]

/**
 * Some existing appointments to seed the timeline (localStorage demo only).
 * These use placeholder doctor IDs - real bookings go through backend API.
 */
export const seedAppointments = [
  {
    id: 'a1',
    doctorId: '66f1a2b3c4d5e6f7a8b9c0d1',
    patientName: 'Aarav Mehta',
    date: addDays(iso, -12),
    time: '10:00',
    mode: 'inperson',
    type: 'Follow-up',
    status: 'completed',
    symptoms: 'Persistent fatigue and occasional dizziness',
  },
  {
    id: 'a2',
    doctorId: '66f1a2b3c4d5e6f7a8b9c0d2',
    patientName: 'Aarav Mehta',
    date: addDays(iso, -6),
    time: '11:30',
    mode: 'video',
    type: 'Consultation',
    status: 'completed',
    symptoms: 'Review blood pressure readings and report',
  },
  {
    id: 'a3',
    doctorId: '66f1a2b3c4d5e6f7a8b9c0d1',
    patientName: 'Aarav Mehta',
    date: addDays(iso, 2),
    time: '09:00',
    mode: 'video',
    type: 'Follow-up',
    status: 'upcoming',
    symptoms: 'Discuss latest lipid report',
  },
  {
    id: 'a4',
    doctorId: '66f1a2b3c4d5e6f7a8b9c0d3',
    patientName: 'Aarav Mehta',
    date: addDays(iso, 5),
    time: '14:30',
    mode: 'inperson',
    type: 'Consultation',
    status: 'upcoming',
    symptoms: 'Review fasting glucose trend and medication plan',
  },
  {
    id: 'a5',
    doctorId: '66f1a2b3c4d5e6f7a8b9c0d5',
    patientName: 'Aarav Mehta',
    date: addDays(iso, 8),
    time: '16:00',
    mode: 'video',
    type: 'Consultation',
    status: 'pending',
    symptoms: 'Skin rash on forearm — recurrence',
  },
  /* ---- Dr. Sara Iyer's own patients --------------------------------- */
  {
    id: 'a6',
    doctorId: '66f1a2b3c4d5e6f7a8b9c0d1',
    patientName: 'Meera Nair',
    date: addDays(iso, 0),
    time: '10:30',
    mode: 'inperson',
    type: 'Review',
    status: 'upcoming',
    symptoms: 'Fasting glucose trending high (168 mg/dL)',
  },
  {
    id: 'a7',
    doctorId: '66f1a2b3c4d5e6f7a8b9c0d1',
    patientName: 'Rahul Verma',
    date: addDays(iso, 0),
    time: '12:00',
    mode: 'video',
    type: 'Follow-up',
    status: 'upcoming',
    symptoms: 'Asthma control check',
  },
  {
    id: 'a8',
    doctorId: '66f1a2b3c4d5e6f7a8b9c0d1',
    patientName: 'Sunita Rao',
    date: addDays(iso, 1),
    time: '09:30',
    mode: 'inperson',
    type: 'Consultation',
    status: 'pending',
    symptoms: 'New patient — CKD stage 2 and BP management',
  },
  {
    id: 'a9',
    doctorId: '66f1a2b3c4d5e6f7a8b9c0d1',
    patientName: 'Kabir Anand',
    date: addDays(iso, 2),
    time: '15:00',
    mode: 'video',
    type: 'Consultation',
    status: 'pending',
    symptoms: 'Migraine frequency increased this month',
  },
  {
    id: 'a10',
    doctorId: '66f1a2b3c4d5e6f7a8b9c0d1',
    patientName: 'Meera Nair',
    date: addDays(iso, -30),
    time: '11:00',
    mode: 'inperson',
    type: 'Consultation',
    status: 'completed',
    symptoms: 'Initial diabetes review',
  },
  {
    id: 'a11',
    doctorId: '66f1a2b3c4d5e6f7a8b9c0d1',
    patientName: 'Aarav Mehta',
    date: addDays(iso, -20),
    time: '16:30',
    mode: 'video',
    type: 'Follow-up',
    status: 'completed',
    symptoms: 'BP review after medication change',
  },
]

/* ------------------------------------------------------------------ reports */
function buildReport(id, fileName, category, daysAgo, healthScore, flaggedCount, status) {
  return {
    id,
    fileName,
    category,
    categoryLabel: category,
    analyzedAt: new Date(addDays(iso, -daysAgo) + 'T10:15:00').toISOString(),
    healthScore,
    flaggedCount,
    status,
    size: 240000 + daysAgo * 10000,
    patientName: 'Aarav Mehta',
    doctorName: 'Dr. S. Iyer (Primary Care)',
    summary:
      flaggedCount === 0
        ? 'All parameters within normal limits. No clinically significant findings detected.'
        : `Analysis flagged ${flaggedCount} parameter(s). Values suggest mild deviation from reference ranges; clinical correlation recommended.`,
    flags: [],
    recommendations: ['Schedule a follow-up with your primary care doctor'],
    params: [],
  }
}

export const seedReports = [
  buildReport('r1', 'lipid_profile_feb.pdf', 'Lipid Profile', 9, 71, 2, 'Monitor'),
  buildReport('r2', 'glucose_fasting_mar.pdf', 'Blood Glucose', 21, 83, 1, 'Monitor'),
  buildReport('r3', 'cbc_january.pdf', 'Complete Blood Count (CBC)', 38, 92, 0, 'Good'),
]

/* -------------------------------------------------------------- doctor users */
/** Doctor profile used by DataContext for doctor portal demo (Dr. Sara Iyer). */
export const doctorProfile = {
  id: '66f1a2b3c4d5e6f7a8b9c0d1',
  name: 'Dr. Sara Iyer',
  specialty: 'General Physician',
  email: 'sara.iyer@medisync.ai',
  phone: '+91 98123 45678',
  clinic: 'MediSync Care Centre, Koramangala',
  experience: 7,
  rating: 4.7,
  reviews: 521,
  fee: 500,
  videoFee: 400,
}

// Fixed export for components expecting a 'doctors' array
export const doctors = [
  doctorProfile,
  {
    id: 'faisal-demo',
    name: 'Dr. Faisal',
    specialty: 'General Physician / Cardiologist',
    email: 'faisal@gmail.com',
    clinic: 'MediSync Care Center',
    location: 'MediSync Care Center',
    experience: 10,
    rating: 4.8,
    reviews: 186,
    fee: 800,
    videoFee: 600,
    online: true,
    languages: ['English', 'Hindi'],
  },
]

/** Patients under Dr. Iyer's care (for the doctor portal). */
export const doctorPatients = [
  {
    id: 'p1',
    name: 'Aarav Mehta',
    age: 34,
    gender: 'Male',
    bloodGroup: 'O+',
    lastVisit: addDays(iso, -12),
    risk: 'moderate',
    riskScore: 58,
    adherence: 82,
    conditions: ['Hypertension', 'Prediabetic'],
    vitals: vitalsHistory[vitalsHistory.length - 1],
    phone: '+91 98765 43210',
    email: 'aarav.mehta@example.com',
  },
  {
    id: 'p2',
    name: 'Meera Nair',
    age: 47,
    gender: 'Female',
    bloodGroup: 'A+',
    lastVisit: addDays(iso, -5),
    risk: 'high',
    riskScore: 74,
    adherence: 61,
    conditions: ['Type 2 diabetes', 'Dyslipidemia'],
    vitals: { bpSystolic: 152, bpDiastolic: 94, heartRate: 88, glucose: 168, spo2: 96, bmi: 29.8 },
    phone: '+91 98222 33110',
    email: 'meera.nair@example.com',
  },
  {
    id: 'p3',
    name: 'Rahul Verma',
    age: 29,
    gender: 'Male',
    bloodGroup: 'B+',
    lastVisit: addDays(iso, -18),
    risk: 'low',
    riskScore: 22,
    adherence: 96,
    conditions: ['Seasonal asthma'],
    vitals: { bpSystolic: 118, bpDiastolic: 76, heartRate: 70, glucose: 92, spo2: 98, bmi: 23.1 },
    phone: '+91 98989 00990',
    email: 'rahul.verma@example.com',
  },
  {
    id: 'p4',
    name: 'Sunita Rao',
    age: 61,
    gender: 'Female',
    bloodGroup: 'AB+',
    lastVisit: addDays(iso, -2),
    risk: 'high',
    riskScore: 81,
    adherence: 47,
    conditions: ['CKD stage 2', 'Hypertension', 'Diabetes'],
    vitals: { bpSystolic: 164, bpDiastolic: 98, heartRate: 92, glucose: 178, spo2: 95, bmi: 30.4 },
    phone: '+91 99001 12345',
    email: 'sunita.rao@example.com',
  },
  {
    id: 'p5',
    name: 'Kabir Anand',
    age: 38,
    gender: 'Male',
    bloodGroup: 'O-',
    lastVisit: addDays(iso, -30),
    risk: 'moderate',
    riskScore: 44,
    adherence: 74,
    conditions: ['Migraine'],
    vitals: { bpSystolic: 126, bpDiastolic: 82, heartRate: 72, glucose: 101, spo2: 98, bmi: 24.8 },
    phone: '+91 97777 55543',
    email: 'kabir.anand@example.com',
  },
]

/* --------------------------------------------------------------- risk alerts */
export const seedAlerts = [
  {
    id: 'al1',
    patientId: 'p4',
    severity: 'high',
    title: 'Blood pressure critically elevated',
    detail: 'Systolic 164 mmHg sustained across 3 readings. Medication adherence dropped to 47%.',
    time: '12 min ago',
    source: 'Continuous monitoring',
    status: 'new',
  },
  {
    id: 'al2',
    patientId: 'p2',
    severity: 'high',
    title: 'Fasting glucose 168 mg/dL',
    detail: 'Above 126 mg/dL threshold for 2 consecutive weeks. Consider insulin escalation review.',
    time: '2 hr ago',
    source: 'Vitals monitor',
    status: 'new',
  },
  {
    id: 'al3',
    patientId: 'p1',
    severity: 'moderate',
    title: 'LDL cholesterol flagged',
    detail: 'LDL 138 mg/dL on latest lipid panel. Slight improvement, continue statin adherence.',
    time: 'Yesterday',
    source: 'Lab report analysis',
    status: 'acknowledged',
  },
  {
    id: 'al4',
    patientId: 'p5',
    severity: 'low',
    title: 'Migraine frequency up slightly',
    detail: '3 episodes this month vs 2 last month. Suggest sleep-hygiene review.',
    time: '2 days ago',
    source: 'Care notes',
    status: 'acknowledged',
  },
]

/**
 * Fallback availability function (used by DataContext for doctor portal).
 * In production, availability comes from the backend API / Doctor.availability.
 * This returns a simple 9-6 window for weekdays.
 */
export function getAvailability(doctorId) {
  const windows = []
  const start = new Date(`${iso}T00:00:00`)
  for (let i = 0; i < 14; i++) {
    const dow = (start.getDay() + i) % 7
    // Weekdays only (Mon-Fri)
    if (dow >= 1 && dow <= 5) {
      const date = addDays(iso, i)
      windows.push({ date, start: '09:00', end: '18:00' })
    }
  }
  return windows
}

/** Today's next available window (for card previews) */
export function nextAvailable(doctorId) {
  const windows = getAvailability(doctorId)
  const upcoming = windows.filter((w) => w.date >= iso)
  return upcoming[0] || null
}

/** Specialties list - in production comes from API */
export const specialties = [
  'Cardiologist',
  'Dermatologist',
  'Endocrinologist',
  'General Physician',
  'Neurologist',
  'Orthopedic Surgeon',
  'Pediatrician',
  'Psychiatrist',
].sort()

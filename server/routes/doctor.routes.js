const express = require('express')
const router = express.Router()

// Dummy Auth Middleware (Replace with your actual JWT middleware file, e.g., require('../middleware/auth'))
const authenticate = (req, res, next) => {
  // Example JWT extraction: const token = req.headers.authorization?.split(' ')[1]
  // req.user = { id: 'doc_1', name: 'Dr. Iyer', role: 'doctor' }
  req.user = { id: 'doc_1', name: 'Dr. Iyer' }
  next()
}

// In-Memory Seed Data Store (Replace array manipulations with MySQL queries in production)
let appointments = [
  {
    id: 'appt_1',
    doctorId: 'doc_1',
    patientName: 'Aarav Mehta',
    date: new Date().toISOString().split('T')[0],
    time: '10:30',
    type: 'Follow-up',
    mode: 'in-person',
    status: 'upcoming',
    symptoms: 'Mild fever & BP check',
  },
]

let alerts = [
  {
    id: 'alt_1',
    patientId: 'p_101',
    severity: 'high',
    status: 'new',
    title: 'High Blood Pressure Spike',
    detail: 'Patient logged BP 150/95 mmHg at 8:00 AM.',
    time: '2 hours ago',
  },
]

let doctorPatients = [
  {
    id: 'p_101',
    name: 'Aarav Mehta',
    risk: 'high',
    adherence: 68,
    conditions: ['Hypertension', 'Type 2 Diabetes'],
  },
  {
    id: 'p_102',
    name: 'Priya Sharma',
    risk: 'moderate',
    adherence: 82,
    conditions: ['Thyroid'],
  },
]

let schedule = Array.from({ length: 7 }, (_, day) => ({
  day,
  on: day !== 0,
  start: '09:00',
  end: '18:00',
}))

let medications = []
let reports = []

/* ==========================================================================
   1. APPOINTMENTS ROUTES
   ========================================================================== */

// GET /api/appointments - Fetch doctor's appointments
router.get('/appointments', authenticate, async (req, res) => {
  try {
    // MySQL query example:
    // const [rows] = await db.query('SELECT * FROM appointments WHERE doctor_id = ?', [req.user.id])
    res.json({ success: true, appointments })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch appointments', error: err.message })
  }
})

// POST /api/appointments - Create new appointment
router.post('/appointments', authenticate, async (req, res) => {
  try {
    const newAppt = {
      id: `appt_${Date.now()}`,
      doctorId: req.user.id,
      status: 'pending',
      ...req.body,
    }
    appointments.unshift(newAppt)

    // MySQL query example:
    // await db.query('INSERT INTO appointments SET ?', [newAppt])

    res.status(201).json({ success: true, appointment: newAppt })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create appointment', error: err.message })
  }
})

// PATCH /api/appointments/:id - Update appointment
router.patch('/appointments/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params
    const patch = req.body

    appointments = appointments.map((a) => (a.id === id ? { ...a, ...patch } : a))

    // MySQL query example:
    // await db.query('UPDATE appointments SET ? WHERE id = ?', [patch, id])

    res.json({ success: true, message: 'Appointment updated successfully' })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update appointment', error: err.message })
  }
})

// PATCH /api/appointments/:id/cancel - Cancel appointment
router.patch('/appointments/:id/cancel', authenticate, async (req, res) => {
  try {
    const { id } = req.params
    appointments = appointments.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))

    // MySQL query example:
    // await db.query('UPDATE appointments SET status = "cancelled" WHERE id = ?', [id])

    res.json({ success: true, message: 'Appointment cancelled successfully' })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to cancel appointment', error: err.message })
  }
})

/* ==========================================================================
   2. RISK ALERTS & PATIENTS ROUTES
   ========================================================================== */

// GET /api/doctors/alerts - Fetch real-time health alerts
router.get('/doctors/alerts', authenticate, async (req, res) => {
  try {
    res.json({ success: true, alerts })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch alerts', error: err.message })
  }
})

// PATCH /api/doctors/alerts/:id - Update alert status (read/dismissed)
router.patch('/doctors/alerts/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    alerts = alerts.map((a) => (a.id === id ? { ...a, status } : a))

    res.json({ success: true, message: 'Alert status updated' })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update alert', error: err.message })
  }
})

// GET /api/doctors/patients - Fetch patients assigned to doctor
router.get('/doctors/patients', authenticate, async (req, res) => {
  try {
    res.json({ success: true, patients: doctorPatients })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch patients', error: err.message })
  }
})

/* ==========================================================================
   3. CLINIC SCHEDULE ROUTES
   ========================================================================== */

// GET /api/doctors/schedule - Fetch doctor weekly schedule
router.get('/doctors/schedule', authenticate, async (req, res) => {
  try {
    res.json({ success: true, schedule })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch schedule', error: err.message })
  }
})

// POST /api/doctors/schedule - Update doctor weekly schedule
router.post('/doctors/schedule', authenticate, async (req, res) => {
  try {
    const { schedule: newSchedule } = req.body
    if (Array.isArray(newSchedule)) {
      schedule = newSchedule
    }
    res.json({ success: true, message: 'Schedule updated successfully', schedule })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update schedule', error: err.message })
  }
})

/* ==========================================================================
   4. MEDICATIONS & REPORTS ROUTES
   ========================================================================== */

// GET /api/medications - Fetch medications
router.get('/medications', authenticate, async (req, res) => {
  try {
    res.json({ success: true, medications })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch medications', error: err.message })
  }
})

// PATCH /api/medications/:medId/dose/:doseId - Toggle dose status
router.patch('/medications/:medId/dose/:doseId', authenticate, async (req, res) => {
  try {
    const { medId, doseId } = req.params
    const { taken } = req.body

    medications = medications.map((m) =>
      m.id === medId
        ? { ...m, doses: m.doses.map((d) => (d.id === doseId ? { ...d, taken } : d)) }
        : m
    )

    res.json({ success: true, message: 'Dose status updated' })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update dose status', error: err.message })
  }
})

// GET /api/reports - Fetch reports
router.get('/reports', authenticate, async (req, res) => {
  try {
    res.json({ success: true, reports })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reports', error: err.message })
  }
})

// POST /api/reports - Add lab report
router.post('/reports', authenticate, async (req, res) => {
  try {
    const newReport = { id: `rep_${Date.now()}`, ...req.body }
    reports.unshift(newReport)
    res.status(201).json({ success: true, report: newReport })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save report', error: err.message })
  }
})

module.exports = router
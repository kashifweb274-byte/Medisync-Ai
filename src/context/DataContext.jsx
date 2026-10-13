import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import {
  medications as seedMeds,
  seedAppointments,
  seedReports,
  seedAlerts,
  doctorPatients as seedDoctorPatients,
  doctorProfile,
  getAvailability as seedGetAvailability,
} from '../data/seed'
import { todayISO, addDays } from '../lib/format'
import { computeAdherence } from '../lib/adherence'
import { computeRisk } from '../lib/riskEngine'

const DataContext = createContext(null)
const KEY = 'medisync.data.v1'

const DEFAULT_SCHEDULE = Array.from({ length: 7 }, (_, day) => ({
  day,
  on: day !== 0,
  start: '09:00',
  end: '18:00',
}))

const DEMO_PATIENT = 'Aarav Mehta'

function loadLocalBackup() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return null
}

export function DataProvider({ children }) {
  const stored = useMemo(loadLocalBackup, [])
  
  // States with Fallback to LocalStorage
  const [appointments, setAppointments] = useState(stored?.appointments ?? seedAppointments)
  const [medications, setMedications] = useState(stored?.medications ?? seedMeds)
  const [reports, setReports] = useState(stored?.reports ?? [])
  const [alerts, setAlerts] = useState(stored?.alerts ?? seedAlerts)
  const [doctorPatients, setDoctorPatients] = useState(seedDoctorPatients)
  const [savedSlots, setSavedSlots] = useState(stored?.savedSlots ?? [])
  const [schedule, setSchedule] = useState(stored?.schedule ?? DEFAULT_SCHEDULE)
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState([])

  // 1. Fetch live data from Express Backend on Mount
  const fetchAllBackendData = useCallback(async () => {
    setLoading(true)
    const token = localStorage.getItem('token')
    
    if (!token) {
      setLoading(false)
      return
    }

    const headers = { Authorization: `Bearer ${token}` }

    try {
      const [apptsRes, medsRes, reportsRes, alertsRes, schedRes, patientsRes] = await Promise.allSettled([
        axios.get('/api/appointments', { headers }),
        axios.get('/api/medications', { headers }),
        axios.get('/api/reports', { headers }),
        axios.get('/api/doctors/alerts', { headers }),
        axios.get('/api/doctors/schedule', { headers }),
        axios.get('/api/doctors/patients', { headers }),
      ])

      if (apptsRes.status === 'fulfilled' && apptsRes.value.data?.appointments) {
        setAppointments(apptsRes.value.data.appointments)
      }
      if (medsRes.status === 'fulfilled' && medsRes.value.data?.medications) {
        setMedications(medsRes.value.data.medications)
      }
      if (reportsRes.status === 'fulfilled' && reportsRes.value.data?.reports) {
        setReports(reportsRes.value.data.reports)
      }
      if (alertsRes.status === 'fulfilled' && alertsRes.value.data?.alerts) {
        setAlerts(alertsRes.value.data.alerts)
      }
      if (schedRes.status === 'fulfilled' && schedRes.value.data?.schedule) {
        setSchedule(schedRes.value.data.schedule)
      }
      if (patientsRes.status === 'fulfilled' && patientsRes.value.data?.patients) {
        setDoctorPatients(patientsRes.value.data.patients)
      }
    } catch (err) {
      console.error('Error syncing with backend:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllBackendData()
  }, [fetchAllBackendData])

  // LocalStorage Backup persistence
  useEffect(() => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ appointments, medications, reports, alerts, savedSlots, schedule })
      )
    } catch {
      /* storage unavailable */
    }
  }, [appointments, medications, reports, alerts, savedSlots, schedule])

  /* ---------------------------------------------------------- toasts */
  const toast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3400)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  /* -------------------------------------------------- appointments */
  const addAppointment = useCallback(async (appt) => {
    setAppointments((list) => [appt, ...list])
    setSavedSlots((s) => [...s, { date: appt.date, time: appt.time || appt.timeSlot }])

    try {
      const token = localStorage.getItem('token')
      if (token) {
        await axios.post('/api/appointments', appt, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (err) {
      console.error('Failed to post appointment to server:', err)
    }
  }, [])

  const updateAppointment = useCallback(async (id, patch) => {
    setAppointments((list) => list.map((a) => (a._id === id || a.id === id ? { ...a, ...patch } : a)))

    try {
      const token = localStorage.getItem('token')
      if (token) {
        await axios.patch(`/api/appointments/${id}`, patch, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (err) {
      console.error('Failed to update appointment:', err)
    }
  }, [])

  const cancelAppointment = useCallback(async (id) => {
    setAppointments((list) => {
      const appt = list.find((a) => a._id === id || a.id === id)
      if (appt) {
        setSavedSlots((s) => s.filter((x) => !(x.date === appt.date && (x.time === (appt.time || appt.timeSlot)))))
      }
      return list.map((a) => (a._id === id || a.id === id ? { ...a, status: 'cancelled' } : a))
    })

    try {
      const token = localStorage.getItem('token')
      if (token) {
        await axios.patch(`/api/appointments/${id}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (err) {
      console.error('Failed to cancel appointment on server:', err)
    }
  }, [])

  /* ---------------------------------------------------- medications */
  const toggleDose = useCallback(async (medId, doseId, value) => {
    setMedications((meds) =>
      meds.map((m) =>
        (m._id === medId || m.id === medId)
          ? { ...m, doses: Array.isArray(m.doses) ? m.doses.map((d) => (d.id === doseId ? { ...d, taken: value } : d)) : [] }
          : m
      )
    )

    try {
      const token = localStorage.getItem('token')
      if (token) {
        await axios.patch(`/api/medications/${medId}/dose/${doseId}`, { taken: value }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (err) {
      console.error('Failed to toggle dose on server:', err)
    }
  }, [])

  /* -------------------------------------------------------- reports */
  const addReport = useCallback(async (report) => {
    setReports((list) => [report, ...list])

    try {
      const token = localStorage.getItem('token')
      if (token) {
        await axios.post('/api/reports', report, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (err) {
      console.error('Failed to save report to server:', err)
    }
  }, [])

  // DELETE REPORT & INSTANTLY CLEAR RISK
  const deleteReport = useCallback(async (id) => {
    setReports((list) => list.filter((r) => r._id !== id && r.id !== id))

    try {
      const token = localStorage.getItem('token')
      if (token) {
        await axios.delete(`/api/reports/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (err) {
      console.error('Failed to delete report on server:', err)
    }
  }, [])

  /* --------------------------------------------------------- alerts */
  const setAlertStatus = useCallback(async (id, status) => {
    setAlerts((list) => list.map((a) => (a._id === id || a.id === id ? { ...a, status } : a)))

    try {
      const token = localStorage.getItem('token')
      if (token) {
        await axios.patch(`/api/doctors/alerts/${id}`, { status }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (err) {
      console.error('Failed to update alert status:', err)
    }
  }, [])

  /* -------------------------------------------------------- schedule */
  const updateSchedule = useCallback(async (days) => {
    setSchedule(days)

    try {
      const token = localStorage.getItem('token')
      if (token) {
        await axios.post('/api/doctors/schedule', { schedule: days }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (err) {
      console.error('Failed to update schedule on server:', err)
    }
  }, [])

  const getDoctorAvailability = useCallback(
    (doctorId) => {
      if (doctorId !== doctorProfile.id) return seedGetAvailability(doctorId)
      const days = schedule?.length === 7 ? schedule : DEFAULT_SCHEDULE
      const windows = []
      const base = new Date(`${todayISO()}T00:00:00`)
      for (let i = 0; i < 14; i++) {
        const dow = (base.getDay() + i) % 7
        const d = days[dow]
        if (d?.on) {
          windows.push({ date: addDays(todayISO(), i), start: d.start, end: d.end })
        }
      }
      return windows
    },
    [schedule]
  )

  /* ------------------------------------------------------- derived */
  const adherence = useMemo(() => computeAdherence(medications || []), [medications])

  // Fixed patientRisk: Automatically resets to Low Risk when no reports exist
  const patientRisk = useMemo(() => {
    const safeReports = Array.isArray(reports) ? reports : []

    // AGAR KOI REPORT NAHI HAI TO RISK AUTOMATICALLY LOW / RESET RAHEGA
    if (safeReports.length === 0) {
      return {
        score: 10,
        level: 'optimal',
        label: 'Low Risk',
        color: 'teal',
        summary: 'All health parameters are within normal range. No active critical risk parameters found.',
        flags: [],
        factors: [],
        breakdown: {
          adherence: adherence?.percent ?? 100,
          lab: 0,
          vitals: 5,
        },
      }
    }

    const latest = safeReports[0]
    const flags = latest?.flags?.length ? latest.flags : []

    return computeRisk({
      vitals: {
        bpSystolic: 120,
        bpDiastolic: 80,
        heartRate: 72,
        glucose: 95,
        spo2: 99,
        bmi: 22.5,
      },
      reports: [{ ...latest, flags }],
      adherence: { percent: adherence?.percent ?? 100 },
    })
  }, [reports, adherence?.percent])

  const isOwnAppointment = (a) => !a?.patientName || a?.patientName === DEMO_PATIENT

  const safeTime = (item) => String(item?.timeSlot || item?.time || '')
  const safeDate = (item) => String(item?.date || '')

  const upcomingAppointments = useMemo(
    () =>
      (Array.isArray(appointments) ? appointments : [])
        .filter((a) => isOwnAppointment(a) && ['upcoming', 'pending', 'confirmed'].includes(String(a?.status || '').toLowerCase()))
        .sort((a, b) => {
          const dateA = safeDate(a)
          const dateB = safeDate(b)
          if (dateA === dateB) {
            return safeTime(a).localeCompare(safeTime(b))
          }
          return dateA.localeCompare(dateB)
        }),
    [appointments]
  )

  const patientAppointments = useMemo(
    () =>
      (Array.isArray(appointments) ? appointments : [])
        .filter(isOwnAppointment)
        .sort((a, b) => {
          const dateA = safeDate(a)
          const dateB = safeDate(b)
          if (dateA === dateB) {
            return safeTime(a).localeCompare(safeTime(b))
          }
          return dateB.localeCompare(dateA)
        }),
    [appointments]
  )

  const newAlertCount = useMemo(() => (Array.isArray(alerts) ? alerts.filter((a) => a?.status === 'new').length : 0), [alerts])

  const value = useMemo(
    () => ({
      appointments,
      patientAppointments,
      upcomingAppointments,
      medications,
      reports,
      alerts,
      savedSlots,
      schedule,
      loading,
      updateSchedule,
      getDoctorAvailability,
      adherence,
      patientRisk,
      newAlertCount,
      doctorPatients,
      toast,
      dismissToast,
      toasts,
      addAppointment,
      updateAppointment,
      cancelAppointment,
      toggleDose,
      addReport,
      deleteReport,
      setAlertStatus,
      refetchData: fetchAllBackendData,
    }),
    [
      appointments,
      patientAppointments,
      upcomingAppointments,
      medications,
      reports,
      alerts,
      savedSlots,
      schedule,
      loading,
      updateSchedule,
      getDoctorAvailability,
      adherence,
      patientRisk,
      newAlertCount,
      doctorPatients,
      toast,
      dismissToast,
      toasts,
      addAppointment,
      updateAppointment,
      cancelAppointment,
      toggleDose,
      addReport,
      deleteReport,
      setAlertStatus,
      fetchAllBackendData,
    ]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
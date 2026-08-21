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
  
  // States with Fallback to LocalStorage or Seed Data
  const [appointments, setAppointments] = useState(stored?.appointments ?? seedAppointments)
  const [medications, setMedications] = useState(stored?.medications ?? seedMeds)
  const [reports, setReports] = useState(stored?.reports ?? seedReports)
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
    setSavedSlots((s) => [...s, { date: appt.date, time: appt.time }])

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
    setAppointments((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)))

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
      const appt = list.find((a) => a.id === id)
      if (appt) {
        setSavedSlots((s) => s.filter((x) => !(x.date === appt.date && x.time === appt.time)))
      }
      return list.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
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
        m.id === medId
          ? { ...m, doses: m.doses.map((d) => (d.id === doseId ? { ...d, taken: value } : d)) }
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

  /* --------------------------------------------------------- alerts */
  const setAlertStatus = useCallback(async (id, status) => {
    setAlerts((list) => list.map((a) => (a.id === id ? { ...a, status } : a)))

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
  const adherence = useMemo(() => computeAdherence(medications), [medications])

  const patientRisk = useMemo(() => {
    const latest = reports[0]
    const flags = latest?.flags?.length
      ? latest.flags
      : reports.length
        ? [
            {
              name: 'LDL Cholesterol',
              value: 138,
              flag: 'high',
              range: '0 – 100 mg/dL',
              unit: 'mg/dL',
            },
          ]
        : []
    return computeRisk({
      vitals: {
        bpSystolic: 129,
        bpDiastolic: 83,
        heartRate: 76,
        glucose: 105,
        spo2: 98,
        bmi: 26.3,
      },
      reports: reports.length ? [{ ...reports[0], flags }] : [],
      adherence: { percent: adherence.percent },
    })
  }, [reports, adherence.percent])

  const isOwnAppointment = (a) => !a.patientName || a.patientName === DEMO_PATIENT

  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter((a) => isOwnAppointment(a) && ['upcoming', 'pending'].includes(a.status))
        .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date))),
    [appointments]
  )

  const patientAppointments = useMemo(
    () =>
      appointments
        .filter(isOwnAppointment)
        .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : b.date.localeCompare(a.date))),
    [appointments]
  )

  const newAlertCount = useMemo(() => alerts.filter((a) => a.status === 'new').length, [alerts])

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
import { Route, Routes, Navigate } from 'react-router-dom'
import { RequireAuth, RedirectIfAuthed } from './components/Guards'
import Toasts from './components/Toasts'

import Landing from './pages/Landing/Landing'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'

import { PatientLayout, DoctorLayout } from './components/layout/PortalLayouts'

import PatientDashboard from './pages/patient/Dashboard'
import DoctorsPage from './pages/patient/Doctors'
import BookingPage from './pages/patient/Booking'
import PatientAppointments from './pages/patient/Appointments'
import ReportsPage from './pages/patient/Reports'
import MedicationsPage from './pages/patient/Medications'
import InsightsPage from './pages/patient/Insights'

import DoctorDashboard from './pages/doctor/Dashboard'
import SchedulePage from './pages/doctor/Schedule'
import DoctorAppointments from './pages/doctor/Appointments'
import PatientsPage from './pages/doctor/Patients'
import DoctorAdherence from './pages/doctor/Adherence'
import RiskAlertsPage from './pages/doctor/RiskAlerts'

import NotFound from './pages/NotFound'

export default function App() {
  return (
    <>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <RedirectIfAuthed>
              <Login />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuthed>
              <Register />
            </RedirectIfAuthed>
          }
        />

        {/* Patient Portal */}
        <Route
          path="/patient"
          element={
            <RequireAuth>
              <PatientLayout />
            </RequireAuth>
          }
        >
          <Route index element={<PatientDashboard />} />
          <Route path="doctors" element={<DoctorsPage />} />
          <Route path="doctors/:id/book" element={<BookingPage />} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="medications" element={<MedicationsPage />} />
          <Route path="insights" element={<InsightsPage />} />
        </Route>

        {/* Doctor Portal */}
        <Route
          path="/doctor"
          element={
            <RequireAuth>
              <DoctorLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DoctorDashboard />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="adherence" element={<DoctorAdherence />} />
          <Route path="risk-alerts" element={<RiskAlertsPage />} />
        </Route>

        {/* Redirects & 404 */}
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Notifications */}
      <Toasts />
    </>
  )
}
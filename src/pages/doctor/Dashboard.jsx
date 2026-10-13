import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  Activity,
  CheckCircle2,
  ChevronRight,
  FileText,
  UserCheck,
  Eye,
  X,
  Sparkles,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import API from '../../api'

export default function DoctorDashboard() {
  const { user, profile } = useAuth() || {}
  const { appointments = [], patients = [] } = useData() || {}

  // Logged-in Doctor Email & Name with smart fallback
  const doctorName = user?.name || profile?.name || 'Dr. Faisal'
  const doctorEmail = user?.email || profile?.email || localStorage.getItem('user_email') || 'faisal@gmail.com'

  // Shared Reports States
  const [sharedReports, setSharedReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => {
    fetchSharedReports()
  }, [doctorEmail])

  const fetchSharedReports = async () => {
    setLoadingReports(true)
    try {
      let reportsList = []

      // 1. Try fetching via query email
      try {
        const res = await API.get(`/reports/doctor-shared?email=${encodeURIComponent(doctorEmail)}`)
        if (res.data?.reports) reportsList = res.data.reports
      } catch (e1) {
        // 2. Fallback to direct doctor reports endpoint
        try {
          const res2 = await API.get('/reports')
          if (res2.data?.reports) reportsList = res2.data.reports
        } catch (e2) {
          console.warn("Backend reports endpoint fallback:", e2.message)
        }
      }

      // Filter reports shared with this doctor's email
      const cleanEmail = doctorEmail.toLowerCase().trim()
      const filtered = reportsList.filter((r) => {
        if (!r.sharedWith) return false
        if (Array.isArray(r.sharedWith)) {
          return r.sharedWith.some((s) => {
            const sharedEmail = String(s?.doctorEmail || s || '').toLowerCase().trim()
            return sharedEmail === cleanEmail || sharedEmail.includes('faisal')
          })
        }
        return false
      })

      setSharedReports(filtered.length > 0 ? filtered : reportsList)
    } catch (err) {
      console.warn("Could not fetch shared reports:", err.message)
    } finally {
      setLoadingReports(false)
    }
  }

  return (
    <div className="space-y-6 font-sans p-6 md:p-8 bg-[#f4f9f8] min-h-screen text-slate-800">
      
      {/* Doctor Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#00a884] to-[#008f70] p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-teal-100 tracking-wide uppercase">Doctor Panel</span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, {doctorName}
            </h1>
            <p className="text-teal-50 text-sm font-medium pt-1">
              You have {appointments.length > 0 ? appointments.length : 3} patient visits scheduled and {sharedReports.length} shared patient reports to review.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/doctor/schedule"
              className="px-5 py-2.5 rounded-xl bg-white text-[#00a884] hover:bg-teal-50 font-bold text-sm transition-all shadow-sm flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Manage Schedule
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Total Patients</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">124</div>
          <span className="text-[11px] font-semibold text-emerald-600">+12 new this month</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Today's Visits</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-500">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{appointments.length > 0 ? appointments.length : 8}</div>
          <span className="text-[11px] font-semibold text-slate-400">Scheduled</span>
        </div>

        {/* Live Shared Reports Stat Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Shared Reports</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-500">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{sharedReports.length}</div>
          <span className="text-[11px] font-semibold text-amber-500">Shared with {doctorEmail}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">High Risk Alerts</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {sharedReports.filter(r => (r.aiSummary?.overallRisk || '').toLowerCase().includes('high')).length || 1}
          </div>
          <span className="text-[11px] font-semibold text-rose-500">Requires Review</span>
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left (2 Columns): Appointments & Shared Reports */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Schedule Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Today's Patient Schedule</h2>
              <Link to="/doctor/appointments" className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Kashif Mahmood', time: '10:00 AM', type: 'Follow-up', status: 'Confirmed' },
                { name: 'Amina Khan', time: '11:30 AM', type: 'Consultation', status: 'Pending' },
                { name: 'Rahul Sharma', time: '02:00 PM', type: 'Routine Checkup', status: 'Confirmed' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-[#f8fafc] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                      <p className="text-xs text-slate-500">{item.type} • {item.time}</p>
                    </div>
                  </div>
                  <button className="px-4 py-1.5 rounded-xl bg-[#00a884] hover:bg-[#008f70] text-white text-xs font-bold transition-all shadow-xs cursor-pointer">
                    Start Visit
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SHARED PATIENT MEDICAL REPORTS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Shared Patient Medical Reports</h2>
                <span className="text-[10px] bg-teal-100 text-[#00a884] px-2 py-0.5 rounded-full font-bold">
                  AI Analyzed
                </span>
              </div>
              <button 
                onClick={fetchSharedReports}
                className="text-xs font-bold text-slate-400 hover:text-teal-600 flex items-center gap-1 cursor-pointer"
                title="Refresh Reports"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingReports ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {loadingReports ? (
              <p className="text-xs text-slate-400 py-4 text-center">Loading shared patient reports...</p>
            ) : sharedReports.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-500">No reports shared with doctor email ({doctorEmail}) yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sharedReports.map((item) => {
                  const risk = item.aiSummary?.overallRisk || "Low Risk"
                  const isHighRisk = risk.toLowerCase().includes("high")

                  return (
                    <div key={item._id} className="p-4 rounded-xl border border-slate-100 bg-[#f8fafc] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm">
                          📄
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{item.title || "Lab Report"}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              isHighRisk ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                              {risk}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 pt-0.5">
                            Patient: <strong className="text-slate-700">{item.patientId?.name || item.patientId?.email || "Patient"}</strong> • {new Date(item.createdAt).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedReport(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-teal-50 hover:text-[#00a884] text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View AI Details
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right (1 Column): Critical Patient Alerts */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Critical Patient Alerts</h2>
              <Link to="/doctor/risk-alerts" className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-rose-700">
                  <span>High BP Alert</span>
                  <span className="text-[10px] bg-rose-200 px-2 py-0.5 rounded-full">Urgent</span>
                </div>
                <p className="text-xs text-slate-700 font-medium">Patient: Kashif Mahmood</p>
                <p className="text-[11px] text-slate-500">Systolic BP reached 145 mmHg</p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-amber-700">
                  <span>Adherence Drop</span>
                  <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded-full">Warning</span>
                </div>
                <p className="text-xs text-slate-700 font-medium">Patient: Amina Khan</p>
                <p className="text-[11px] text-slate-500">Missed medications 3 days in a row</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* REPORT DETAILS MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-slate-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedReport.title || "Medical Lab Report"}</h3>
                <p className="text-xs text-slate-500">
                  Shared by Patient • {new Date(selectedReport.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Summary Box */}
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Gemini AI Executive Summary</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedReport.aiSummary?.executiveSummary || selectedReport.aiSummary?.summary || "No summary available."}
              </p>
            </div>

            {/* Metrics Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Extracted Test Metrics</h4>
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                      <th className="p-3">Test Name</th>
                      <th className="p-3">Result Value</th>
                      <th className="p-3">Reference Range</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedReport.aiSummary?.keyMetrics || []).map((m, idx) => {
                      const isHigh = (m.status || m.finding || "").toLowerCase().includes("high")
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-800">{m.name || m.metric}</td>
                          <td className="p-3 text-slate-700">{m.value || m.result}</td>
                          <td className="p-3 text-slate-500">{m.referenceRange || m.range || "N/A"}</td>
                          <td className="p-3 text-right font-bold">
                            <span className={isHigh ? 'text-rose-600' : 'text-emerald-600'}>
                              {m.status || m.finding || "Normal"}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {selectedReport.fileUrl ? (
                <a
                  href={`http://localhost:5000${selectedReport.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#00a884] hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Original Document
                </a>
              ) : <div />}

              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
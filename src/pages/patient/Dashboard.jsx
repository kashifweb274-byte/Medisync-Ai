import { Link } from 'react-router-dom'
import {
  Heart,
  Activity,
  Calendar,
  Pill,
  TrendingUp,
  Plus,
  ChevronRight,
  ShieldAlert,
  Clock,
  Video
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'

export default function PatientDashboard() {
  const { profile } = useAuth()
  const { appointments = [], vitals = {} } = useData()

  // Exact Time-based Greeting Logic
  const hour = new Date().getHours()
  const greeting =
    hour >= 5 && hour < 12
      ? 'Good morning'
      : hour >= 12 && hour < 17
      ? 'Good afternoon'
      : hour >= 17 && hour < 22
      ? 'Good evening'
      : 'Good night'

  const firstName = profile?.name?.split(' ')[0] || 'Kashif Mahmood'

  return (
    <div className="space-y-8 font-sans p-6 md:p-8 bg-slate-50/50 min-h-screen">
      
      {/* Top Banner / Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 shadow-xl shadow-slate-900/10">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Risk Level: Low Risk
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white !text-white">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-slate-200 !text-slate-200 text-sm leading-relaxed">
              Your vitals are tracking stable today. You have no active risk signals — keep up the great routine.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/patient/find-doctors"
              className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" /> Book Appointment
            </Link>
          </div>
        </div>
      </div>

      {/* Vitals Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Systolic BP */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Systolic BP</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">129 <span className="text-xs font-normal text-slate-500">mmHg</span></div>
            <span className="text-xs font-semibold text-emerald-600">↓ 3 mmHg lower</span>
          </div>
        </div>

        {/* Fasting Glucose */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Fasting Glucose</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">105 <span className="text-xs font-normal text-slate-500">mg/dL</span></div>
            <span className="text-xs font-semibold text-emerald-600">↓ 6 mg/dL lower</span>
          </div>
        </div>

        {/* Heart Rate */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Heart Rate</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">76 <span className="text-xs font-normal text-slate-500">bpm</span></div>
            <span className="text-xs font-semibold text-slate-500">Within normal</span>
          </div>
        </div>

        {/* Medication Adherence */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Medication Adherence</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">0%</div>
            <span className="text-xs font-semibold text-amber-600">0 day streak</span>
          </div>
        </div>

      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Section: Appointments & Trends */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Upcoming Appointments */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Upcoming Appointments</h2>
              <Link to="/patient/appointments" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 text-white rounded-xl p-3 text-center min-w-[60px]">
                  <span className="block text-[10px] font-bold tracking-widest uppercase text-slate-400">AUG</span>
                  <span className="block text-xl font-bold">15</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">Follow-up appointment</h4>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold">Upcoming</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Dr. Sara Iyer • General Physician</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Sat Aug 15 - 9:00 AM • <Video className="w-3 h-3 text-teal-600" /> Video Call
                  </p>
                </div>
              </div>

              <button className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all self-start sm:self-center">
                Reschedule
              </button>
            </div>
          </div>

          {/* Systolic BP Trend Placeholder */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Systolic BP Trend</h2>
                <p className="text-xs text-slate-500">Weekly average variation</p>
              </div>
              <span className="text-xs font-semibold text-slate-400 border border-slate-200 rounded-lg px-2.5 py-1">Last 4 weeks</span>
            </div>
            <div className="h-32 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
              [ BP Chart Component ]
            </div>
          </div>

        </div>

        {/* Right Section: Health Snapshot */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Health Snapshot</h2>
              <Link to="/patient/insights" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                All insights <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Score Ring */}
            <div className="p-4 rounded-xl bg-slate-50/80 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-4 border-teal-500 flex items-center justify-center font-bold text-lg text-slate-900 bg-white shadow-xs">
                15
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">AI Risk Score</h4>
                <p className="text-[11px] text-slate-500">Composite of vitals & adherence</p>
              </div>
            </div>

            {/* Insights List */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs font-medium text-amber-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                Medication adherence below target
              </div>
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs font-medium text-amber-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                Fasting glucose elevated
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
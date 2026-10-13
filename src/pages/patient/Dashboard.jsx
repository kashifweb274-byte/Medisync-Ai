import { Link } from 'react-router-dom'
import {
  Heart,
  Activity,
  Pill,
  TrendingUp,
  Plus,
  ChevronRight,
  Clock,
  Video,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'

export default function PatientDashboard() {
  const { profile } = useAuth()
  const { appointments = [], vitals = {} } = useData() || {}

  const firstName = profile?.name || 'Kashif Mahmood'

  return (
    <div className="space-y-6 font-sans p-6 md:p-8 bg-[#f4f9f8] min-h-screen text-slate-800">
      
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#d9f5ed] via-[#e5f7f2] to-[#d4f1e8] p-8 border border-teal-100 shadow-xs">
        <div className="absolute right-32 top-1/2 -translate-y-1/2 w-80 h-44 pointer-events-none hidden md:block opacity-85">
          <img
            src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=600&q=80"
            alt="Stethoscope"
            className="w-full h-full object-cover rounded-2xl mix-blend-multiply opacity-75 contrast-125"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <span className="text-xs font-semibold text-teal-700 tracking-wide">Welcome back,</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {firstName}
            </h1>
            <p className="text-teal-800/80 text-sm font-medium pt-1">
              Track. Analyze. Stay healthy.
            </p>
          </div>

          <div className="flex items-center gap-3 z-10">
            <Link
              to="/patient/find-doctors"
              className="px-5 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#008f70] text-white font-bold text-sm transition-all shadow-md shadow-teal-600/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Book Appointment
            </Link>
          </div>
        </div>
      </div>

      {/* Vitals Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-[#e3f6f1] border border-teal-100/80 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">VITALS</span>
            <h3 className="text-base font-extrabold text-teal-950 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> All good
            </h3>
          </div>
          <div className="pt-2">
            <svg className="w-16 h-8 text-teal-500/70" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M0 20 L30 20 L38 5 L46 35 L54 15 L62 25 L70 20 L100 20" />
            </svg>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">SYSTOLIC BP</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-500">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">129 <span className="text-xs font-normal text-slate-400">mmHg</span></div>
            <span className="text-[11px] font-semibold text-emerald-600">↓ 3 mmHg lower</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">FASTING GLUCOSE</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">105 <span className="text-xs font-normal text-slate-400">mg/dL</span></div>
            <span className="text-[11px] font-semibold text-emerald-600">↓ 6 mg/dL lower</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">HEART RATE</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-500">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">76 <span className="text-xs font-normal text-slate-400">bpm</span></div>
            <span className="text-[11px] font-semibold text-slate-400">Within normal</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">MEDICATION ADHERENCE</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-500">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">0%</div>
            <span className="text-[11px] font-semibold text-amber-500">0 day streak</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Upcoming Appointment</h2>
              <Link to="/patient/appointments" className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-[#f8fafc] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-[#00a884] text-white rounded-xl p-3 text-center min-w-[56px] shadow-2xs">
                  <span className="block text-[10px] font-bold tracking-widest uppercase text-teal-100">AUG</span>
                  <span className="block text-lg font-extrabold">15</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">Follow-up appointment</h4>
                  <p className="text-xs text-slate-500 font-medium">Dr. Sara Iyer • General Physician</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Sat Aug 15 - 09:00 AM • <Video className="w-3.5 h-3.5 text-teal-600" /> Video Call
                  </p>
                </div>
              </div>

              <button className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-2xs self-start sm:self-center">
                Reschedule
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Health Trends</h2>
                <p className="text-[11px] text-slate-400">Systolic BP (Last 4 weeks)</p>
              </div>
              <Link to="/patient/reports" className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                View full report <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="h-32 bg-[#f8fafc] rounded-xl border border-slate-100 p-4 flex items-end justify-between">
              <svg className="w-full h-full text-teal-500" viewBox="0 0 400 100" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M0 60 Q 50 40, 100 65 T 200 30 T 300 50 T 400 40" />
                <circle cx="100" cy="65" r="4" fill="#00a884" />
                <circle cx="200" cy="30" r="4" fill="#00a884" />
                <circle cx="300" cy="50" r="4" fill="#00a884" />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h2 className="text-sm font-bold text-slate-900">AI Risk Score</h2>
              <Link to="/patient/insights" className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                View insights <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-[#f8fafc] flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-4 border-[#00a884] flex items-center justify-center font-extrabold text-lg text-teal-950 bg-white shadow-2xs shrink-0">
                15
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">AI Risk Score</h4>
                <p className="text-[11px] text-slate-400">Composite of vitals & adherence</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Section - Matched to Image 2 */}
      <div className="pt-10 pb-12 w-full max-w-4xl mx-auto px-10">
        <div className="relative">
          
          {/* Floating Badges */}
          <div className="hidden md:flex absolute left-0 top-[28%] -translate-x-1/2 z-20 px-5 py-2.5 rounded-2xl text-xs md:text-sm font-bold text-white shadow-lg bg-gradient-to-r from-[#6ecab7] to-[#f89b5f] items-center justify-center whitespace-nowrap">
            Human / AI Assistant
          </div>

          <div className="hidden md:flex absolute left-0 bottom-[24%] -translate-x-1/2 z-20 px-5 py-2.5 rounded-2xl text-xs md:text-sm font-bold text-white shadow-lg bg-gradient-to-r from-[#f89b5f] to-[#6ecab7] items-center justify-center whitespace-nowrap">
            Tracking Medication
          </div>

          <div className="hidden md:flex absolute right-0 top-[28%] translate-x-1/2 z-20 px-5 py-2.5 rounded-2xl text-xs md:text-sm font-bold text-white shadow-lg bg-gradient-to-r from-[#f89b5f] to-[#6ecab7] items-center justify-center whitespace-nowrap">
            Health Score
          </div>

          <div className="hidden md:flex absolute right-0 bottom-[24%] translate-x-1/2 z-20 px-5 py-2.5 rounded-2xl text-xs md:text-sm font-bold text-white shadow-lg bg-gradient-to-r from-[#6ecab7] to-[#59c3ae] items-center justify-center whitespace-nowrap">
            Achieving health goals
          </div>

          {/* 16:9 Video Box */}
          <div className="w-full border-[6px] border-[#f38237] rounded-[32px] overflow-hidden shadow-2xl bg-[#0b2b26] aspect-video relative z-10">
            <video
              autoPlay
              muted
              loop
              playsInline
              controls
              className="w-full h-full object-cover"
            >
              <source src="/assets/medisync-demo.mp4" type="video/mp4" />
              <source src="/assets/medisync_ai.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

        </div>
      </div>

    </div>
  )
}
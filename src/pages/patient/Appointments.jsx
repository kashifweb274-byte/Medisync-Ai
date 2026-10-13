import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import VideoCallModal from "./VideoCallModal";
import "./Appointments.css";

const TIME_SLOTS = ["09:30 AM", "11:00 AM", "02:00 PM", "04:30 PM", "06:00 PM"];
const CARD_THEMES = ["theme-green", "theme-blue", "theme-purple", "theme-orange"];

const DEFAULT_MOCK_APPOINTMENTS = [
  {
    _id: "mock_1",
    doctorName: "Dr. Faisal",
    specialty: "General Physician / Cardiologist",
    date: "2026-08-24",
    timeSlot: "08:00 AM",
    mode: "video",
    status: "pending",
    symptoms: "blood pressure",
  },
  {
    _id: "mock_2",
    doctorName: "Dr. Sara Iyer",
    specialty: "General Physician",
    date: "2026-08-19",
    timeSlot: "09:30 AM",
    mode: "video",
    status: "pending",
    symptoms: "routine checkup",
  },
  {
    _id: "mock_3",
    doctorName: "Dr. Aisha Khan",
    specialty: "Pediatrician",
    date: "2026-08-19",
    timeSlot: "10:00 AM",
    mode: "video",
    status: "pending",
    symptoms: "skin issue",
  },
  {
    _id: "mock_4",
    doctorName: "Dr. Karthik Nair",
    specialty: "Psychiatrist",
    date: "2026-08-19",
    timeSlot: "01:30 PM",
    mode: "video",
    status: "pending",
    symptoms: "stress & anxiety",
  },
];

export default function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("All");

  // Modal States
  const [viewApp, setViewApp] = useState(null);
  const [rescheduleApp, setRescheduleApp] = useState(null);
  const [activeCallApp, setActiveCallApp] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newSlot, setNewSlot] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      // 1. Try patient-specific endpoint first
      let res;
      try {
        res = await API.get("/appointments/patient");
      } catch {
        res = await API.get("/appointments");
      }

      const data = Array.isArray(res.data) ? res.data : res.data.appointments || [];
      
      if (data.length > 0) {
        setAppointments(data);
      } else {
        loadPersistedOrMockData();
      }
    } catch (err) {
      console.warn("Backend fetch failed, loading local/persisted data:", err);
      loadPersistedOrMockData();
    }
  };

  const loadPersistedOrMockData = () => {
    const saved = localStorage.getItem("patient_appointments");
    if (saved) {
      try {
        setAppointments(JSON.parse(saved));
        return;
      } catch (e) {
        console.error("Local storage parse error:", e);
      }
    }
    setAppointments(DEFAULT_MOCK_APPOINTMENTS);
    localStorage.setItem("patient_appointments", JSON.stringify(DEFAULT_MOCK_APPOINTMENTS));
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    // 1. Try updating database via API
    try {
      try {
        await API.put(`/appointments/${id}/cancel`);
      } catch {
        try {
          await API.patch(`/appointments/${id}/cancel`);
        } catch {
          await API.delete(`/appointments/${id}`);
        }
      }
    } catch (err) {
      console.warn("API cancel failed, updating locally:", err);
    }

    // 2. Persist update so page refresh keeps it cancelled
    setAppointments((prev) => {
      const updated = prev.map((app) => 
        (app._id === id || app.id === id) ? { ...app, status: "cancelled" } : app
      );
      localStorage.setItem("patient_appointments", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate || !newSlot) return alert("Please select date and slot");

    setActionLoading(true);
    const targetId = rescheduleApp._id || rescheduleApp.id;

    try {
      await API.patch(`/appointments/${targetId}/reschedule`, {
        date: newDate,
        timeSlot: newSlot,
      });
    } catch (err) {
      console.warn("API reschedule failed, updating locally.");
    }

    setAppointments((prev) => {
      const updated = prev.map((app) =>
        (app._id === targetId || app.id === targetId)
          ? { ...app, date: newDate, timeSlot: newSlot, status: "pending" }
          : app
      );
      localStorage.setItem("patient_appointments", JSON.stringify(updated));
      return updated;
    });

    setActionLoading(false);
    setRescheduleApp(null);
  };

  // Case-insensitive filtering
  const upcomingApps = appointments.filter((app) => {
    const s = String(app.status || "").toLowerCase();
    return s === "pending" || s === "confirmed";
  });

  const historyApps = appointments.filter((app) => {
    const s = String(app.status || "").toLowerCase();
    return s === "completed" || s === "cancelled";
  });

  const displayedList = (activeTab === "upcoming" ? upcomingApps : historyApps).filter((app) => {
    const docName = String(app.doctorName || "").toLowerCase();
    const specialty = String(app.specialty || "").toLowerCase();
    const matchesSearch = docName.includes(searchTerm.toLowerCase()) || specialty.includes(searchTerm.toLowerCase());
    
    if (filterMode === "Video") return matchesSearch && app.mode === "video";
    if (filterMode === "In-Person") return matchesSearch && app.mode !== "video";
    return matchesSearch;
  });

  const formatDateCard = (dateStr) => {
    if (!dateStr) return { month: "AUG", day: "19", dayOfWeek: "Wed" };
    const d = new Date(dateStr);
    const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const day = d.getDate();
    const dayOfWeek = d.toLocaleString("en-US", { weekday: "short" });
    return { month, day, dayOfWeek };
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "Wed, Aug 19, 2026";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="appointments-page-container">
      {/* 1. TOP HEADER SECTION */}
      <div className="app-header-row">
        <div>
          <h1 className="app-page-title">My Appointments</h1>
          <p className="app-page-subtitle">
            Manage your upcoming consultations and view your appointment history.
          </p>
        </div>

        <div className="app-header-right">
          <button
            className="btn-primary-book"
            onClick={() => navigate("/patient/find-doctors")}
          >
            <span className="plus-icon">+</span> Book New Appointment
          </button>

          {/* Notification Bell */}
          <div className="notification-bell-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="bell-badge">3</span>
          </div>

          {/* User Profile Avatar */}
          <div className="user-profile-avatar">PD</div>
        </div>
      </div>

      {/* 2. TOP FEATURE HIGHLIGHT CARDS */}
      <div className="top-feature-cards-grid">
        <div className="feature-card-item">
          <div className="feature-icon-box blue-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div>
            <h4 className="feature-card-title">Easy Scheduling</h4>
            <p className="feature-card-desc">Book appointments in just a few clicks</p>
          </div>
        </div>

        <div className="feature-card-item">
          <div className="feature-icon-box green-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="M9 12l2 2 4-4"></path>
            </svg>
          </div>
          <div>
            <h4 className="feature-card-title">Secure & Private</h4>
            <p className="feature-card-desc">Your health data is always protected</p>
          </div>
        </div>

        <div className="feature-card-item">
          <div className="feature-icon-box orange-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <div>
            <h4 className="feature-card-title">Reminders</h4>
            <p className="feature-card-desc">Get notifications for your appointments</p>
          </div>
        </div>

        <div className="feature-card-item">
          <div className="feature-icon-box purple-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </div>
          <div>
            <h4 className="feature-card-title">Video Consultations</h4>
            <p className="feature-card-desc">Connect with doctors from anywhere</p>
          </div>
        </div>
      </div>

      {/* 3. CONTROLS BAR (Tabs + Search + Filters) */}
      <div className="app-controls-bar">
        {/* Tabs */}
        <div className="app-tabs-group">
          <button
            className={`tab-pill-btn ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming <span className="tab-badge">{upcomingApps.length}</span>
          </button>
          <button
            className={`tab-pill-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            History <span className="tab-badge">{historyApps.length}</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="app-filter-actions">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search doctor or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-field"
            />
            <svg className="search-field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          <select
            className="filter-select-dropdown"
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Video">Video Call</option>
            <option value="In-Person">In Person</option>
          </select>
        </div>
      </div>

      {/* 4. TIMELINE & CARDS LIST */}
      <div className="timeline-wrapper">
        <div className="vertical-timeline-line"></div>

        {displayedList.length > 0 ? (
          displayedList.map((app, index) => {
            const dateBadge = formatDateCard(app.date);
            const themeClass = CARD_THEMES[index % CARD_THEMES.length];
            const apptId = app._id || app.id;
            const initials = app.doctorName
              ? app.doctorName
                  .replace("Dr. ", "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "DR";

            return (
              <div key={apptId} className={`timeline-item ${themeClass}`}>
                <div className="timeline-node-dot"></div>

                <div className="appointment-card-box">
                  {/* Left: Date Badge */}
                  <div className="card-date-badge">
                    <span className="badge-month">{dateBadge.month}</span>
                    <span className="badge-day">{dateBadge.day}</span>
                    <span className="badge-weekday">{dateBadge.dayOfWeek}</span>
                    <div className="badge-time-pill">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {app.timeSlot}
                    </div>
                  </div>

                  {/* Middle: Details */}
                  <div className="card-middle-content">
                    <div className="doc-profile-header">
                      <div className="doc-avatar-circle">{initials}</div>
                      <div>
                        <div className="doc-title-line">
                          <h3 className="doc-name-text">{app.doctorName}</h3>
                          <span className={`status-pill-badge status-${String(app.status).toLowerCase()}`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="doc-specialty-text">{app.specialty}</p>
                      </div>
                    </div>

                    <div className="appointment-meta-row">
                      <span className="meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {formatDisplayDate(app.date)}
                      </span>

                      <span className="meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        {app.timeSlot}
                      </span>

                      <span className="meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="23 7 16 12 23 17 23 7"></polygon>
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                        {app.mode === "video" ? "Video call" : "In-person"}
                      </span>
                    </div>

                    {(app.symptoms || app.reason) && (
                      <p className="appointment-reason-text">
                        <span>Reason:</span> {app.symptoms || app.reason}
                      </p>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="card-right-actions">
                    <div className="card-buttons-stack">
                      {activeTab === "upcoming" && (
                        <>
                          <button
                            className="action-btn join-call-btn"
                            onClick={() => setActiveCallApp(app)}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="23 7 16 12 23 17 23 7"></polygon>
                              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                            </svg>
                            Join Call
                          </button>

                          <button
                            className="action-btn outline-btn"
                            onClick={() => {
                              setRescheduleApp(app);
                              setNewDate(app.date);
                              setNewSlot(app.timeSlot);
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            Reschedule
                          </button>

                          <button
                            className="action-btn outline-btn cancel-btn-action"
                            onClick={() => handleCancel(apptId)}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            Cancel
                          </button>
                        </>
                      )}

                      <button
                        className="action-btn outline-btn"
                        onClick={() => setViewApp(app)}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-appointments-state">
            <p>No {activeTab} appointments found.</p>
          </div>
        )}
      </div>

      {/* 5. MODAL: VIEW DETAILS */}
      {viewApp && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Consultation Details</h2>
            <hr />
            <p><strong>Doctor:</strong> {viewApp.doctorName}</p>
            <p><strong>Specialty:</strong> {viewApp.specialty}</p>
            <p><strong>Date & Time:</strong> {formatDisplayDate(viewApp.date)} at {viewApp.timeSlot}</p>
            <p><strong>Mode:</strong> {viewApp.mode === "video" ? "Online Video Call" : "Hospital Visit"}</p>
            <p><strong>Status:</strong> {viewApp.status}</p>
            <p><strong>Reason:</strong> {viewApp.symptoms || viewApp.reason || "N/A"}</p>
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setViewApp(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: RESCHEDULE */}
      {rescheduleApp && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Reschedule Appointment</h2>
            <p className="reschedule-doc-sub">Doctor: {rescheduleApp.doctorName}</p>
            <form onSubmit={handleRescheduleSubmit}>
              <label>Select New Date</label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />

              <label>Select Time Slot</label>
              <div className="slot-grid">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`slot-chip ${newSlot === slot ? "active" : ""}`}
                    onClick={() => setNewSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setRescheduleApp(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>
                  {actionLoading ? "Updating..." : "Confirm Reschedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: VIDEO CALL */}
      {activeCallApp && (
        <VideoCallModal
          doctorName={activeCallApp.doctorName}
          doctorSpecialty={activeCallApp.specialty}
          onClose={() => setActiveCallApp(null)}
        />
      )}
    </div>
  );
}
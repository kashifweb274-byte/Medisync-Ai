import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import VideoCallModal from "./VideoCallModal";
import "./Appointments.css";

const TIME_SLOTS = ["09:30 AM", "11:00 AM", "02:00 PM", "04:30 PM", "06:00 PM"];

export default function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [viewApp, setViewApp] = useState(null);
  const [rescheduleApp, setRescheduleApp] = useState(null);
  const [activeCallApp, setActiveCallApp] = useState(null); // Video call state
  const [newDate, setNewDate] = useState("");
  const [newSlot, setNewSlot] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments");
      const data = Array.isArray(res.data) ? res.data : res.data.appointments || [];
      setAppointments(data);
    } catch (err) {
      console.warn("Using fallback appointments data.");
      setAppointments([
        {
          _id: "1",
          doctorName: "Dr. Faisal",
          specialty: "General Physician / Cardiologist",
          date: "2026-08-24",
          timeSlot: "08:00 AM",
          mode: "video",
          status: "pending",
          symptoms: "blood pressure",
        },
        {
          _id: "2",
          doctorName: "Dr. Sara Iyer",
          specialty: "General Physician",
          date: "2026-08-19",
          timeSlot: "09:30 AM",
          mode: "video",
          status: "pending",
          symptoms: "routine checkup",
        },
        {
          _id: "3",
          doctorName: "Dr. Aisha Khan",
          specialty: "Pediatrician",
          date: "2026-08-19",
          timeSlot: "10:00 AM",
          mode: "video",
          status: "pending",
          symptoms: "skin issue",
        },
        {
          _id: "4",
          doctorName: "Dr. Karthik Nair",
          specialty: "Psychiatrist",
          date: "2026-08-19",
          timeSlot: "01:30 PM",
          mode: "video",
          status: "pending",
          symptoms: "fever",
        },
      ]);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await API.patch(`/appointments/${id}/cancel`);
    } catch (err) {
      console.warn("API cancel failed, updating locally.");
    }
    setAppointments((prev) =>
      prev.map((app) => (app._id === id ? { ...app, status: "cancelled" } : app))
    );
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate || !newSlot) return alert("Please select date and slot");

    setActionLoading(true);
    try {
      await API.patch(`/appointments/${rescheduleApp._id}/reschedule`, {
        date: newDate,
        timeSlot: newSlot,
      });
    } catch (err) {
      console.warn("API reschedule failed, updating locally.");
    }

    setAppointments((prev) =>
      prev.map((app) =>
        app._id === rescheduleApp._id
          ? { ...app, date: newDate, timeSlot: newSlot, status: "pending" }
          : app
      )
    );
    setActionLoading(false);
    setRescheduleApp(null);
  };

  const upcomingApps = appointments.filter(
    (app) => app.status === "pending" || app.status === "confirmed"
  );
  const historyApps = appointments.filter(
    (app) => app.status === "completed" || app.status === "cancelled"
  );

  const displayedList = (activeTab === "upcoming" ? upcomingApps : historyApps).filter(
    (app) =>
      app.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDateCard = (dateStr) => {
    if (!dateStr) return { month: "AUG", day: "19" };
    const d = new Date(dateStr);
    const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const day = d.getDate();
    return { month, day };
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
    <div className="appointments-container">
      <div className="appointments-header">
        <div>
          <h1 className="header-title">My appointments</h1>
          <p className="header-subtitle">
            Manage upcoming consultations and view your appointment history.
          </p>
        </div>
        <button className="btn-book-new" onClick={() => navigate("/patient/doctors")}>
          📅 Book new
        </button>
      </div>

      <div className="appointments-controls">
        <div className="tab-group">
          <button
            className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming <span className="tab-count">{upcomingApps.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            History <span className="tab-count">{historyApps.length}</span>
          </button>
        </div>

        <input
          type="text"
          className="search-appointment-input"
          placeholder="Search doctor or specialty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="appointments-list">
        {displayedList.length > 0 ? (
          displayedList.map((app) => {
            const dateBadge = formatDateCard(app.date);
            const initials = app.doctorName
              ? app.doctorName
                  .replace("Dr. ", "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "DR";

            return (
              <div key={app._id} className="appointment-card">
                <div className="card-left-section">
                  <div className="date-box">
                    <span className="date-month">{dateBadge.month}</span>
                    <span className="date-day">{dateBadge.day}</span>
                  </div>

                  <div className="doctor-info-box">
                    <div className="doctor-title-row">
                      <div className="avatar-circle">{initials}</div>
                      <div>
                        <h3 className="doc-name">{app.doctorName}</h3>
                        <p className="doc-spec">{app.specialty || "General Physician"}</p>
                      </div>
                      <span className={`status-badge status-${app.status}`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="schedule-info">
                      <span>📅 {formatDisplayDate(app.date)} • {app.timeSlot}</span>
                      <span>📹 {app.mode === "video" ? "Video call" : "In-person"}</span>
                    </div>

                    {app.symptoms && (
                      <p className="reason-text">
                        <strong>Reason:</strong> {app.symptoms}
                      </p>
                    )}
                  </div>
                </div>

                <div className="card-actions-group">
                  {activeTab === "upcoming" && (
                    <>
                      <button
                        className="btn-action btn-join"
                        onClick={() => setActiveCallApp(app)}
                      >
                        📹 Join Call
                      </button>
                      <button
                        className="btn-action btn-reschedule"
                        onClick={() => {
                          setRescheduleApp(app);
                          setNewDate(app.date);
                          setNewSlot(app.timeSlot);
                        }}
                      >
                        ✏️ Reschedule
                      </button>
                      <button
                        className="btn-action btn-cancel"
                        onClick={() => handleCancel(app._id)}
                      >
                        ✕ Cancel
                      </button>
                    </>
                  )}

                  <button
                    className="btn-action btn-details"
                    onClick={() => setViewApp(app)}
                  >
                    👁️ Details
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-appointments">
            <p>No {activeTab} appointments found.</p>
          </div>
        )}
      </div>

      {/* View Details Modal */}
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
            <p><strong>Reason / Symptoms:</strong> {viewApp.symptoms || "N/A"}</p>
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={() => setViewApp(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleApp && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Reschedule Appointment</h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
              Doctor: {rescheduleApp.doctorName}
            </p>
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

      {/* In-App WhatsApp-Style Video Call Modal */}
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
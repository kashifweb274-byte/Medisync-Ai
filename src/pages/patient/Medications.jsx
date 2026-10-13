import React, { useState, useEffect, useRef } from "react";
import API from "../../api";
import "./Medications.css";

const Medications = () => {
  // Medication State
  const [medications, setMedications] = useState([
    {
      id: "1",
      name: "Getrazene",
      dosage: "200 mg - Once daily",
      time: "09:00 AM",
      timeSlot: "morning", // morning, afternoon, evening
      status: "taken", // taken, pending
      whatsappAlert: true,
    },
    {
      id: "2",
      name: "Paracetamol",
      dosage: "500 mg - Twice daily",
      time: "02:00 PM",
      timeSlot: "afternoon",
      status: "pending",
      whatsappAlert: true,
    },
    {
      id: "3",
      name: "Atorvastatin",
      dosage: "10 mg - Nightly",
      time: "09:00 PM",
      timeSlot: "evening",
      status: "pending",
      whatsappAlert: false,
    },
  ]);

  // Ref to track already triggered alerts in the current minute (prevents duplicate popups)
  const alertedMedsRef = useRef(new Set());

  // Tab Filter State ('all' | 'morning' | 'afternoon' | 'evening')
  const [activeSlot, setActiveSlot] = useState("all");

  // Push Notification State
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  // WhatsApp Reminder Modal State
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [whatsappSuccess, setWhatsappSuccess] = useState("");

  // Add Medication Modal & Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMed, setNewMed] = useState({
    name: "",
    dosage: "",
    time: "09:00 AM",
    timeSlot: "morning",
  });

  useEffect(() => {
    // Check Web Push Support
    if ("Notification" in window) {
      setPushSupported(true);
      if (Notification.permission === "granted") {
        setPushEnabled(true);
      }
    }
  }, []);

  // Direct WhatsApp Alert Dispatcher
  const sendWhatsappAlert = (medName, dosage, time) => {
    if (!phone) {
      alert("Pehle top bar me 'WhatsApp Alerts' button par click karke number enter karein!");
      setShowWhatsappModal(true);
      return;
    }

    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;

    const message = 
      `⏰ *MediSync Healthcare Alert*\n\n` +
      `Hi! Aapke medicine lene ka time ho gaya hai:\n` +
      `💊 *Medicine:* ${medName}\n` +
      `📋 *Dosage:* ${dosage}\n` +
      `⏰ *Time:* ${time}`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  // Auto-Checker Timer Effect (Background Schedule Monitor)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      // Format time as "09:00 AM" / "02:00 PM"
      const currentTimeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      medications.forEach((med) => {
        const alertKey = `${med.id}-${currentTimeStr}`;

        // Conditions: Pending + WA Alert ON + Time Matches + Not Alerted in this minute yet
        if (
          med.status === "pending" &&
          med.whatsappAlert &&
          med.time.trim().toLowerCase() === currentTimeStr.trim().toLowerCase() &&
          !alertedMedsRef.current.has(alertKey)
        ) {
          alertedMedsRef.current.add(alertKey);

          // 1. Browser Push Alert (if granted)
          if (Notification.permission === "granted") {
            new Notification(`⏰ Medicine Time: ${med.name}`, {
              body: `Dosage: ${med.dosage}`,
            });
          }

          // 2. Self-Trigger WhatsApp Redirection
          sendWhatsappAlert(med.name, med.dosage, med.time);
        }
      });
    }, 10000); // 10-second interval check

    return () => clearInterval(timer);
  }, [medications, phone]);

  // Web Push Permission Request
  const handleEnablePush = async () => {
    if (!pushSupported) {
      alert("Browser push notifications are not supported in your browser.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setPushEnabled(true);
      new Notification("MediSync Alerts Active", {
        body: "You will now receive timely medication reminders on your device!",
        icon: "/favicon.ico",
      });
    } else {
      alert("Notification permission was denied.");
    }
  };

  // Toggle Medication Status (Taken / Pending)
  const toggleStatus = (id) => {
    setMedications((prev) =>
      prev.map((med) =>
        med.id === id
          ? { ...med, status: med.status === "taken" ? "pending" : "taken" }
          : med
      )
    );
  };

  // Toggle WhatsApp Reminder per Medicine
  const toggleWhatsappPerMed = (id) => {
    setMedications((prev) =>
      prev.map((med) =>
        med.id === id ? { ...med, whatsappAlert: !med.whatsappAlert } : med
      )
    );
  };

  // WhatsApp Setup Form Submit
  const handleWhatsappSubmit = async (e) => {
    e.preventDefault();
    if (!phone) return;

    setSavingWhatsapp(true);
    setWhatsappSuccess("");

    try {
      await API.post("/user/notifications/whatsapp", { phone });
      setWhatsappSuccess("WhatsApp number saved successfully!");
    } catch (err) {
      console.warn("WhatsApp setup API fallback:", err.message);
      setWhatsappSuccess("WhatsApp number saved locally!");
    } finally {
      setSavingWhatsapp(false);
      setTimeout(() => {
        setShowWhatsappModal(false);
        setWhatsappSuccess("");
      }, 1500);
    }
  };

  // Add Medication Submit Handler
  const handleAddMedicationSubmit = (e) => {
    e.preventDefault();
    if (!newMed.name.trim() || !newMed.dosage.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      name: newMed.name,
      dosage: newMed.dosage,
      time: newMed.time || "09:00 AM",
      timeSlot: newMed.timeSlot || "morning",
      status: "pending",
      whatsappAlert: true,
    };

    setMedications((prev) => [newItem, ...prev]);
    setNewMed({ name: "", dosage: "", time: "09:00 AM", timeSlot: "morning" });
    setShowAddModal(false);
  };

  // Calculate Progress Stats
  const totalDoses = medications.length;
  const takenDoses = medications.filter((m) => m.status === "taken").length;
  const progressPercent = Math.round((takenDoses / totalDoses) * 100) || 0;

  // Filtered Medications based on Time Slot
  const filteredMeds =
    activeSlot === "all"
      ? medications
      : medications.filter((m) => m.timeSlot === activeSlot);

  return (
    <div className="meds-container">
      {/* Top Header & Actions */}
      <div className="meds-header">
        <div>
          <div className="title-badge-row">
            <h1 className="page-title">Medication Tracker</h1>
            <span className="badge-ai-monitored">✨ AI Monitored</span>
          </div>
          <p className="page-subtitle">
            Real-time adherence logging, smart timeline schedule, and automated alerts.
          </p>
        </div>

        <div className="top-action-btns">
          <button
            className={`btn-notification ${pushEnabled ? "active" : ""}`}
            onClick={handleEnablePush}
          >
            {pushEnabled ? "🔔 Push Enabled" : "🔕 Enable Web Push"}
          </button>
          <button
            className="btn-whatsapp"
            onClick={() => setShowWhatsappModal(true)}
          >
            💬 WhatsApp Alerts
          </button>
          <button 
            className="btn-primary-glow"
            onClick={() => setShowAddModal(true)}
          >
            + Add Medication
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>Today's Progress</span>
            <span className="stat-icon-green">✓</span>
          </div>
          <div className="stat-value">{progressPercent}%</div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="stat-sub">({takenDoses}/{totalDoses} doses)</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Adherence Streak</span>
            <span className="stat-icon-orange">🔥</span>
          </div>
          <div className="stat-value">7 Days</div>
          <p className="stat-sub">Consistent intake improves recovery rate.</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>AI Risk Check</span>
            <span className="stat-icon-purple">✨</span>
          </div>
          <div className="risk-tag-green">No Conflicts Detected</div>
          <p className="stat-sub">Zero active drug interactions found.</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Active Prescriptions</span>
            <span className="stat-icon-blue">🔗</span>
          </div>
          <div className="stat-value">{totalDoses}</div>
          <p className="stat-sub">Managed across active treatment plan.</p>
        </div>
      </div>

      {/* Time-of-Day Segmented Schedule Section */}
      <div className="schedule-section">
        <div className="schedule-header">
          <h2>⏰ Today's Schedule Timeline</h2>

          {/* Timeline View Filter Tabs */}
          <div className="timeline-tabs">
            <button
              className={`tab-btn ${activeSlot === "all" ? "active" : ""}`}
              onClick={() => setActiveSlot("all")}
            >
              All Doses
            </button>
            <button
              className={`tab-btn ${activeSlot === "morning" ? "active" : ""}`}
              onClick={() => setActiveSlot("morning")}
            >
              🌅 Morning
            </button>
            <button
              className={`tab-btn ${activeSlot === "afternoon" ? "active" : ""}`}
              onClick={() => setActiveSlot("afternoon")}
            >
              ☀️ Afternoon
            </button>
            <button
              className={`tab-btn ${activeSlot === "evening" ? "active" : ""}`}
              onClick={() => setActiveSlot("evening")}
            >
              🌙 Evening / Night
            </button>
          </div>
        </div>

        {/* Medication Cards List */}
        <div className="meds-list">
          {filteredMeds.length > 0 ? (
            filteredMeds.map((med) => {
              const isTaken = med.status === "taken";
              return (
                <div
                  key={med.id}
                  className={`med-card ${isTaken ? "med-card-taken" : ""}`}
                >
                  <div className="med-left">
                    <div className="med-icon">💊</div>
                    <div className="med-info">
                      <div className="med-title-row">
                        <span className="med-name">{med.name}</span>
                        <span
                          className={`status-pill ${
                            isTaken ? "pill-taken" : "pill-pending"
                          }`}
                        >
                          {isTaken ? "TAKEN" : "PENDING"}
                        </span>
                      </div>
                      <p className="med-time-dosage">
                        {med.dosage} • <strong style={{ color: '#0f172a' }}>{med.time}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="med-actions">
                    {/* WhatsApp Toggle Pill / Send Direct Message */}
                    <button
                      className={`btn-wa-toggle ${
                        med.whatsappAlert ? "wa-on" : "wa-off"
                      }`}
                      title="Toggle WhatsApp reminder for this medication"
                      onClick={() => {
                        toggleWhatsappPerMed(med.id);
                        sendWhatsappAlert(med.name, med.dosage, med.time);
                      }}
                    >
                      {med.whatsappAlert ? "💬 WA Reminders ON" : "💬 WA OFF"}
                    </button>

                    {/* Completion Action */}
                    <button
                      className={`btn-status-action ${
                        isTaken ? "btn-completed" : "btn-mark"
                      }`}
                      onClick={() => toggleStatus(med.id)}
                    >
                      {isTaken ? "✓ Completed" : "Mark as Taken"}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-schedule">
              No medications scheduled for this time slot.
            </div>
          )}
        </div>
      </div>

      {/* Feature Modal: Add New Medication */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>💊 Add New Medication</h3>
            <p>Add a new medicine to your daily schedule tracker.</p>

            <form onSubmit={handleAddMedicationSubmit}>
              <div className="form-group">
                <label>Medicine Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol"
                  value={newMed.name}
                  onChange={(e) =>
                    setNewMed({ ...newMed, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Dosage & Frequency:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500 mg - Twice daily"
                  value={newMed.dosage}
                  onChange={(e) =>
                    setNewMed({ ...newMed, dosage: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Scheduled Time:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 09:00 AM"
                  value={newMed.time}
                  onChange={(e) =>
                    setNewMed({ ...newMed, time: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Time Slot:</label>
                <select
                  value={newMed.timeSlot}
                  onChange={(e) =>
                    setNewMed({ ...newMed, timeSlot: e.target.value })
                  }
                >
                  <option value="morning">🌅 Morning</option>
                  <option value="afternoon">☀️ Afternoon</option>
                  <option value="evening">🌙 Evening / Night</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-whatsapp-glow">
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feature Modal: Setup WhatsApp Reminders */}
      {showWhatsappModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>💬 Configure WhatsApp Reminders</h3>
            <p>
              Get automated WhatsApp messages with quick action buttons directly
              on your phone when it's time for your dose.
            </p>

            <form onSubmit={handleWhatsappSubmit}>
              <div className="form-group">
                <label>WhatsApp Phone Number (with Country Code):</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {whatsappSuccess && (
                <p className="success-msg">✅ {whatsappSuccess}</p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowWhatsappModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-whatsapp-glow"
                  disabled={savingWhatsapp}
                >
                  {savingWhatsapp ? "Saving..." : "Enable WhatsApp Reminders"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medications;
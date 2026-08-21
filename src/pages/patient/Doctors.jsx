import React, { useState, useEffect } from "react";
import API from "../../api";
import "./Doctors.css";

// 15 Major Departments list
const SPECIALTIES = [
  "All",
  "General Physician",
  "Cardiologist",
  "Pediatrician",
  "Orthopedic Surgeon",
  "Psychiatrist",
  "Dermatologist",
  "Neurologist",
  "Pulmonologist",
  "Gynecologist",
  "ENT Specialist",
  "Ophthalmologist",
  "Gastroenterologist",
  "Urologist",
  "Endocrinologist",
  "Oncologist",
];

// Mock Doctors Data: Exactly 2 Doctors (1 Male, 1 Female) for every department
const MOCK_DOCTORS = [
  // General Physician
  {
    _id: "doc_gp_m",
    name: "Dr. Rajesh Sharma",
    gender: "Male",
    specialization: "General Physician",
    experienceYears: 10,
    fee: 500,
    rating: "4.8",
    availability: "Mon - Sat",
  },
  {
    _id: "doc_gp_f",
    name: "Dr. Sara Iyer",
    gender: "Female",
    specialization: "General Physician",
    experienceYears: 8,
    fee: 500,
    rating: "4.9",
    availability: "Mon - Sat",
  },

  // Cardiologist
  {
    _id: "doc_cardio_m",
    name: "Dr. Vikram Rao",
    gender: "Male",
    specialization: "Cardiologist",
    experienceYears: 14,
    fee: 1000,
    rating: "4.9",
    availability: "Mon, Wed, Fri",
  },
  {
    _id: "doc_cardio_f",
    name: "Dr. Priya Sharma",
    gender: "Female",
    specialization: "Cardiologist",
    experienceYears: 11,
    fee: 1000,
    rating: "4.8",
    availability: "Tue, Thu, Sat",
  },

  // Pediatrician
  {
    _id: "doc_pedia_m",
    name: "Dr. Amit Patel",
    gender: "Male",
    specialization: "Pediatrician",
    experienceYears: 9,
    fee: 600,
    rating: "4.7",
    availability: "Mon - Sat",
  },
  {
    _id: "doc_pedia_f",
    name: "Dr. Aisha Khan",
    gender: "Female",
    specialization: "Pediatrician",
    experienceYears: 7,
    fee: 600,
    rating: "4.9",
    availability: "Mon - Fri",
  },

  // Orthopedic Surgeon
  {
    _id: "doc_ortho_m",
    name: "Dr. Rohan Desai",
    gender: "Male",
    specialization: "Orthopedic Surgeon",
    experienceYears: 15,
    fee: 1100,
    rating: "4.9",
    availability: "Mon, Thu, Sat",
  },
  {
    _id: "doc_ortho_f",
    name: "Dr. Sneha Kulkarni",
    gender: "Female",
    specialization: "Orthopedic Surgeon",
    experienceYears: 12,
    fee: 1100,
    rating: "4.8",
    availability: "Tue, Wed, Fri",
  },

  // Psychiatrist
  {
    _id: "doc_psych_m",
    name: "Dr. Karthik Nair",
    gender: "Male",
    specialization: "Psychiatrist",
    experienceYears: 11,
    fee: 800,
    rating: "4.8",
    availability: "Mon - Fri",
  },
  {
    _id: "doc_psych_f",
    name: "Dr. Meera Sen",
    gender: "Female",
    specialization: "Psychiatrist",
    experienceYears: 9,
    fee: 800,
    rating: "4.9",
    availability: "Tue, Thu, Sat",
  },

  // Dermatologist
  {
    _id: "doc_derma_m",
    name: "Dr. Devansh Saxena",
    gender: "Male",
    specialization: "Dermatologist",
    experienceYears: 8,
    fee: 700,
    rating: "4.7",
    availability: "Mon - Sat",
  },
  {
    _id: "doc_derma_f",
    name: "Dr. Nandini Kulkarni",
    gender: "Female",
    specialization: "Dermatologist",
    experienceYears: 10,
    fee: 700,
    rating: "4.9",
    availability: "Mon - Fri",
  },

  // Neurologist
  {
    _id: "doc_neuro_m",
    name: "Dr. Suresh Gupta",
    gender: "Male",
    specialization: "Neurologist",
    experienceYears: 16,
    fee: 1200,
    rating: "4.9",
    availability: "Mon, Wed, Sat",
  },
  {
    _id: "doc_neuro_f",
    name: "Dr. Kavita Reddy",
    gender: "Female",
    specialization: "Neurologist",
    experienceYears: 13,
    fee: 1200,
    rating: "4.8",
    availability: "Tue, Thu, Fri",
  },

  // Pulmonologist
  {
    _id: "doc_pulmo_m",
    name: "Dr. Vikrant Mehta",
    gender: "Male",
    specialization: "Pulmonologist",
    experienceYears: 12,
    fee: 900,
    rating: "4.8",
    availability: "Mon, Wed, Fri",
  },
  {
    _id: "doc_pulmo_f",
    name: "Dr. Ritu Kapoor",
    gender: "Female",
    specialization: "Pulmonologist",
    experienceYears: 10,
    fee: 900,
    rating: "4.9",
    availability: "Tue, Thu, Sat",
  },

  // Gynecologist
  {
    _id: "doc_gyna_m",
    name: "Dr. Sameer Joshi",
    gender: "Male",
    specialization: "Gynecologist",
    experienceYears: 14,
    fee: 850,
    rating: "4.8",
    availability: "Mon - Sat",
  },
  {
    _id: "doc_gyna_f",
    name: "Dr. Sunita Rao",
    gender: "Female",
    specialization: "Gynecologist",
    experienceYears: 15,
    fee: 850,
    rating: "5.0",
    availability: "Mon - Sat",
  },

  // ENT Specialist
  {
    _id: "doc_ent_m",
    name: "Dr. Alok Verma",
    gender: "Male",
    specialization: "ENT Specialist",
    experienceYears: 9,
    fee: 650,
    rating: "4.7",
    availability: "Mon, Wed, Sat",
  },
  {
    _id: "doc_ent_f",
    name: "Dr. Pooja Malhotra",
    gender: "Female",
    specialization: "ENT Specialist",
    experienceYears: 11,
    fee: 650,
    rating: "4.8",
    availability: "Tue, Thu, Fri",
  },

  // Ophthalmologist
  {
    _id: "doc_optha_m",
    name: "Dr. Rahul Fernandez",
    gender: "Male",
    specialization: "Ophthalmologist",
    experienceYears: 13,
    fee: 750,
    rating: "4.9",
    availability: "Mon - Sat",
  },
  {
    _id: "doc_optha_f",
    name: "Dr. Anjali Das",
    gender: "Female",
    specialization: "Ophthalmologist",
    experienceYears: 8,
    fee: 750,
    rating: "4.8",
    availability: "Mon - Fri",
  },

  // Gastroenterologist
  {
    _id: "doc_gastro_m",
    name: "Dr. Faisal Ahmed",
    gender: "Male",
    specialization: "Gastroenterologist",
    experienceYears: 15,
    fee: 1100,
    rating: "4.9",
    availability: "Mon, Thu, Sat",
  },
  {
    _id: "doc_gastro_f",
    name: "Dr. Deepa Singhania",
    gender: "Female",
    specialization: "Gastroenterologist",
    experienceYears: 12,
    fee: 1100,
    rating: "4.8",
    availability: "Tue, Wed, Fri",
  },

  // Urologist
  {
    _id: "doc_uro_m",
    name: "Dr. Tarun Bhatia",
    gender: "Male",
    specialization: "Urologist",
    experienceYears: 14,
    fee: 1000,
    rating: "4.8",
    availability: "Mon, Wed, Fri",
  },
  {
    _id: "doc_uro_f",
    name: "Dr. Neha Agarwal",
    gender: "Female",
    specialization: "Urologist",
    experienceYears: 10,
    fee: 1000,
    rating: "4.9",
    availability: "Tue, Thu, Sat",
  },

  // Endocrinologist
  {
    _id: "doc_endo_m",
    name: "Dr. Siddharth Roy",
    gender: "Male",
    specialization: "Endocrinologist",
    experienceYears: 11,
    fee: 950,
    rating: "4.8",
    availability: "Mon - Sat",
  },
  {
    _id: "doc_endo_f",
    name: "Dr. Shalini Mishra",
    gender: "Female",
    specialization: "Endocrinologist",
    experienceYears: 13,
    fee: 950,
    rating: "4.9",
    availability: "Mon - Fri",
  },

  // Oncologist
  {
    _id: "doc_onco_m",
    name: "Dr. Arvind Swamy",
    gender: "Male",
    specialization: "Oncologist",
    experienceYears: 18,
    fee: 1500,
    rating: "5.0",
    availability: "Mon, Wed, Fri",
  },
  {
    _id: "doc_onco_f",
    name: "Dr. Rashmi Menon",
    gender: "Female",
    specialization: "Oncologist",
    experienceYears: 15,
    fee: 1500,
    rating: "4.9",
    availability: "Tue, Thu, Sat",
  },
];

const TIME_SLOTS = [
  "09:30 AM",
  "11:00 AM",
  "02:00 PM",
  "04:30 PM",
  "06:00 PM",
];

const convertTo24Hour = (timeStr) => {
  if (!timeStr) return "";
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return timeStr;
  let [, hours, minutes, modifier] = match;
  let h = parseInt(hours, 10);
  if (modifier) {
    modifier = modifier.toUpperCase();
    if (modifier === "PM" && h < 12) h += 12;
    if (modifier === "AM" && h === 12) h = 0;
  }
  return `${String(h).padStart(2, "0")}:${minutes}`;
};

const Doctors = () => {
  const [doctors, setDoctors] = useState(MOCK_DOCTORS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");

  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [bookingMode, setBookingMode] = useState("video");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await API.get("/doctors");
      let apiDocs = [];
      if (Array.isArray(response.data)) {
        apiDocs = response.data;
      } else if (response.data?.doctors && Array.isArray(response.data.doctors)) {
        apiDocs = response.data.doctors;
      }

      // Merge API doctors with MOCK_DOCTORS ensuring complete coverage
      const combined = [...MOCK_DOCTORS];
      apiDocs.forEach((apiDoc) => {
        const exists = combined.some(
          (d) => d._id === apiDoc._id || d.name.toLowerCase() === apiDoc.name?.toLowerCase()
        );
        if (!exists) {
          combined.push(apiDoc);
        }
      });
      setDoctors(combined);
    } catch (err) {
      console.warn("Using full mock doctors dataset:", err.message);
      setDoctors(MOCK_DOCTORS);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const docSpec = (doc.specialization || doc.specialty || "").trim().toLowerCase();
    const currentFilter = selectedSpecialty.trim().toLowerCase();

    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docSpec.includes(searchTerm.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === "All" || docSpec === currentFilter;

    return matchesSearch && matchesSpecialty;
  });

  const handleOpenBooking = (doctor) => {
    setSelectedDoctor(doctor);
    setBookingDate("");
    setSelectedSlot("");
    setSymptoms("");
    setBookingMode("video");
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleCloseModal = () => {
    setSelectedDoctor(null);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!bookingDate || !selectedSlot) {
      setErrorMessage("Please select a date and time slot.");
      return;
    }

    setBookingLoading(true);
    setErrorMessage("");

    const formattedTimeSlot = convertTo24Hour(selectedSlot);

    const payload = {
      doctorId: selectedDoctor._id,
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialization || selectedDoctor.specialty,
      specialization: selectedDoctor.specialization || selectedDoctor.specialty,
      date: bookingDate,
      timeSlot: formattedTimeSlot,
      symptoms: symptoms,
      reason: symptoms,
      mode: bookingMode,
      status: "pending",
    };

    try {
      await API.post("/appointments", payload);
      setSuccessMessage("✅ Appointment booked successfully!");
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (err) {
      try {
        await API.post("/appointments/book", payload);
        setSuccessMessage("✅ Appointment booked successfully!");
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } catch (secondErr) {
        setErrorMessage(
          secondErr.response?.data?.message || err.response?.data?.message || "Failed to book appointment."
        );
      }
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="doctors-container">
      <div className="doctors-header">
        <h1>Find Healthcare Specialists</h1>
        <p>Book online consultations or in-person visits with verified doctors across all specialties.</p>
      </div>

      <div className="controls-section">
        <div className="search-box-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by Doctor Name or Specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div className="filter-pills" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {SPECIALTIES.map((spec, index) => (
            <button
              key={index}
              className={`pill-btn ${selectedSpecialty === spec ? "active" : ""}`}
              onClick={() => setSelectedSpecialty(spec)}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="doctors-grid">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc) => (
            <div key={doc._id} className="doctor-card">
              <div>
                <div className="doctor-info-header">
                  <div 
                    className="doctor-avatar" 
                    style={{
                      backgroundColor: doc.gender === "Female" ? "#fbcfe8" : "#bae6fd",
                      color: doc.gender === "Female" ? "#9d174d" : "#0369a1"
                    }}
                  >
                    {doc.name.replace("Dr. ", "").charAt(0)}
                  </div>
                  <div className="doctor-details">
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <h3>{doc.name}</h3>
                      {doc.gender && (
                        <span 
                          style={{ 
                            fontSize: "10px", 
                            padding: "2px 6px", 
                            borderRadius: "10px", 
                            backgroundColor: doc.gender === "Female" ? "#fce7f3" : "#e0f2fe", 
                            color: doc.gender === "Female" ? "#be185d" : "#0284c7" 
                          }}
                        >
                          {doc.gender}
                        </span>
                      )}
                    </div>
                    <span className="specialty-badge">
                      {doc.specialization || doc.specialty}
                    </span>
                  </div>
                </div>

                <div className="doctor-meta">
                  <div className="meta-item">
                    <span>Experience: </span>
                    <strong>{doc.experienceYears || 5}+ yrs</strong>
                  </div>
                  <div className="meta-item">
                    <span>Consultation: </span>
                    <strong>₹{doc.fee || 500}</strong>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="btn-book"
                  onClick={() => handleOpenBooking(doc)}
                >
                  📅 Book Appointment
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ gridColumn: "1 / -1", color: "#6b7280", marginTop: "1rem" }}>
            No doctors found matching your criteria.
          </p>
        )}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="modal-overlay">
          <div className="booking-modal">
            <div className="modal-header">
              <h2>Book Appointment</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            {successMessage && (
              <div className="alert-success">{successMessage}</div>
            )}

            {errorMessage && (
              <div style={{ color: "#dc2626", fontSize: "0.875rem", marginBottom: "1rem" }}>
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleBookAppointment}>
              <div className="form-group">
                <label>Doctor</label>
                <input
                  type="text"
                  className="form-input"
                  value={`${selectedDoctor.name} (${selectedDoctor.specialization || selectedDoctor.specialty})`}
                  disabled
                  style={{ backgroundColor: "#f9fafb" }}
                />
              </div>

              <div className="form-group">
                <label>Consultation Mode</label>
                <select
                  className="form-input"
                  value={bookingMode}
                  onChange={(e) => setBookingMode(e.target.value)}
                >
                  <option value="video">📹 Video Call</option>
                  <option value="in-person">🏥 In-Person Visit</option>
                </select>
              </div>

              <div className="form-group">
                <label>Select Date</label>
                <input
                  type="date"
                  className="form-input"
                  min={new Date().toISOString().split("T")[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Select Time Slot</label>
                <div className="time-slots">
                  {TIME_SLOTS.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`slot-btn ${selectedSlot === slot ? "selected" : ""}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Reason / Symptoms (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. High BP follow up, Headache..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                  disabled={bookingLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-confirm"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
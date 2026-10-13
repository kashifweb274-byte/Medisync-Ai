import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import "./Doctors.css";

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

const MOCK_DOCTORS = [
  // 1. General Physician
  {
    _id: "doc_gp_faisal",
    name: "Dr. Faisal",
    gender: "Male",
    specialization: "General Physician",
    experienceYears: 5,
    fee: 800,
    rating: "4.8",
    reviews: 185,
    availability: "Mon - Sat",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400"
  },
  {
    _id: "doc_gp_m",
    name: "Dr. Rajesh Sharma",
    gender: "Male",
    specialization: "General Physician",
    experienceYears: 10,
    fee: 500,
    rating: "4.8",
    reviews: 256,
    availability: "Mon - Sat",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400"
  },
  {
    _id: "doc_gp_f",
    name: "Dr. Sara Iyer",
    gender: "Female",
    specialization: "General Physician",
    experienceYears: 8,
    fee: 500,
    rating: "4.9",
    reviews: 278,
    availability: "Mon - Sat",
    avatar: "https://images.unsplash.com/photo-1594824813566-82823d294647?auto=format&fit=crop&q=80&w=400"
  },

  // 2. Cardiologist
  {
    _id: "doc_cardio_m",
    name: "Dr. Vikram Rao",
    gender: "Male",
    specialization: "Cardiologist",
    experienceYears: 14,
    fee: 1000,
    rating: "4.9",
    reviews: 312,
    availability: "Mon, Wed, Fri",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400"
  },
  {
    _id: "doc_cardio_f",
    name: "Dr. Priya Sharma",
    gender: "Female",
    specialization: "Cardiologist",
    experienceYears: 11,
    fee: 1000,
    rating: "4.8",
    reviews: 332,
    availability: "Tue, Thu, Sat",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"
  },

  // 3. Pediatrician
  {
    _id: "doc_pedia_f",
    name: "Dr. Aisha Khan",
    gender: "Female",
    specialization: "Pediatrician",
    experienceYears: 7,
    fee: 600,
    rating: "4.7",
    reviews: 187,
    availability: "Mon - Fri",
    avatar: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400"
  },
  {
    _id: "doc_pedia_m",
    name: "Dr. Rahul Verma",
    gender: "Male",
    specialization: "Pediatrician",
    experienceYears: 9,
    fee: 650,
    rating: "4.8",
    reviews: 204,
    availability: "Mon - Sat",
    avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400"
  },

  // 4. Orthopedic Surgeon
  {
    _id: "doc_ortho_m",
    name: "Dr. Rohan Desai",
    gender: "Male",
    specialization: "Orthopedic Surgeon",
    experienceYears: 15,
    fee: 1100,
    rating: "4.9",
    reviews: 210,
    availability: "Mon, Thu, Sat",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400"
  },
  {
    _id: "doc_ortho_f",
    name: "Dr. Sneha Kulkarni",
    gender: "Female",
    specialization: "Orthopedic Surgeon",
    experienceYears: 12,
    fee: 1100,
    rating: "4.8",
    reviews: 175,
    availability: "Tue, Wed, Fri",
    avatar: "https://images.unsplash.com/photo-1594824813566-82823d294647?auto=format&fit=crop&q=80&w=400"
  },

  // 5. Psychiatrist
  {
    _id: "doc_psych_m",
    name: "Dr. Karthik Nair",
    gender: "Male",
    specialization: "Psychiatrist",
    experienceYears: 11,
    fee: 800,
    rating: "4.8",
    reviews: 164,
    availability: "Mon - Fri",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400"
  },
  {
    _id: "doc_psych_f",
    name: "Dr. Meera Sen",
    gender: "Female",
    specialization: "Psychiatrist",
    experienceYears: 9,
    fee: 800,
    rating: "4.9",
    reviews: 220,
    availability: "Tue, Thu, Sat",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"
  },

  // 6. Dermatologist
  {
    _id: "doc_derma_m",
    name: "Dr. Devansh Saxena",
    gender: "Male",
    specialization: "Dermatologist",
    experienceYears: 8,
    fee: 700,
    rating: "4.7",
    reviews: 142,
    availability: "Mon - Sat",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400"
  },
  {
    _id: "doc_derma_f",
    name: "Dr. Riya Kapoor",
    gender: "Female",
    specialization: "Dermatologist",
    experienceYears: 10,
    fee: 750,
    rating: "4.9",
    reviews: 198,
    availability: "Mon, Wed, Sat",
    avatar: "https://images.unsplash.com/photo-1594824813566-82823d294647?auto=format&fit=crop&q=80&w=400"
  },

  // 7. Neurologist
  {
    _id: "doc_neuro_m",
    name: "Dr. Suresh Gupta",
    gender: "Male",
    specialization: "Neurologist",
    experienceYears: 16,
    fee: 1200,
    rating: "4.9",
    reviews: 289,
    availability: "Mon, Wed, Sat",
    avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400"
  },
  {
    _id: "doc_neuro_f",
    name: "Dr. Kavita Reddy",
    gender: "Female",
    specialization: "Neurologist",
    experienceYears: 13,
    fee: 1200,
    rating: "4.8",
    reviews: 195,
    availability: "Tue, Thu, Fri",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"
  },

  // 8. Pulmonologist
  {
    _id: "doc_pulmo_m",
    name: "Dr. Vikrant Mehta",
    gender: "Male",
    specialization: "Pulmonologist",
    experienceYears: 12,
    fee: 900,
    rating: "4.8",
    reviews: 168,
    availability: "Mon, Wed, Fri",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400"
  },
  {
    _id: "doc_pulmo_f",
    name: "Dr. Shalini Singh",
    gender: "Female",
    specialization: "Pulmonologist",
    experienceYears: 10,
    fee: 850,
    rating: "4.7",
    reviews: 130,
    availability: "Tue, Thu, Sat",
    avatar: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400"
  },

  // 9. Gynecologist
  {
    _id: "doc_gynaec_f1",
    name: "Dr. Ananya Rungta",
    gender: "Female",
    specialization: "Gynecologist",
    experienceYears: 10,
    fee: 700,
    rating: "4.9",
    reviews: 240,
    availability: "Mon - Sat",
    avatar: "https://images.unsplash.com/photo-1594824813566-82823d294647?auto=format&fit=crop&q=80&w=400"
  },
  {
    _id: "doc_gynaec_f2",
    name: "Dr. Sunita Patil",
    gender: "Female",
    specialization: "Gynecologist",
    experienceYears: 14,
    fee: 800,
    rating: "4.8",
    reviews: 215,
    availability: "Mon - Fri",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"
  },

  // 10. ENT Specialist
  {
    _id: "doc_ent_m",
    name: "Dr. Alok Verma",
    gender: "Male",
    specialization: "ENT Specialist",
    experienceYears: 9,
    fee: 600,
    rating: "4.7",
    reviews: 150,
    availability: "Mon - Fri",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400"
  },
  {
    _id: "doc_ent_f",
    name: "Dr. Pooja Hegde",
    gender: "Female",
    specialization: "ENT Specialist",
    experienceYears: 11,
    fee: 650,
    rating: "4.8",
    reviews: 182,
    availability: "Tue, Thu, Sat",
    avatar: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400"
  },

  // 11. Ophthalmologist
  {
    _id: "doc_ophthal_m",
    name: "Dr. Sameer Joshi",
    gender: "Male",
    specialization: "Ophthalmologist",
    experienceYears: 12,
    fee: 650,
    rating: "4.9",
    reviews: 280,
    availability: "Tue, Thu, Sat",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400"
  },
  {
    _id: "doc_ophthal_f",
    name: "Dr. Nidhi Bansal",
    gender: "Female",
    specialization: "Ophthalmologist",
    experienceYears: 8,
    fee: 600,
    rating: "4.8",
    reviews: 160,
    availability: "Mon - Sat",
    avatar: "https://images.unsplash.com/photo-1594824813566-82823d294647?auto=format&fit=crop&q=80&w=400"
  },

  // 12. Gastroenterologist
  {
    _id: "doc_gastro_m",
    name: "Dr. Amit Bhatia",
    gender: "Male",
    specialization: "Gastroenterologist",
    experienceYears: 13,
    fee: 1000,
    rating: "4.9",
    reviews: 205,
    availability: "Mon, Wed, Fri",
    avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400"
  },
  {
    _id: "doc_gastro_f",
    name: "Dr. Neeta Agarwal",
    gender: "Female",
    specialization: "Gastroenterologist",
    experienceYears: 15,
    fee: 1050,
    rating: "4.8",
    reviews: 230,
    availability: "Tue, Thu, Sat",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"
  },

  // 13. Urologist
  {
    _id: "doc_uro_m1",
    name: "Dr. Rajiv Singhal",
    gender: "Male",
    specialization: "Urologist",
    experienceYears: 15,
    fee: 1100,
    rating: "4.8",
    reviews: 175,
    availability: "Mon, Thu, Sat",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400"
  },
  {
    _id: "doc_uro_m2",
    name: "Dr. Varun Malhotra",
    gender: "Male",
    specialization: "Urologist",
    experienceYears: 11,
    fee: 1000,
    rating: "4.7",
    reviews: 140,
    availability: "Mon, Wed, Fri",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400"
  },

  // 14. Endocrinologist
  {
    _id: "doc_endo_f",
    name: "Dr. Neha Agarwal",
    gender: "Female",
    specialization: "Endocrinologist",
    experienceYears: 11,
    fee: 950,
    rating: "4.9",
    reviews: 210,
    availability: "Mon - Sat",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"
  },
  {
    _id: "doc_endo_m",
    name: "Dr. Kunal Shah",
    gender: "Male",
    specialization: "Endocrinologist",
    experienceYears: 14,
    fee: 900,
    rating: "4.8",
    reviews: 188,
    availability: "Tue, Thu, Sat",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400"
  },

  // 15. Oncologist
  {
    _id: "doc_onco_m",
    name: "Dr. Sandeep Roy",
    gender: "Male",
    specialization: "Oncologist",
    experienceYears: 18,
    fee: 1500,
    rating: "5.0",
    reviews: 340,
    availability: "Mon, Wed, Fri",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400"
  },
  {
    _id: "doc_onco_f",
    name: "Dr. Tanvi Deshmukh",
    gender: "Female",
    specialization: "Oncologist",
    experienceYears: 16,
    fee: 1400,
    rating: "4.9",
    reviews: 290,
    availability: "Tue, Thu, Sat",
    avatar: "https://images.unsplash.com/photo-1594824813566-82823d294647?auto=format&fit=crop&q=80&w=400"
  }
];

const TIME_SLOTS = [
  "09:30 AM",
  "11:00 AM",
  "02:00 PM",
  "04:30 PM",
  "06:00 PM",
];

const getDoctorAvatar = (doc) => {
  if (doc.avatar) return doc.avatar;
  const isFemale = doc.gender === "Female";
  return isFemale
    ? "https://images.unsplash.com/photo-1594824813566-82823d294647?auto=format&fit=crop&q=80&w=400"
    : "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400";
};

const Doctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState(MOCK_DOCTORS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");

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

      const combined = [...MOCK_DOCTORS];
      apiDocs.forEach((apiDoc) => {
        const exists = combined.some(
          (d) => d._id === apiDoc._id || d.name?.toLowerCase() === apiDoc.name?.toLowerCase()
        );
        if (!exists) {
          combined.push(apiDoc);
        }
      });
      setDoctors(combined);
    } catch (err) {
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

    const spec = selectedDoctor.specialization || selectedDoctor.specialty || "General Physician";
    const avatarImg = getDoctorAvatar(selectedDoctor);

    const payload = {
      doctorId: selectedDoctor._id,
      doctor: selectedDoctor.name,
      doctorName: selectedDoctor.name,
      specialty: spec,
      specialization: spec,
      doctorProfileImage: avatarImg,
      date: bookingDate,
      timeSlot: selectedSlot,
      slot: selectedSlot,
      symptoms: symptoms || "Routine Checkup",
      reason: symptoms || "Routine Checkup",
      mode: bookingMode,
      consultationMode: bookingMode,
      status: "pending",
    };

    try {
      try {
        await API.post("/appointments/book", payload);
      } catch {
        await API.post("/appointments", payload);
      }

      // Persist in localStorage so Appointments page displays it instantly
      try {
        const saved = localStorage.getItem("patient_appointments");
        let list = saved ? JSON.parse(saved) : [];
        const newAppt = {
          _id: `appt_${Date.now()}`,
          id: `appt_${Date.now()}`,
          doctorName: selectedDoctor.name,
          specialty: spec,
          doctorProfileImage: avatarImg,
          date: bookingDate,
          timeSlot: selectedSlot,
          mode: bookingMode,
          status: "pending",
          symptoms: symptoms || "Routine Checkup",
        };
        list = [newAppt, ...list];
        localStorage.setItem("patient_appointments", JSON.stringify(list));
      } catch (storageErr) {
        console.warn("Storage update failed:", storageErr);
      }

      setSuccessMessage(`Appointment booked with ${selectedDoctor.name} successfully!`);
      setTimeout(() => {
        handleCloseModal();
        navigate("/patient/appointments");
      }, 1200);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Failed to book appointment. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, position: 'relative' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            Find Healthcare Specialists 
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', backgroundColor: '#0284c7', color: '#fff', fontSize: 13, fontWeight: 'bold' }}>✓</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Book online consultations or in-person visits with verified doctors across all specialties.
          </p>
        </div>

        {/* Header Shield Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="220" height="90" viewBox="0 0 220 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="5" width="220" height="80" rx="20" fill="#EBF8FF" />
            <circle cx="110" cy="45" r="35" fill="#D2EEFC" opacity="0.6" />
            <circle cx="70" cy="50" r="25" fill="#E0F2FE" opacity="0.8" />
            <circle cx="150" cy="50" r="25" fill="#E0F2FE" opacity="0.8" />
            <ellipse cx="110" cy="72" rx="75" ry="5" fill="#BAE6FD" opacity="0.7" />
            <g transform="translate(85, 18)">
              <path d="M 25 0 C 38 0, 50 5, 50 15 C 50 35, 38 50, 25 55 C 12 50, 0 35, 0 15 C 0 5, 12 0, 25 0 Z" fill="#0284C7" />
              <rect x="21" y="15" width="8" height="24" rx="2" fill="white" />
              <rect x="13" y="23" width="24" height="8" rx="2" fill="white" />
            </g>
          </svg>
        </div>
      </div>

      {/* Search and Location Filter Bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 2, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 16 }}>🔍</span>
          <input
            type="text"
            placeholder="Search by Doctor Name or Specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px 12px 46px', borderRadius: 12,
              border: '1px solid #e2e8f0', backgroundColor: '#fff', fontSize: 14, outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          />
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 16 }}>📍</span>
          <select
            style={{
              width: '100%', padding: '12px 36px 12px 46px', borderRadius: 12,
              border: '1px solid #e2e8f0', backgroundColor: '#fff', fontSize: 14, color: '#475569',
              appearance: 'none', cursor: 'pointer', outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          >
            <option>Select Location</option>
            <option>Delhi NCR</option>
            <option>Mumbai</option>
            <option>Bangalore</option>
          </select>
          <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', fontSize: 12 }}>▼</span>
        </div>
      </div>

      {/* Specialty Filter Pills */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
        {SPECIALTIES.map((spec, index) => (
          <button
            key={index}
            onClick={() => setSelectedSpecialty(spec)}
            style={{
              padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: selectedSpecialty === spec ? '#008394' : '#fff',
              color: selectedSpecialty === spec ? '#fff' : '#475569',
              borderColor: selectedSpecialty === spec ? '#008394' : '#e2e8f0'
            }}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Doctors Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc) => (
            <div
              key={doc._id}
              style={{
                backgroundColor: '#fff', borderRadius: 16, padding: 20,
                border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative'
              }}
            >
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{
                  width: 84, height: 84, borderRadius: '50%',
                  backgroundColor: doc.gender === 'Female' ? '#fce7f3' : '#e0f2fe',
                  overflow: 'hidden', flexShrink: 0
                }}>
                  <img
                    src={getDoctorAvatar(doc)}
                    alt={doc.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=0D8ABC&color=fff&bold=true`;
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>{doc.name}</h3>
                    {doc.gender && (
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 500,
                        backgroundColor: doc.gender === 'Female' ? '#fce7f3' : '#e0f2fe',
                        color: doc.gender === 'Female' ? '#db2777' : '#0284c7'
                      }}>
                        {doc.gender}
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#0284c7', fontSize: 13, fontWeight: 500, margin: '4px 0 10px 0' }}>
                    {doc.specialization || doc.specialty}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🏅</span>
                      <span><b>{doc.experienceYears || 5}+ yrs</b> Experience</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>💳</span>
                      <span><b>₹{doc.fee || 500}</b> Consultation</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#f59e0b', fontSize: 14 }}>★</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{doc.rating || "4.8"}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>({doc.reviews || 220} reviews)</span>
                </div>

                <button
                  onClick={() => handleOpenBooking(doc)}
                  style={{
                    backgroundColor: '#007791', color: '#fff', border: 'none', padding: '9px 16px',
                    borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, transition: 'background-color 0.2s'
                  }}
                >
                  📅 Book Appointment
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ gridColumn: '1 / -1', color: '#6b7280', marginTop: '1rem', textAlign: 'center' }}>
            No doctors found matching your criteria.
          </p>
        )}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 480,
            padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#0f172a' }}>Book Appointment</h2>
              <button onClick={handleCloseModal} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            {successMessage && (
              <div style={{ padding: '12px 16px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: 10, fontSize: 14, marginBottom: 16 }}>
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 10, fontSize: 14, marginBottom: 16 }}>
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleBookAppointment}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Doctor</label>
                <input
                  type="text"
                  value={`${selectedDoctor.name} (${selectedDoctor.specialization || selectedDoctor.specialty})`}
                  disabled
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Consultation Mode</label>
                <select
                  value={bookingMode}
                  onChange={(e) => setBookingMode(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' }}
                >
                  <option value="video">📹 Video Call</option>
                  <option value="inperson">🏥 In-Person Visit</option>
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Select Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Select Time Slot</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {TIME_SLOTS.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: '1px solid', cursor: 'pointer',
                        backgroundColor: selectedSlot === slot ? '#007791' : '#fff',
                        color: selectedSlot === slot ? '#fff' : '#475569',
                        borderColor: selectedSlot === slot ? '#007791' : '#cbd5e1'
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Reason / Symptoms (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. High Fever, Headache..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={bookingLoading}
                  style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontSize: 14, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  style={{ padding: '10px 18px', borderRadius: 8, border: 'none', backgroundColor: '#007791', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
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
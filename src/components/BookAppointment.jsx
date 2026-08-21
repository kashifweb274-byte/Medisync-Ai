import React, { useState, useEffect } from "react";
import axios from "axios";

const BookAppointment = ({ doctorId }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);

  // Today date format YYYY-MM-DD (Purani date disable karne ke liye)
  const today = new Date().toISOString().split("T")[0];

  // STEP 1: Jab patient Date change karega, automatic API chalegi
  useEffect(() => {
    if (!selectedDate || !doctorId) return;

    const fetchSlots = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `/api/appointments/slots/${doctorId}?date=${selectedDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAvailableSlots(res.data.availableSlots || []);
      } catch (err) {
        console.error("Slots load nahi hue", err);
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, doctorId]);

  // STEP 2: Appointment Book karne ki API
  const handleBooking = async () => {
    if (!selectedSlot) return alert("Kripya pehle slot choose karein!");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/appointments/book",
        { doctorId, date: selectedDate, timeSlot: selectedSlot },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Appointment successfully book ho gaya!");
      setSelectedSlot("");
      setSelectedDate("");
      setAvailableSlots([]);
    } catch (err) {
      alert("Booking fail ho gayi");
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h3>Book Appointment</h3>

      {/* Date Picker */}
      <label>Date Select Karein: </label>
      <input
        type="date"
        min={today}
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value);
          setSelectedSlot(""); // Purana selected slot reset
        }}
      />

      {/* Slots Section */}
      <div style={{ marginTop: "15px" }}>
        {loading ? (
          <p>Slots search kar rahe hain...</p>
        ) : availableSlots.length > 0 ? (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {availableSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                style={{
                  padding: "8px 12px",
                  backgroundColor: selectedSlot === slot ? "#007bff" : "#f0f0f0",
                  color: selectedSlot === slot ? "#fff" : "#000",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {slot}
              </button>
            ))}
          </div>
        ) : selectedDate ? (
          <p style={{ color: "red" }}>Is date par koi slots khali nahi hain.</p>
        ) : null}
      </div>

      {/* Confirm Booking Button */}
      {selectedSlot && (
        <button
          onClick={handleBooking}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Confirm Booking ({selectedSlot})
        </button>
      )}
    </div>
  );
};

export default BookAppointment;
import React from "react";
import BookAppointment from "../components/BookAppointment";

const DoctorDetails = ({ doctor }) => {
  return (
    <div>
      <h1>{doctor.name}</h1>
      <p>Specialty: {doctor.specialty}</p>

      {/* Patient Slot Booking Component */}
      <BookAppointment doctorId={doctor._id} />
    </div>
  );
};

export default DoctorDetails;
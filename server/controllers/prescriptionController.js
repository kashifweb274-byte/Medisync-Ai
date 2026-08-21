const Prescription = require('../models/Prescription');

// Get all prescriptions
const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find();
    res.status(200).json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new prescription
const createPrescription = async (req, res) => {
  try {
    const newPrescription = new Prescription(req.body);
    const savedPrescription = await newPrescription.save();
    res.status(201).json({ success: true, data: savedPrescription });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPrescriptions,
  createPrescription,
};
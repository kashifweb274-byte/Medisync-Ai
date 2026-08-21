const express = require('express');
const router = express.Router();
const {
  getPrescriptions,
  createPrescription,
} = require('../controllers/prescriptionController');

router.get('/', getPrescriptions);
router.post('/', createPrescription);

module.exports = router;
const express = require("express");
const router = express.Router();
const {
  submitContactForm,
  submitBookingRequest,
} = require("../controllers/contactController");

router.post("/submit", submitContactForm);
router.post("/booking", submitBookingRequest);

module.exports = router;

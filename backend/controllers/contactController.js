const {
  sendContactEmail,
  sendBookingRequestEmail,
} = require("../services/emailService");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeText = (value) => String(value ?? "").trim();

const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "All fields are required: name, email, subject, and message.",
      });
    }

    const safeName = normalizeText(name);
    const safeEmail = normalizeText(email).toLowerCase();
    const safeSubject = normalizeText(subject);
    const safeMessage = normalizeText(message);

    if (!emailRegex.test(safeEmail)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address." });
    }

    if (safeName.length > 100) {
      return res.status(400).json({
        message: "Name is too long. Please keep it under 100 characters.",
      });
    }

    if (safeSubject.length > 200) {
      return res.status(400).json({
        message: "Subject is too long. Please keep it under 200 characters.",
      });
    }

    if (safeMessage.length > 5000) {
      return res.status(400).json({
        message: "Message is too long. Please keep it under 5000 characters.",
      });
    }

    const result = await sendContactEmail({
      name: safeName,
      email: safeEmail,
      subject: safeSubject,
      message: safeMessage,
    });

    if (!result.success) {
      const message =
        result.reason === "transporter-missing" ||
        result.reason === "recipient-missing"
          ? "Email delivery is not configured yet. Please set up the contact email in the backend environment before sending messages."
          : "Failed to send message. Please try again later.";

      console.error("[contactController] failed to send contact email", result);
      return res
        .status(500)
        .json({ message, error: result.error || result.reason });
    }

    console.log("[contactController] contact form submitted successfully", {
      name: safeName,
      email: safeEmail,
      subject: safeSubject,
    });

    return res.status(200).json({
      message: "Your message was sent successfully.",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("[contactController] error processing contact form", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

const submitBookingRequest = async (req, res) => {
  try {
    const {
      fullName,
      email,
      preferredDate,
      preferredLocation,
      sessionType,
      bookingType,
      country,
      phone,
      message,
    } = req.body;

    const requestType = normalizeText(
      bookingType || sessionType || "Tattoo Booking",
    );

    if (!fullName || !email || !preferredDate || !preferredLocation) {
      return res.status(400).json({
        message: "Full name, email, preferred date, and location are required.",
      });
    }

    if (
      requestType === "Surf Photography" &&
      (!country || !phone || !message)
    ) {
      return res.status(400).json({
        message:
          "Country, phone number, and project details are required for Surf Photography bookings.",
      });
    }

    const safeFullName = normalizeText(fullName);
    const safeEmail = normalizeText(email).toLowerCase();
    const safePreferredDate = normalizeText(preferredDate);
    const safePreferredLocation = normalizeText(preferredLocation);
    const safeSessionType = normalizeText(
      sessionType || bookingType || "Tattoo Booking",
    );
    const safeBookingType = normalizeText(
      bookingType || sessionType || "Tattoo Booking",
    );
    const safeCountry = normalizeText(country);
    const safePhone = normalizeText(phone);
    const safeMessage = normalizeText(message);

    if (!emailRegex.test(safeEmail)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address." });
    }

    if (safeFullName.length > 120) {
      return res.status(400).json({
        message: "Full name is too long. Please keep it under 120 characters.",
      });
    }

    if (safeMessage.length > 2000) {
      return res.status(400).json({
        message: "Message is too long. Please keep it under 2000 characters.",
      });
    }

    const result = await sendBookingRequestEmail({
      fullName: safeFullName,
      email: safeEmail,
      preferredDate: safePreferredDate,
      preferredLocation: safePreferredLocation,
      sessionType: safeSessionType,
      bookingType: safeBookingType,
      country: safeCountry,
      phone: safePhone,
      message: safeMessage,
    });

    if (!result.success) {
      const responseMessage =
        result.reason === "transporter-missing" ||
        result.reason === "recipient-missing"
          ? "Booking requests are not configured yet. Please set up the business email in the backend environment before sending booking requests."
          : "Unable to send your booking request right now. Please try again later or contact Julian directly.";

      console.error(
        "[contactController] failed to send booking request",
        result,
      );
      return res.status(500).json({
        message: responseMessage,
        error: result.error || result.reason,
      });
    }

    return res.status(200).json({
      message:
        "Your booking request was sent successfully. Julian will confirm the session once available.",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error(
      "[contactController] error processing booking request",
      error,
    );
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

module.exports = {
  submitContactForm,
  submitBookingRequest,
};

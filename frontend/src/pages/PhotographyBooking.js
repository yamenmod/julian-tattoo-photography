import React, { useState } from "react";
import axios from "axios";

const locationsByCountry = {
  Israel: ["Tel Aviv", "Haifa", "Jerusalem Coast", "Ashkelon", "Netanya"],
  "Sri Lanka": ["Ahangama", "Weligama", "Hiriketiya", "Unawatuna", "Mirissa"],
};

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  country: "",
  photographyLocation: "",
  preferredDate: "",
  message: "",
};

function PhotographyBooking() {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");

  const availableLocations = formData.country
    ? locationsByCountry[formData.country] || []
    : [];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => {
      if (name === "country") {
        return {
          ...previous,
          country: value,
          photographyLocation: "",
        };
      }

      return { ...previous, [name]: value };
    });

    setSubmitStatus(null);
    setSubmitMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = formData.fullName.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedCountry = formData.country.trim();
    const trimmedLocation = formData.photographyLocation.trim();
    const trimmedDate = formData.preferredDate.trim();
    const trimmedMessage = formData.message.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !trimmedName ||
      !trimmedEmail ||
      !trimmedPhone ||
      !trimmedCountry ||
      !trimmedLocation ||
      !trimmedDate ||
      !trimmedMessage
    ) {
      setSubmitStatus("error");
      setSubmitMessage(
        "Please complete all required fields before sending your request.",
      );
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setSubmitStatus("error");
      setSubmitMessage("Please provide a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage("");

    try {
      const response = await axios.post("/api/contact/booking", {
        fullName: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        country: trimmedCountry,
        preferredLocation: trimmedLocation,
        preferredDate: trimmedDate,
        bookingType: "Surf Photography",
        message: trimmedMessage,
      });

      setSubmitStatus("success");
      setSubmitMessage(
        response.data?.message ||
          "Your photography booking request was sent successfully.",
      );
      setFormData(initialForm);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        error.response?.data?.message ||
          "Unable to send your photography request right now. Please try again later.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="portfolio-page-section portfolio-booking-page">
      <div className="portfolio-shell booking-shell">
        <div className="booking-intro">
          <p>
            Capture the energy of the coast and the rhythm of the wave. Book a
            surf or ocean session with Julian.
          </p>
        </div>

        <div className="booking-form-wrap">
          <div className="booking-section-header">
            <span>01</span>
            <h2>BOOKING</h2>
          </div>

          <form className="booking-form" onSubmit={handleSubmit} noValidate>
            <div className="booking-field-row">
              <label>
                <span>Customer name</span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </label>

              <label>
                <span>Email address</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </label>
            </div>

            <div className="booking-field-row">
              <label>
                <span>Phone number</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+972 5XX XXX XXX"
                  required
                />
              </label>

              <label>
                <span>Country</span>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a country</option>
                  <option value="Israel">Israel</option>
                  <option value="Sri Lanka">Sri Lanka</option>
                </select>
              </label>
            </div>

            <div className="booking-field-row">
              <label>
                <span>Preferred photography location</span>
                <select
                  name="photographyLocation"
                  value={formData.photographyLocation}
                  onChange={handleChange}
                  disabled={!availableLocations.length}
                  required
                >
                  <option value="">
                    {availableLocations.length
                      ? "Select a location"
                      : "Choose a country first"}
                  </option>
                  {availableLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Preferred date</span>
                <input
                  type="text"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  placeholder="Ex. 18 Oct 2026"
                  required
                />
              </label>
            </div>

            <div className="booking-field-row single-row">
              <label>
                <span>Additional message or project details</span>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Tell Julian about the shoot, mood, surf conditions, or the story you want captured."
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              className="booking-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "REQUESTING..." : "Request a Booking"}
            </button>

            {submitStatus === "success" && (
              <p className="portfolio-form-feedback success">{submitMessage}</p>
            )}

            {submitStatus === "error" && (
              <p className="portfolio-form-feedback error">{submitMessage}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

export default PhotographyBooking;

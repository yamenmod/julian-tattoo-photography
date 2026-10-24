import React, { useState } from "react";
import api from "../utils/api";

const initialForm = {
  fullName: "",
  email: "",
  preferredDate: "",
  preferredLocation: "",
  message: "",
  style: "",
  idea: "",
  bodyLocationSize: "",
  projectStory: "",
  contraindications: "",
};

function Booking({ onNavigate }) {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setSubmitStatus(null);
    setSubmitMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = formData.fullName.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedDate = formData.preferredDate.trim();
    const trimmedLocation = formData.preferredLocation.trim();
    const trimmedMessage = formData.message.trim();
    const projectSummary = [
      `Preferred style: ${formData.style.trim() || "Not provided"}`,
      `Idea: ${formData.idea.trim() || "Not provided"}`,
      `Body location and size: ${formData.bodyLocationSize.trim() || "Not provided"}`,
      `Project story: ${formData.projectStory.trim() || "Not provided"}`,
      `Contraindications: ${formData.contraindications.trim() || "Not provided"}`,
    ].join("\n");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !trimmedName ||
      !trimmedEmail ||
      !trimmedDate ||
      !trimmedLocation ||
      !trimmedMessage
    ) {
      setSubmitStatus("error");
      setSubmitMessage(
        "Please complete all required fields before submitting your request.",
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
      const response = await api.post("/api/contact/booking", {
        fullName: trimmedName,
        email: trimmedEmail,
        preferredDate: trimmedDate,
        preferredLocation: trimmedLocation,
        bookingType: "Tattoo Booking",
        message: `${trimmedMessage}\n\nProject details:\n${projectSummary}`,
      });

      setSubmitStatus("success");
      setSubmitMessage(
        response.data?.message || "Your booking request was sent successfully.",
      );
      setFormData(initialForm);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        error.response?.data?.message ||
          "Unable to send your booking request right now. Please try again later.",
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
            Ready to turn your story into art? Book your next tattoo session in
            Ahangama, Sri Lanka, and bring your unique vision to life.
          </p>
        </div>

        <div className="booking-form-wrap">
          <div className="booking-section-header">
            <span>01</span>
            <h2>PERSONAL</h2>
          </div>

          <form className="booking-form" onSubmit={handleSubmit} noValidate>
            <div className="booking-field-row">
              <label>
                <span>Full name</span>
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
                <span>Preferred session date</span>
                <input
                  type="text"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  placeholder="Ex. 18 Oct 2026"
                  required
                />
              </label>

              <label>
                <span>Preferred location</span>
                <select
                  name="preferredLocation"
                  value={formData.preferredLocation}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a location</option>
                  <option value="Ahangama, Sri Lanka">
                    Ahangama, Sri Lanka
                  </option>
                  <option value="Weligama, Sri Lanka">
                    Weligama, Sri Lanka
                  </option>
                </select>
              </label>
            </div>

            <div className="booking-section-header booking-project-header">
              <span>02</span>
              <h2>PROJECT</h2>
            </div>

            <div className="booking-field-row">
              <label>
                <span>Preferred style *</span>
                <input
                  type="text"
                  name="style"
                  value={formData.style}
                  onChange={handleChange}
                  placeholder="Flowers, Leaves, Minimals.."
                />
              </label>

              <label>
                <span>Your idea *</span>
                <input
                  type="text"
                  name="idea"
                  value={formData.idea}
                  onChange={handleChange}
                  placeholder="Flowers and Leaves etc."
                />
              </label>
            </div>

            <div className="booking-field-row">
              <label>
                <span>Body location and size *</span>
                <input
                  type="text"
                  name="bodyLocationSize"
                  value={formData.bodyLocationSize}
                  onChange={handleChange}
                  placeholder="Left arm, 25x100cm"
                />
              </label>

              <label>
                <span>Tell me about it</span>
                <input
                  type="text"
                  name="projectStory"
                  value={formData.projectStory}
                  onChange={handleChange}
                  placeholder="If your project has a story"
                />
              </label>
            </div>

            <div className="booking-field-row single-row">
              <label>
                <span>Contraindications *</span>
                <input
                  type="text"
                  name="contraindications"
                  value={formData.contraindications}
                  onChange={handleChange}
                  placeholder="Allergy to latex, nickel, diabetes, psoriasis etc."
                />
              </label>
            </div>

            <div className="booking-field-row single-row">
              <label>
                <span>Additional message</span>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Tell Julian about your tattoo idea, placement, style, or vision for the session."
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

export default Booking;

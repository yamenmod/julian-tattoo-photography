import React, { useState } from "react";
import api from "../utils/api";
import InstagramLink from "../components/InstagramLink";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function Contact({ onNavigate }) {
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

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedSubject = formData.subject.trim();
    const trimmedMessage = formData.message.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName || !trimmedEmail || !trimmedSubject || !trimmedMessage) {
      setSubmitStatus("error");
      setSubmitMessage(
        "Please complete all required fields before sending your message.",
      );
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setSubmitStatus("error");
      setSubmitMessage("Please enter a valid email address.");
      return;
    }

    if (trimmedMessage.length > 5000) {
      setSubmitStatus("error");
      setSubmitMessage(
        "Your message is too long. Please keep it under 5000 characters.",
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage("");

    try {
      const response = await api.post("/api/contact/submit", {
        name: trimmedName,
        email: trimmedEmail,
        subject: trimmedSubject,
        message: trimmedMessage,
      });

      setSubmitStatus("success");
      setSubmitMessage(
        response.data?.message || "Your message was sent successfully.",
      );
      setFormData(initialForm);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        error.response?.data?.message ||
          "Failed to send message. Please try again later.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="portfolio-page-section portfolio-contact-page">
      <div className="portfolio-shell contact-shell">
        <div className="portfolio-section-heading compact-heading">
          <p className="portfolio-kicker">Contact</p>
          <h1>Contact Julian</h1>
          <p>
            For commissions, collaborations, or a session enquiry, send a note
            below.
          </p>
          <InstagramLink />
        </div>

        <div className="portfolio-form-card contact-form-card">
          <form className="portfolio-form" onSubmit={handleSubmit} noValidate>
            <div className="portfolio-field-row">
              <label>
                <span>Name</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </label>

              <label>
                <span>Email</span>
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

            <label>
              <span>Subject</span>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can Julian help?"
                required
              />
            </label>

            <label>
              <span>Message</span>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="7"
                placeholder="Tell Julian about your idea or session request."
                required
              />
            </label>

            <div className="portfolio-form-actions">
              <button
                type="submit"
                className="portfolio-primary-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
              <button
                type="button"
                className="portfolio-secondary-button"
                onClick={() => onNavigate("booking")}
              >
                Book a Session
              </button>
            </div>

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

export default Contact;

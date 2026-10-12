import React from "react";

function Footer({ onNavigate }) {
  return (
    <footer className="portfolio-footer">
      <div className="portfolio-shell portfolio-footer-inner">
        <div className="portfolio-footer-brand-block">
          <p className="portfolio-footer-brand">JULIAN</p>
          <p className="portfolio-footer-copy">
            Surf and ocean stories from Sri Lanka.
          </p>
        </div>

        <div className="portfolio-footer-links">
          <button type="button" onClick={() => onNavigate("home")}>
            Home
          </button>
          <button type="button" onClick={() => onNavigate("contact")}>
            Contact Us
          </button>
          <button type="button" onClick={() => onNavigate("booking")}>
            Book Now
          </button>
        </div>
      </div>

      <div className="portfolio-footer-meta">
        © {new Date().getFullYear()} Julian Photography
      </div>
    </footer>
  );
}

export default Footer;

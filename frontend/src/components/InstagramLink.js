import React from "react";

const INSTAGRAM_URL = "https://www.instagram.com/julian.satattooer/";

function InstagramLink({ className = "" }) {
  return (
    <a
      className={`portfolio-instagram-link ${className}`.trim()}
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Visit Julian on Instagram"
    >
      <svg
        className="portfolio-instagram-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4.25" />
        <circle className="portfolio-instagram-dot" cx="17.5" cy="6.5" r="1" />
      </svg>
      <span>Instagram</span>
    </a>
  );
}

export default InstagramLink;

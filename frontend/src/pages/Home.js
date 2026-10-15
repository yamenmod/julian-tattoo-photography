import React from "react";
import InstagramLink from "../components/InstagramLink";

const galleryItems = [
  {
    image: "/JulianHome4Photos/tattoo-01.jpeg",
    alt: "Ornamental floral tattoo on the upper thigh",
  },
  {
    image: "/JulianHome4Photos/tattoo-02.jpeg",
    alt: "Floral tattoo across the hip and thigh",
  },
  {
    image: "/JulianHome4Photos/tattoo-03.jpeg",
    alt: "Fine-line floral tattoo on the upper leg",
  },
  {
    image: "/JulianHome4Photos/tattoo-04.jpeg",
    alt: "Dragon tattoo sleeve in fine-line style",
  },
];

function Home({ onNavigate }) {
  return (
    <div className="portfolio-home-page">
      <div className="portfolio-shell">
        <div className="portfolio-home-intro">
          <p className="portfolio-section-label">MOST CURRENT</p>
        </div>

        <div className="portfolio-home-gallery">
          {galleryItems.map((item, index) => (
            <article
              key={`${item.alt}-${index}`}
              className={`portfolio-gallery-card ${index === 0 || index === 1 ? "featured" : ""}`}
            >
              <img src={item.image} alt={item.alt} />
            </article>
          ))}
        </div>

        <div className="portfolio-home-cta-block">
          <p>
            Ready to turn your story into art? Now is the perfect time to book
            your next session and bring your unique vision to life.
          </p>

          <div className="portfolio-home-cta-row">
            <span className="portfolio-cta-label">Book Now</span>
            <button
              type="button"
              className="portfolio-cta-circle"
              onClick={() => onNavigate("booking")}
              aria-label="Inquire about a booking"
            >
              ↓
            </button>
          </div>
        </div>

        <div className="portfolio-bio-block">
          <p>
            Hi, I’m Julian — a tattoo artist and surf/ocean photographer based
            in Sri Lanka. I create custom tattoos with a bold, natural, and
            deeply personal aesthetic, while also capturing surf, ocean, and
            coastal stories through a cinematic lens. Available for tattoo
            commissions and photography sessions in Ahangama, Weligama, and
            nearby beaches.
          </p>
          <InstagramLink />
        </div>
      </div>
    </div>
  );
}

export default Home;

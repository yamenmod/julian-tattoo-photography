import React from "react";

const galleryItems = [
  {
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    alt: "Ocean wave and surfer",
  },
  {
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    alt: "Ocean stills and sunlight",
  },
  {
    image:
      "https://images.unsplash.com/photo-1493558103817-58b2924b5715?auto=format&fit=crop&w=1200&q=80",
    alt: "Beach portrait and motion",
  },
  {
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    alt: "Coastal warm light shot",
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
            <span className="portfolio-cta-label">Inquire</span>
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
            Hi, I’m Julian, a surf and ocean photographer capturing authentic
            moments in and around the waves. Based in Sri Lanka, I photograph
            surfers, ocean life, and coastal stories with a natural, cinematic
            style. Available for sessions in Ahangama, Weligama, and nearby
            beaches.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;

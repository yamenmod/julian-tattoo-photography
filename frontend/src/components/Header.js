import React from "react";

function Header({ currentPage, onNavigate }) {
  const navItems = [
    { label: "Home", value: "home" },
    { label: "Contact Us", value: "contact" },
    { label: "Book Now", value: "booking" },
  ];

  return (
    <header className="portfolio-header">
      <div className="portfolio-header-inner">
        <button
          type="button"
          className="portfolio-brand"
          onClick={() => onNavigate("home")}
        >
          <span className="portfolio-brand-text">JULIAN</span>
        </button>

        <nav className="portfolio-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`portfolio-nav-link ${currentPage === item.value ? "is-active" : ""}`}
              onClick={() => onNavigate(item.value)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;

import React, { useState } from "react";

function Header({ currentPage, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuOpen = () => setIsMenuOpen(true);
  const handleMenuClose = () => setIsMenuOpen(false);
  const handleMenuToggle = () => {
    setIsMenuOpen((previous) => !previous);
  };

  const handleMenuBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsMenuOpen(false);
    }
  };

  const navItems = [
    { label: "Home", value: "home" },
    { label: "Contact Us", value: "contact" },
  ];

  const bookingOptions = [
    { label: "Tattoo Booking", value: "tattoo" },
    { label: "Surf Photography", value: "photography" },
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

          <div
            className="portfolio-booking-menu"
            onMouseEnter={handleMenuOpen}
            onMouseLeave={handleMenuClose}
            onFocusCapture={handleMenuOpen}
            onBlurCapture={handleMenuBlur}
          >
            <button
              type="button"
              className={`portfolio-nav-link ${currentPage === "booking" ? "is-active" : ""}`}
              onClick={handleMenuToggle}
              onFocus={handleMenuOpen}
              aria-expanded={isMenuOpen}
            >
              Book Now
            </button>

            {isMenuOpen && (
              <div className="portfolio-booking-submenu" role="menu">
                {bookingOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="portfolio-booking-submenu-button"
                    role="menuitem"
                    onClick={() => {
                      onNavigate("booking", option.value);
                      setIsMenuOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;

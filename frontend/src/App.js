import React, { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import PhotographyBooking from "./pages/PhotographyBooking";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [bookingType, setBookingType] = useState("tattoo");

  const handleNavigate = (page, nextBookingType = "tattoo") => {
    if (page === "booking") {
      setBookingType(nextBookingType);
    }
    setCurrentPage(page);
  };

  return (
    <div className="portfolio-app-shell">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="portfolio-main">
        {currentPage === "home" && <Home onNavigate={handleNavigate} />}
        {currentPage === "contact" && <Contact onNavigate={handleNavigate} />}
        {currentPage === "booking" &&
          (bookingType === "photography" ? (
            <PhotographyBooking />
          ) : (
            <Booking onNavigate={handleNavigate} />
          ))}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;

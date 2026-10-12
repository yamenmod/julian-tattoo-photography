import React, { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <div className="portfolio-app-shell">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="portfolio-main">
        {currentPage === "home" && <Home onNavigate={setCurrentPage} />}
        {currentPage === "contact" && <Contact onNavigate={setCurrentPage} />}
        {currentPage === "booking" && <Booking onNavigate={setCurrentPage} />}
      </main>

      <Footer onNavigate={setCurrentPage} />
    </div>
  );
}

export default App;

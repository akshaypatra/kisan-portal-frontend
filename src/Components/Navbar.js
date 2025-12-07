import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import authService from "../services/authService";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getStoredUser();

  const handleLogout = () => {
    authService.logout();
    closeMenu();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="container-fluid">
        {/* Brand */}
        <Link
          className="navbar-brand d-flex align-items-center fw-bold fs-3"
          to="/"
          onClick={closeMenu}
        >
          <img
            src="/ICONS/logo-wbg.png"
            style={{ height: "30px" }}
            alt="home icon"
            width={30}
            className="me-2"
          />
          BeejNex
        </Link>

        {/* Right section on small screens: toggler */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-controls="navbarSupportedContent"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible content */}
        <div
          className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center text-center text-lg-start gap-1">
            <li className="nav-item">
              <Link
                className="nav-link fs-5"
                to="/dashboard"
                onClick={closeMenu}
              >
                Dashboard
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link fs-5"
                to="/profile"
                onClick={closeMenu}
              >
                Profile
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link fs-5"
                to="/ai-advisory"
                onClick={closeMenu}
              >
                AI Advisory
              </Link>
            </li>

            {!isAuthenticated ? (
              <li className="nav-item">
                <Link
                  className="nav-link fs-5"
                  to="/login"
                  onClick={closeMenu}
                >
                  Log In
                </Link>
              </li>
            ) : (
              <>
                <li className="nav-item d-flex align-items-center justify-content-center justify-content-lg-start">
                  <span className="nav-link fs-6 text-white-50 mb-0">
                    {user?.name || "User"}
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light btn-sm ms-lg-2 mt-2 mt-lg-0"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}

            {/* Google Translate - as a proper nav item, right aligned */}
            <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
              <div
                id="google_translate_element"
                className="google-translate-container d-flex justify-content-center justify-content-lg-end"
              />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

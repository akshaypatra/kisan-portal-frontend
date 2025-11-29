import { Link } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="navbar-container" >

        <Link className="navbar-brand fs-3 fw-bold" to="/"  onClick={closeMenu}>
          BeejNex
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}
          id="navabar-inner-container"
          style={{ justifyContent: "flex-end"}}
        >
          <ul className="navbar-nav align-items-center">

            <li className="nav-item">
              <Link className="nav-link fs-5" to="/dashboard" onClick={closeMenu}>
                Dashboard
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link fs-5" to="/profile" onClick={closeMenu}>
                Profile
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link fs-5" to="/dashboard" onClick={closeMenu}>
                AI Advisory
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link fs-5" to="/login" onClick={closeMenu}>
                Log In
              </Link>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

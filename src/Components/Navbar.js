import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import authService from "../services/authService";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Check if user is logged in
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getStoredUser();

  const handleLogout = () => {
    authService.logout();
    closeMenu();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="navbar-container" >

        <Link className="navbar-brand fs-3 fw-bold" to="/"  onClick={closeMenu}>
          <img  src='/ICONS/logo-wbg.png' style={{height:"30px"}} alt="home icon" width={30} />BeejNex
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
              <Link className="nav-link fs-5" to="/ai-advisory" onClick={closeMenu}>
                AI Advisory
              </Link>
            </li>

            {!isAuthenticated ? (
              <li className="nav-item">
                <Link className="nav-link fs-5" to="/login" onClick={closeMenu}>
                  Log In
                </Link>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <span className="nav-link fs-6 text-white-50">
                    {user?.name || 'User'}
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light btn-sm ms-2"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

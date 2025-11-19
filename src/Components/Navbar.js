import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [isSuperUser, setIsSuperUser] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    const superUser = localStorage.getItem("is_superuser") === "true";
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role);
      setIsSuperUser(superUser);
    }
  }, []);

  const toggleMenu = () => setMenuOpen(v => !v);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    ["access_token", "refresh_token", "user_role", "user_name", "is_superuser"].forEach(k => localStorage.removeItem(k));
    setIsLoggedIn(false);
    setIsSuperUser(false);
    closeMenu();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="container">
        <Link className="navbar-brand" to="/">Farmers Portal</Link>
        <button className="navbar-toggler" onClick={toggleMenu} type="button" aria-label="Toggle menu">
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto">
            {!isLoggedIn ? (
              <>
                <li className="nav-item"><Link className="nav-link" to="/" onClick={closeMenu}>Home</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/contact" onClick={closeMenu}>Contact</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/login" onClick={closeMenu}>Log In</Link></li>
              </>
            ) : (
              <>
                {isSuperUser ? (
                  <>
                    <li className="nav-item"><Link className="nav-link" to="/admin-dashboard" onClick={closeMenu}>Admin Dashboard</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/contact" onClick={closeMenu}>Contact</Link></li>
                  </>
                ) : (
                  <>
                    {userRole === "teacher" && <li className="nav-item"><Link className="nav-link" to="/teacher-dashboard" onClick={closeMenu}>Teacher Dashboard</Link></li>}
                    {userRole === "student" && <li className="nav-item"><Link className="nav-link" to="/student-dashboard" onClick={closeMenu}>Student Dashboard</Link></li>}
                    <li className="nav-item"><Link className="nav-link" to="/contact" onClick={closeMenu}>Contact</Link></li>
                  </>
                )}
                <li className="nav-item">
                  <button className="btn btn-outline-light ms-2" onClick={handleLogout}>Logout</button>
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
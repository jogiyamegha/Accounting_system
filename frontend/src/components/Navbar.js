import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import { useSelector, useDispatch } from "react-redux";

import { clearUser } from "../redux/features/userSlice";

import { ADMIN_END_POINT, CLIENT_END_POINT } from "../utils/constants";
 
export default function Navbar() {
  console.log("navigation");
  const { role, user } = useSelector((state) => state.user);
  console.log(role, user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleLogout = async () => {
    console.log("object Object");
    const endpoint =
      role === "admin"
        ? `${ADMIN_END_POINT}/logout`
        : `${CLIENT_END_POINT}/logout`;

    console.log("endpoint", endpoint);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
      });
      dispatch(clearUser());
      console.log("res in nav", res);

      if (res.ok) {
        console.log("Logout success");
      } else {
        console.warn("Backend logout failed, but local state cleared");
      }
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error", err);

      dispatch(clearUser());
      navigate("/", { replace: true });
    }
  };

  console.log(role);
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h2 className="navbar-logo">Logo</h2>
        <div className="navbar-links">
          <Link to="/" className="nav-link">
            Home
          </Link>

          {!role && (
            <>
              <Link to="/admin/signup" className="nav-link">
                Register
              </Link>
              <Link to="/admin/login" className="nav-link">
                Login
              </Link>
            </>
          )}

          {role === "client" && (
            <Link to="/client/profile" className="nav-link">
              Profile
            </Link>
          )}

          {role === "admin" && (
            <Link to="/admin/dashboard" className="nav-link">
              Dashboard
            </Link>
          )}

          {role && (
            <button onClick={handleLogout} className="nav-link button">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

 
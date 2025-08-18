import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { ADMIN_END_POINT, CLIENT_END_POINT } from "../utils/constants";
import "../styles/navbar.css";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, setUser } from "../redux/features/userSlice";

export default function Navbar() {
  // const [role, setRole] = useState(null);
  const { role, user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check for admin
        let res = await fetch(`${ADMIN_END_POINT}/admin`, {
          method: "GET",
          credentials: "include",
        });

        // console.log("res1",res)

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            dispatch(setUser({ role: "admin" }));
            return;
          }
        }

        // If not admin, check client
        res = await fetch(`${CLIENT_END_POINT}/`, {
          method: "GET",
          credentials: "include",
        });

        // console.log("res2",res)

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            dispatch(setUser({ role: "client" }));
            return;
          }
        }

        // If neither works → not logged in
        dispatch(clearUser());
      } catch (err) {
        dispatch(clearUser());
      }
    };

    fetchUser();
  }, [dispatch]);

  // 🔹 Logout handler
  const handleLogout = async () => {
    try {
      const res = await fetch(`http://localhost:8000/${role}/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        dispatch(clearUser());
        navigate("/"); // redirect after logout
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <h2 className="navbar-logo">Logo</h2>

        {/* Links */}
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

          {role && (
            <>
              <Link to="/client/profile" className="nav-link">
                Profile
              </Link>
            </>
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

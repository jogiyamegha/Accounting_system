import "../styles/sidebar.css";
import logo from "../assets/logo.svg";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../redux/features/userSlice";
import { ADMIN_END_POINT, CLIENT_END_POINT } from "../utils/constants";

export default function Sidebar() {
  const { role } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    const endpoint =
      role === "admin"
        ? `${ADMIN_END_POINT}/logout`
        : `${CLIENT_END_POINT}/logout`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
      });

      dispatch(clearUser());

      if (res.ok) {
        console.log("Logout success");
      } else {
        console.warn("Backend logout failed, but local state cleared");
      }

      navigate("/admin/login", { replace: true });
    } catch (err) {
      console.error("Logout error", err);
      dispatch(clearUser());
      navigate("/", { replace: true });
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header1">
        {/* Example SVG logo */}
        <img src={logo} alt="Logo" className="logo-svg" />
      </div>

      <div className="sidebar-header">
        <h2 style={{ color: "white" }}>Admin Panel</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <a href="/admin/admin-dashboard">📊 Dashboard</a>
          </li>
          <li>
            <a href="/admin/client-management">👥 Client Management</a>
          </li>
          <li>
            <a href="/calendar">📅 Calendar Management</a>
          </li>
          <li>
            <a href="/documents">📂 Document Management</a>
          </li>
          <li>
            <a href="/admin/service-management">🛠 Service Management</a>
          </li>
          <li>
            <a href="/reports">📈 Reports & Insights</a>
          </li>
          <li>
            <a href="/notifications">🔔 Notifications Management</a>
          </li>
          <li>
            <a href="/cms">📝 CMS Management</a>
          </li>
          <li className="logout">
            <button onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

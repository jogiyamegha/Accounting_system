import "../styles/sidebar.css";
import logo from "../assets/logo.svg";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header1">
        {/* Example SVG logo */}
        <img src={logo} alt="Logo" className="logo-svg" />
      </div>

      <div className="sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <a href="/admin/dashboard">📊 Dashboard</a>
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
            <a href="/services">🛠 Service Management</a>
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
            <a href="/logout">🚪 Logout</a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

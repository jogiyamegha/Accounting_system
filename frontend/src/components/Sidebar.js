import { Link } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Admin Panel</div>
      <ul className="sidebar-menu">
        <li><Link to="/admin/dashboard">Dashboard</Link></li>
        <li><Link to="/admin/clients">Clients</Link></li>
        <li><Link to="/admin/documents">Documents</Link></li>
        <li><Link to="/admin/settings">Settings</Link></li>
      </ul>
    </aside>
  );
}

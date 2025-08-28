import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../redux/features/userSlice";
import { ADMIN_END_POINT, CLIENT_END_POINT } from "../utils/constants";

import logo from "../assets/logo.svg";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faUsers,
  faCalendarAlt,
  faFolderOpen,
  faTools,
  faChartBar,
  faBell,
  faPenSquare,
  faSignOutAlt,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

import styles from "../styles/sidebar.module.css";

export default function Sidebar() {
  const { role } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 🔹 Handle resizing logic
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
        setIsOpen(false); // sidebar hidden on mobile by default
      } else {
        setIsMobile(false);
        setIsOpen(true); // sidebar always open on desktop
      }
    };

    handleResize(); // run on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    <>
      {/* 🔹 Hamburger / Close Button (only visible on mobile) */}
      {isMobile && (
        <button
          className={styles.hamburger}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <FontAwesomeIcon icon={isOpen ? faTimes : faBars} size="lg" />
        </button>
      )}

      {/* 🔹 Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.sidebarHeader1}>
          <img src={logo} alt="Logo" className={styles.logoSvg} />
        </div>

        <div className={styles.sidebarHeader}>
          <h2>Admin Panel</h2>
        </div>

        <nav className={styles.sidebarNav}>
          <ul>
            <li>
              <a href="/admin/admin-dashboard">
                <FontAwesomeIcon icon={faChartLine} /> Dashboard
              </a>
            </li>
            <li>
              <a href="/admin/client-management">
                <FontAwesomeIcon icon={faUsers} /> Client Management
              </a>
            </li>
            <li>
              <a href="/admin/calendar-management">
                <FontAwesomeIcon icon={faCalendarAlt} /> Calendar Management
              </a>
            </li>
            <li>
              <a href="/admin/document-management">
                <FontAwesomeIcon icon={faFolderOpen} /> Document Management
              </a>
            </li>
            <li>
              <a href="/admin/service-management">
                <FontAwesomeIcon icon={faTools} /> Service Management
              </a>
            </li>
            <li>
              <a href="/reports">
                <FontAwesomeIcon icon={faChartBar} /> Reports & Insights
              </a>
            </li>
            <li>
              <a href="/notifications">
                <FontAwesomeIcon icon={faBell} /> Notifications Management
              </a>
            </li>
            <li>
              <a href="/cms">
                <FontAwesomeIcon icon={faPenSquare} /> CMS Management
              </a>
            </li>
            <li className={styles.logout}>
              <button onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

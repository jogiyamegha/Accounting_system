import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
    faChartBar,
    faBell,
    faPenSquare,
    faSignOutAlt,
    faBars,
    faTasks,
    faTimes,
    faCog,
} from "@fortawesome/free-solid-svg-icons";

import styles from "../styles/sidebar.module.css";
import { toast } from "react-toastify";

export default function Sidebar() {
    const { role } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isOpen, setIsOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showServiceMenu, setShowServiceMenu] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 568) {
                setIsMobile(true);
                setIsOpen(false);
            } else {
                setIsMobile(false);
                setIsOpen(true);
            }
        };

        handleResize();
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
                toast.success("Logout success");
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || "Backend logout failed");
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
            {/* 🔹 Hamburger / Close Button */}
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

                <nav className={styles.sidebarNav}>
                    <ul>
                        <li>
                            <Link to="/admin/admin-dashboard">
                                <FontAwesomeIcon icon={faChartLine} /> Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/client-management">
                                <FontAwesomeIcon icon={faUsers} /> Client Management
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/calendar-management">
                                <FontAwesomeIcon icon={faCalendarAlt} /> Calendar Management
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/document-management">
                                <FontAwesomeIcon icon={faFolderOpen} /> Document Management
                            </Link>
                        </li>
                        <li
                            className={styles.sidebarItemWithDropdown}
                            onMouseEnter={() => setShowServiceMenu(true)}
                            onMouseLeave={() => setShowServiceMenu(false)}
                        >
                            <div
                                className={styles.sidebarLinkContent}
                                onClick={() => navigate("/admin/service-management")}
                            >
                                <FontAwesomeIcon icon={faTasks} /> Service Management
                            </div>
                        </li>
                        <li>
                            <Link to="/reports">
                                <FontAwesomeIcon icon={faChartBar} /> Reports & Insights
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/notification-management">
                                <FontAwesomeIcon icon={faBell} /> Notifications Management
                            </Link>
                        </li>
                        <li>
                            <Link to="/cms">
                                <FontAwesomeIcon icon={faPenSquare} /> CMS Management
                            </Link>
                        </li>
                        <li>
                            <Link to="/settings">
                                <FontAwesomeIcon icon={faCog} /> Settings
                            </Link>
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

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

    const [showServiceMenu, setShowServiceMenu] = useState(false); // State for Service Management dropdown

    // Event handlers for the Service Management dropdown
    const handleServiceHover = () => {
        setShowServiceMenu(true);
    };

    const handleServiceLeave = () => {
        setShowServiceMenu(false);
    };

    const handleItemClick = (path) => {
        navigate(path);
        // Hide dropdowns after clicking a link
        setShowServiceMenu(false);
    };

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
                toast.success("Logout success")
            } else {
                let errorData = await res.json();
                toast.error(errorData.error || "Backend logout failed");
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

                {/* <div className={styles.sidebarHeader}>
                    <h2>Admin Panel</h2>
                </div> */}

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
                        <li
                            className={styles.sidebarItemWithDropdown}
                            onMouseEnter={handleServiceHover}
                            onMouseLeave={handleServiceLeave}
                        >
                            <div
                                className={styles.sidebarLinkContent}
                                onClick={() => handleItemClick("/admin/service-management")}
                            >
                                <FontAwesomeIcon icon={faTasks} /> Service Management
                            </div>
                            {showServiceMenu && (
                                <ul className={styles.dropdownMenu}>
                                    <li onClick={() => handleItemClick("/admin/service/1")}>VAT Filing</li>
                                    <li onClick={() => handleItemClick("/admin/service/2")}>Corporate Tax</li>
                                    <li onClick={() => handleItemClick("/admin/service/3")}>Payroll</li>
                                    <li onClick={() => handleItemClick("/admin/service/4")}>Audit</li>
                                </ul>
                            )}
                        </li>

                        <li>
                            <a href="/reports">
                                <FontAwesomeIcon icon={faChartBar} /> Reports & Insights
                            </a>
                        </li>
                        <li>
                            <a href="/admin/notification-management">
                                <FontAwesomeIcon icon={faBell} /> Notifications Management
                            </a>
                        </li>
                        <li>
                            <a href="/cms">
                                <FontAwesomeIcon icon={faPenSquare} /> CMS Management
                            </a>
                        </li>

                        <li>
                            <a href="/settings">
                                <FontAwesomeIcon icon={faCog} /> Settings
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

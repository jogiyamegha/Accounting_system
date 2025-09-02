import { Link, useNavigate } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";

import { clearUser } from "../redux/features/userSlice";

import { ADMIN_END_POINT, CLIENT_END_POINT } from "../utils/constants";
import logo from '../assets/logo.svg'

import "../styles/navbar.css";

export default function Navbar() {
    const { role, user } = useSelector((state) => state.user);

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

            navigate("/", { replace: true });
        } catch (err) {
            console.error("Logout error", err);

            dispatch(clearUser());

            navigate("/", { replace: true });
        }
    };

    return (
        <>
            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-logo">
                        {/* Example SVG logo */}
                        <img src={logo} alt="Logo" className="logo-svg" />
                    </div>

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

            {/* Sidebar (below navbar) */}
            <aside className="sidebar">
                <ul>
                    <li>
                        <Link to="/" className="sidebar-link">
                            🏠 Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/about" className="sidebar-link">
                            ℹ️ About
                        </Link>
                    </li>
                    <li>
                        <Link to="/services" className="sidebar-link">
                            ⚙️ Services
                        </Link>
                    </li>
                    <li>
                        <Link to="/contact" className="sidebar-link">
                            📞 Contact
                        </Link>
                    </li>
                </ul>
            </aside>
        </>
    );
}

import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { setUser, setError } from "../../redux/features/userSlice";
import { ADMIN_END_POINT, CLIENT_END_POINT } from "../../utils/constants";
import { Eye, EyeOff } from "lucide-react";

import styles from "../../styles/login.module.css";
import { toast } from "react-toastify";

function Login() {
    const emailInputRef = useRef();
    const passwordInputRef = useRef();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);

    const isAdmin = location.pathname.includes("admin");

    async function submitHandler(event) {
        event.preventDefault();
        const enteredEmail = emailInputRef.current.value.trim();
        const enteredPassword = passwordInputRef.current.value;

        const authData = { email: enteredEmail, password: enteredPassword };

        try {
            const endpoint = isAdmin
                ? `${ADMIN_END_POINT}/login`
                : `${CLIENT_END_POINT}/login`;

            const res = await fetch(endpoint, {
                method: "POST",
                body: JSON.stringify(authData),
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            const data = await res.json();

            if (res.ok && data.user) {
                dispatch(
                    setUser({
                        user: data.user,
                        role: isAdmin ? "admin" : "client",
                        userType: isAdmin ? "admin" : "client",
                        token: data.token || null,
                    })
                );

                toast.success("Login Successfully!")
                navigate(isAdmin ? "/admin/admin-dashboard" : "/client/profile", {
                    replace: true,
                });
            } else {
                dispatch(setError("Login failed"));
                toast.error("Credentials Invalid, Login Failed !!");
            }
        } catch (error) {
            console.error("Login error:", error);
            dispatch(setError("Something went wrong. Please try again."));
            toast.error("Something went wrong. Please try again.");
        }
    }

    return (
        <div className={styles.loginContainer}>
            <h2>{isAdmin ? "Admin Login" : "Client Login"}</h2>
            <form onSubmit={submitHandler} className={styles.loginForm}>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" ref={emailInputRef} required />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="password">Password</label>
                    <div className={styles.passwordInputWrapper}>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            ref={passwordInputRef}
                            required
                        />

                        <span
                            className={styles.eyeIcon}
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </span>
                    </div>
                </div>

                <button type="submit" className={styles.loginButton}>
                    Login
                </button>

                <a
                    href={isAdmin ? "/admin/forgot-password" : "/client/forgot-password"}
                    className={styles.forgotLink}
                >
                    Forgot Password?
                </a>

                {isAdmin ? (
                    <>
                        <Link className={styles.clientLink} to="/client/login">
                            Login as Client
                        </Link>
                        <Link className={styles.clientLink} to="/admin/signup">
                            Sign Up as Admin
                        </Link>
                    </>
                ) : (
                    <>
                        <Link className={styles.adminLink} to="/admin/login">
                            Login as Admin
                        </Link>
                        <Link className={styles.adminLink} to="/client/signup">
                            Sign Up as Client
                        </Link>
                    </>
                )}
            </form>
        </div>
    );
}

export default Login;

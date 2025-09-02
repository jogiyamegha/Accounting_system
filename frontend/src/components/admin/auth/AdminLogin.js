import { useRef } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setUser } from "../../../redux/features/userSlice";
import "../../../styles/login.css";

function AdminLogin() {
    const emailInputRef = useRef();
    const passwordInputRef = useRef();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    async function submitHandler(event) {
        event.preventDefault();
        const enteredEmail = emailInputRef.current.value;
        const enteredPassword = passwordInputRef.current.value;
        const authData = {
            email: enteredEmail,
            password: enteredPassword,
        };
        try {
            const res = await fetch("http://localhost:8000/admin/login", {
                method: "POST",
                body: JSON.stringify(authData),
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // ✅ send & receive cookies
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(setUser(data.user));
                navigate("/");
            } else {
                alert("Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Something went wrong. Please try again.");
        }
    }

    return (
        <div className="login-container">
            <h2>Admin Login</h2>
            <form onSubmit={submitHandler} className="login-form">
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" ref={emailInputRef} required />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        ref={passwordInputRef}
                        required
                    />
                </div>

                <button type="submit" className="login-button">
                    Login
                </button>

                <a href="/admin/forgot-password" className="forgot-link">
                    Forgot Password?
                </a>

                <Link className="client-link" to="/client/login">
                    Login as Client
                </Link>
            </form>
        </div>
    );
}

export default AdminLogin;

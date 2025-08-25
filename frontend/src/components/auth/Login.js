

import { useRef } from "react";

import { useDispatch } from "react-redux";

import { Link, useNavigate, useLocation } from "react-router-dom";

import { setUser, setError } from "../../redux/features/userSlice"; // ✅ also import setError

import { ADMIN_END_POINT, CLIENT_END_POINT } from "../../utils/constants"; // ✅ use ADMIN_END_POINT

import "../../styles/login.css";

function Login() {
  const emailInputRef = useRef();

  const passwordInputRef = useRef();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  // ✅ Detect whether current route is admin login or client login

  const isAdmin = location.pathname.includes("admin");

  async function submitHandler(event) {
    event.preventDefault();
    const enteredEmail = emailInputRef.current.value.trim();

    const enteredPassword = passwordInputRef.current.value;

    const authData = { email: enteredEmail, password: enteredPassword };

    try {
      const endpoint = isAdmin
        ? `${ADMIN_END_POINT}/login` // ✅ use constant
        : `${CLIENT_END_POINT}/login`;

      const res = await fetch(endpoint, {
        method: "POST",

        body: JSON.stringify(authData),

        headers: { "Content-Type": "application/json" },

        credentials: "include", // ✅ for cookies
      });

      const data = await res.json();

      if (res.ok && data.user) {
        // ✅ keep consistent with refactored userSlice

        dispatch(
          setUser({
            user: data.user,

            role: isAdmin ? "admin" : "client",

            userType: isAdmin ? "admin" : "client",

            token: data.token || null, // ✅ optional if backend returns JWT
          })
        );

        // ✅ redirect to proper page

        navigate(isAdmin ? "/admin/admin-dashboard" : "/client/profile", {
          replace: true,
        });
      } else {
        dispatch(setError(data.message || "Login failed"));
        // console.log(data.message);

        alert("Credentials Invalid, Login Failed !!");
      }
    } catch (error) {
      console.error("Login error:", error);

      dispatch(setError("Something went wrong. Please try again."));

      alert("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="login-container">
      <h2>{isAdmin ? "Admin Login" : "Client Login"}</h2>
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

        <a
          href={isAdmin ? "/admin/forgot-password" : "/client/forgot-password"}
          className="forgot-link"
        >
          Forgot Password?
        </a>

        {isAdmin ? (
          <Link className="client-link" to="/client/login">
            Login as Client
          </Link>
        ) : (
          <Link className="admin-link" to="/admin/login">
            Login as Admin
          </Link>
        )}
      </form>
    </div>
  );
}

export default Login;

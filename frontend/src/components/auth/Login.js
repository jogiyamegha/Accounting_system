import { useRef } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { setUser } from "../../redux/features/userSlice";
import { CLIENT_END_POINT } from "../../utils/constants";
import "../../styles/login.css";

function Login() {
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // check from route whether it's admin or client login
  const isAdmin = location.pathname.includes("admin");

  async function submitHandler(event) {
    event.preventDefault();
    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    const authData = {
      email: enteredEmail,
      password: enteredPassword,
    };

    try {
      const endpoint = isAdmin
        ? "http://localhost:8000/admin/login"
        : `${CLIENT_END_POINT}/login`;

      const res = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(authData),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json();
    //   console.log("DATA",data)

      if (res.ok) {
        dispatch(setUser({
            user : data.user,
            role : data.role
        }));
        navigate(isAdmin ? "/admin/dashboard" : "/client/profile");
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
      <h2>{isAdmin ? "Admin Login" : "Client Login"}</h2>
      <form onSubmit={submitHandler} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" ref={emailInputRef} required />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" ref={passwordInputRef} required />
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

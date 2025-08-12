import { useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../../redux/features/userSlice";
import { CLIENT_END_POINT } from "../../../utils/constants";
import '../../../styles/login.css';
 
 
function ClientLogin() {
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
        const res = await fetch(`${CLIENT_END_POINT}/login`, {
            method: "POST",
            body: JSON.stringify(authData),
            headers: {
                "Content-Type": "application/json",
            },
        });
   
        const data = await res.json()
   
        if (res.ok) {
            localStorage.setItem("token", data.token);
   
            dispatch(setUser(data.user));
   
            navigate("/");
            } else {
                alert( "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Something went wrong. Please try again.");
        }
    }
       
    return (
        <div className="login-container">
        <h2>Client Login</h2>
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
           
            <a href="/client/forgot-password" className="forgot-link">
                Forgot Password?
            </a>
            </form>
        </div>
    );
}
 
export default ClientLogin;
 
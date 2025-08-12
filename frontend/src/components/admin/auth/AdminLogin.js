import { useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../../redux/features/userSlice";
 
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
        <form onSubmit={submitHandler}>
            <div>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" ref={emailInputRef} required />
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input type="password" id="password" ref={passwordInputRef} required />
            </div>
            <div>
                <button type="submit">Login</button>
            </div>
            <div>
                <a
                    href="/admin/forgot-password"
                    style={{ fontSize: "14px", color: "#007bff", textDecoration: "none" }}
                >
                Forgot Password?
                </a>
            </div>
        </form>
    );
}
 
export default AdminLogin;
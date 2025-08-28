import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CLIENT_END_POINT } from "../../../utils/constants";
import "../../../styles/forgotPassword.css";
import { toast } from "react-toastify";
 
export default function ClientForgotPassword() {
    const emailInputRef = useRef();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const submitHandler = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
    
        const enteredEmail = emailInputRef.current.value.trim().toLowerCase();
    
        try {
            const response = await fetch(`${CLIENT_END_POINT}/forgot-password`, {
                method: "POST",
                body: JSON.stringify({ email: enteredEmail }),
                headers: { "Content-Type": "application/json" },
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                toast.error("Failed to send OTP")
                throw new Error(errorData.message || "Failed to send OTP");
            }
            
            toast.success("OTP sent to your email, please enter that OTP and verify..")
            navigate("/client/verify-otp", {state : {email: enteredEmail}});
            } catch (err) {
                toast.error("error in sending OTP")
                setError(err.message);
            } finally {
                setLoading(false);
            }
    } 
    return (
        <div className="forgot-container">
        <h2>Forgot Password</h2>
        <form onSubmit={submitHandler} className="forgot-form">
            <p className="forgot-info">Enter your registered email to get OTP</p>
            
            {error && <p className="error-message">{error}</p>}
            
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" ref={emailInputRef} required />
            </div>
            
            <button type="submit" className="forgot-button" disabled={loading}>
                {loading ? "Sending..." : "Get OTP"}
            </button>
        </form>
        </div>
 
    );
}


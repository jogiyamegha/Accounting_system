import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADMIN_END_POINT } from "../../../utils/constants";
 
export default function AdminForgotPassword() {
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
            const response = await fetch(`${ADMIN_END_POINT}/forgot-password`, {
                method: "POST",
                body: JSON.stringify({ email: enteredEmail }),
                headers: { "Content-Type": "application/json" },
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to send OTP");
            }
    
            navigate("/admin/verify-otp", {state : {email: enteredEmail}});
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
    };
    
    return (
        <form onSubmit={submitHandler}>
            <div>
                <p>Enter your registered email to get OTP</p>
            </div>
        
            {error && <p style={{ color: "red" }}>{error}</p>}
        
            <div>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" ref={emailInputRef} required />
            </div>
        
            <div>
                <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Get OTP"}
                </button>
            </div>
        </form>
    );
}


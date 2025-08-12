import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ADMIN_END_POINT } from "../../../utils/constants";
import '../../../styles/verifyOtp.css';
export default function AdminVerifyOtp() {
    const otpInputRef = useRef();
    
    const navigate = useNavigate();
    const location = useLocation()

    const email = location.state?.email || "";
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const submitHandler = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
    
        const enteredOTP = otpInputRef.current.value.trim();
    
        const data = {
            email: email,
            code: enteredOTP,
        };
    
        try {
            const response = await fetch(`${ADMIN_END_POINT}/verify-otp`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                "Content-Type": "application/json",
                },
            });
        

            if (!response.ok) {
                throw new Error( "Invalid OTP");
            }
        
                alert("OTP is Verified Successfully..");
                navigate("/admin/change-password", {state : {email }});
            } catch (error) {

            setError(error.message);
            //   alert("OTP is not Correct..");
        } finally {
        setLoading(false);
        }
    };
    
    return (
        <div className="otp-container">
            <h2>Verify OTP</h2>
            <form onSubmit={submitHandler} className="otp-form">
                <p className="otp-info">Enter the OTP received on your email</p>
                
                {error && <p className="error-message">{error}</p>}
                
                <div className="form-group">
                    <label htmlFor="otp">OTP</label>
                    <input type="text" id="otp" ref={otpInputRef} required />
                </div>
                <button type="submit" className="otp-button" disabled={loading}>
                    {loading ? "Verifying..." : "Verify"}
                </button>
            </form>
        </div>
        
    );
}
 
 
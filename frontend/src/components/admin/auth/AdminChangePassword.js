import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ADMIN_END_POINT } from "../../../utils/constants";
import '../../../styles/changePassword.css';
 
export default function AdminChangePassword() {
    const newPasswordInputRef = useRef();
    const confirmPasswordInputRef = useRef();
    const location = useLocation();
    const email = location.state?.email || "";
    const navigate = useNavigate();
    
    const [error, setError] = useState("");
    
    const submitHandler = async (event) => {
        event.preventDefault();
        setError("");
    
        const enteredNewPassword = newPasswordInputRef.current.value;
        const enteredConfirmPassword = confirmPasswordInputRef.current.value;
    
        if (enteredNewPassword !== enteredConfirmPassword) {
            setError("Passwords do not match!");
            return;
        }
    
        const data = {
            email: email,
            newPassword: enteredNewPassword,
            confirmPassword: enteredConfirmPassword,
        };
    
        try {
            const response = await fetch(`${ADMIN_END_POINT}/change-password`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                "Content-Type": "application/json",
                },
            });
        
            const result = await response.json();
        
            if (!response.ok) {
                throw new Error(result.message || "Failed to set password");
            }
        
            alert("Your New Password is set Successfully..");
            navigate("/admin/login");
        } catch (error) {
            console.error(error);
            setError(error.message);
            //   alert("Something Went Wrong!!");
        }
    };
 
    return (
        <div className="setpass-container">
        <h2>Set New Password</h2>
        <form onSubmit={submitHandler} className="setpass-form">
            <p className="setpass-info">Please set the new password</p>
            <p className="setpass-requirements">
                    It should be 8 characters long & must contain at least 1 uppercase
                    letter, 1 lowercase letter, 1 digit & a special character (@$!%*?&).
            </p>
            {error && <p className="error-message">{error}</p>}

                <div className="form-group">
                <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    placeholder="New Password"
                    ref={newPasswordInputRef}
                    required
                />
        </div>
        
        <div className="form-group">
            <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm Password"
                ref={confirmPasswordInputRef}
                required
            />
        </div>
            <button type="submit" className="setpass-button">
                Set Password
            </button>
        </form>
        </div>
 
    );
}
    
    
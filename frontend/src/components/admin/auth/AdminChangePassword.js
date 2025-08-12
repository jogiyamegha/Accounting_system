import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ADMIN_END_POINT } from "../../../utils/constants";
 
export default function AdminChangePassword() {
    const newPasswordInputRef = useRef();
    const confirmPasswordInputRef = useRef();
    
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";
    
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
        <form onSubmit={submitHandler}>
        <div>
            <p>Please Set the New Password..</p>
            <p>
                It should be 8 character long & must contain atleat 1 uppercase
                letter, a lowercase letter, a digit & a special-character - (@$!%*?&)
            </p>
        </div>
    
        {error && <p style={{ color: "red" }}>{error}</p>}
    
        <div>
            <input
                type="password"
                name="newPassword"
                id="newPassword"
                placeholder="New Password"
                ref={newPasswordInputRef}
                required
            />
        </div>
    
        <div>
            <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm Password"
                ref={confirmPasswordInputRef}
                required
            />
        </div>
    
        <div>
            <button type="submit">Set Password</button>
        </div>
        </form>
    );
}
    
    
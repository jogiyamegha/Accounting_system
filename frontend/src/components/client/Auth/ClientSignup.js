import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { CLIENT_END_POINT } from "../../../utils/constants";
import '../../../styles/signup.css';
 
export default function ClientSignup() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        companyName: "",
    });
    
    const navigate = useNavigate();
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
        if (!passwordRegex.test(formData.password)) {
        alert(
                "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&)."
            );
            return;
        }
    
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
    
        try {
        const response = await fetch(`${CLIENT_END_POINT}/signup`, {
            method: "POST",
            body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            companyName: formData.companyName,
            }),
            headers: {
            "Content-Type": "application/json",
            },
        });
    
        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message || "Signup failed");
            return;
        }
    
        alert("Signup Successful!");
        navigate("/client/login");
        } catch (error) {
            console.error("Error during signup:", error);
            alert("Something went wrong! Please try again.");
        }
    };
    
    return (
        <div className="signup-container">
        <h2>Client Signup</h2>
        <form onSubmit={handleSubmit} className="signup-form">
            <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            />
    
            <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            />
    
            <input
            type="text"
            name="companyName"
            placeholder="Company Name"
            value={formData.companyName}
            onChange={handleChange}
            required
            />
    
            <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            />
    
            <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            />
    
            <button type="submit">Sign Up</button>
            <Link className="login-link" to="/client/login">
            Already Registered
            </Link>
        </form>
        </div>
    );
}
 
 
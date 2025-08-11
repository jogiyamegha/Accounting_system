import { useState } from "react";
import { ADMIN_END_POINT } from "../../../utils/constants";
 
export default function AddClient() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        companyName: "",
    });
    
    const [loading, setLoading] = useState(false);
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            const res = await fetch(`${ADMIN_END_POINT}/add-client`, {
                method: "POST",
                body: JSON.stringify(formData),
                headers: { 
                    "Content-Type": "application/json"
                },
            });
        
            
        
            if (res.ok) {
                alert("Signup Successful!");

                // all clients page will render here
            } else {
                alert("Signup failed. Please try again.");
            }
        } catch (error) {
            alert("Network error. Please try again later.", error);
        } finally {
            setLoading(false);
        }
    };
 
    return (
        <div className="signup-container">
        <h2>Add Client</h2>
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
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
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
            <button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Client"}
            </button>{" "}
      </form>
    </div>
  );
}
 
 
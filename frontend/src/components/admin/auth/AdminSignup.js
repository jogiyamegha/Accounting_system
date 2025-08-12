import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ADMIN_END_POINT } from "../../../utils/constants";
import '../../../styles/signup.css';

export default function AdminSignup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${ADMIN_END_POINT}/signup`, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
          dbuser: true,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Signup failed");
        return;
      }

      alert("Signup Successful!");
      navigate("/admin/login");
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Something went wrong! Please try again.");
    }
  };

  return (
    // <div className="signup-container">
    // <h2>Admin Signup</h2>
    // <form onSubmit={handleSubmit} className="signup-form">
    //     <input
    //         type="text"
    //         name="name"
    //         placeholder="Full Name"
    //         value={formData.name}
    //         onChange={handleChange}
    //         required
    //     />

    //     <input
    //         type="email"
    //         name="email"
    //         placeholder="Email Address"
    //         value={formData.email}
    //         onChange={handleChange}
    //         required
    //     />

    //     <input
    //         type="password"
    //         name="password"
    //         placeholder="Password"
    //         value={formData.password}
    //         onChange={handleChange}
    //         required
    //     />

    //     <button type="submit">Sign Up</button>
    //     <Link className="client-link" to="/client/signup">As Client</Link>
    // </form>
    // </div>
    <div className="signup-container">
      <h2>Admin Signup</h2>
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

        <button type="submit">Sign Up</button>
        <Link className="client-link" to="/client/signup">
            Sign Up as Client
        </Link>
      </form>
    </div>
  );
}

import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { ADMIN_END_POINT, CLIENT_END_POINT } from "../../utils/constants";
import "../../styles/signup.css";

export default function Signup() {
  const { role } = useParams(); // 🔹 dynamic role (admin/client)
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", // only used for client
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔹 Extra validation for client
    if (role === "client") {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!passwordRegex.test(formData.password)) {
        alert(
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
        );
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
    }

    try {
      const endpoint =
        role === "admin" ? `${ADMIN_END_POINT}/signup` : `${CLIENT_END_POINT}/signup`;

      const payload =
        role === "admin"
          ? { name: formData.name, email: formData.email, password: formData.password }
          : formData;

      const headers =
        role === "admin"
          ? { "Content-Type": "application/json", dbuser: true }
          : { "Content-Type": "application/json" };

      const response = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Signup failed");
        return;
      }

      alert("Signup Successful!");
      navigate(`/${role}/login`);
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Something went wrong! Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <h2>{role === "admin" ? "Admin Signup" : "Client Signup"}</h2>
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

        {/* 🔹 confirmPassword only for client */}
        {role === "client" && (
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        )}

        <button type="submit">Sign Up</button>

        <Link className="login-link" to={`/${role}/login`}>
          Already Registered
        </Link>

        {role === "admin" && (
          <Link className="client-link" to="/client/signup">
            Sign Up as Client
          </Link>
        )}
      </form>
    </div>
  );
}

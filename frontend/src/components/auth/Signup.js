import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { ADMIN_END_POINT, CLIENT_END_POINT } from "../../utils/constants";
import { Eye, EyeOff } from "lucide-react";

import styles from "../../styles/signup.module.css";
import { toast } from "react-toastify";

export default function Signup() {
    const { role } = useParams(); // 🔹 dynamic role (admin/client)
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const validateForm = () => {
        if (role === "client") {
            const passwordRegex =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

            if (!passwordRegex.test(formData.password)) {
                toast.warn("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.")
                return "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.";
            }

            if (formData.password !== formData.confirmPassword) {
                toast.error("Passwords do not match.")
                return "Passwords do not match.";
            }
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            const endpoint =
                role === "admin"
                    ? `${ADMIN_END_POINT}/signup`
                    : `${CLIENT_END_POINT}/signup`;

            const payload =
                role === "admin"
                    ? { name: formData.name, email: formData.email, password: formData.password }
                    : formData;

            const headers = {
                "Content-Type": "application/json",
                ...(role === "admin" && { dbuser: true }),
            };

            const response = await fetch(endpoint, {
                method: "POST",
                body: JSON.stringify(payload),
                headers,
            });

            // const data = await response.json();

            if (!response.ok) {
                setError("Signup failed");
                toast.error("SignUp failed!")
                return;
            }

            toast.success("Signup Successful!");
            navigate(`/${role}/login`);
        } catch (error) {
            toast.error("Error during signup");
            console.error("Error during signup:", error);
            setError("Something went wrong! Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.signupContainer}>
            <h2>{role === "admin" ? "Admin Signup" : "Client Signup"}</h2>

            <form onSubmit={handleSubmit} className={styles.signupForm}>
                {error && <p className={styles.errorMessage}>{error}</p>}

                <div className={styles.formGroup}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <div className={styles.passwordInputWrapper}>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <span
                            className={styles.eyeIcon}
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </span>
                    </div>
                </div>

                {role === "client" && (
                    <div className={styles.formGroup}>
                        <div className={styles.passwordInputWrapper}>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <span
                                className={styles.eyeIcon}
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </span>
                        </div>
                    </div>
                )}

                <button type="submit" disabled={loading} className={styles.signupButton}>
                    {loading ? "Signing up..." : "Sign Up"}
                </button>

                <Link className={styles.loginLink} to={`/${role}/login`}>
                    Already Registered? Login
                </Link>

                {role === "admin" && (
                    <Link className={styles.clientLink} to="/client/signup">
                        Sign Up as Client
                    </Link>
                )}
            </form>
        </div>
    );
}

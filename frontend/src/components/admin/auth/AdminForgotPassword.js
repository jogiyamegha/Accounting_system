import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADMIN_END_POINT } from "../../../utils/constants";
import styles from "../../../styles/forgotPassword.module.css";
import { toast } from "react-toastify";

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
        toast.error("Failed to send OTP");

        throw new Error(errorData.message || "Failed to send OTP");
      }
      toast.success(
        `OTP sent successfully to your ${enteredEmail}, please enter OTP and verify..`
      );

      navigate("/admin/verify-otp", { state: { email: enteredEmail } });
    } catch (err) {
      toast.error("Something went wrong");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.forgotContainer}>
      <h2>Forgot Password</h2>
      <form onSubmit={submitHandler} className={styles.forgotForm}>
        <p className={styles.forgotInfo}>
          Enter your registered email to receive an OTP
        </p>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <input type="email" id="email" ref={emailInputRef} required />
        </div>

        <button
          type="submit"
          className={styles.forgotButton}
          disabled={loading}
        >
          {loading ? "Sending..." : "Get OTP"}
        </button>
      </form>
    </div>
  );
}

import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ADMIN_END_POINT } from "../../../utils/constants";
import styles from "../../../styles/changePassword.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

export default function AdminChangePassword() {
  const newPasswordInputRef = useRef();
  const confirmPasswordInputRef = useRef();
  const location = useLocation();
  const email = location.state?.email || "";
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();
    setError("");

    const enteredNewPassword = newPasswordInputRef.current.value;
    const enteredConfirmPassword = confirmPasswordInputRef.current.value;

    if (enteredNewPassword !== enteredConfirmPassword) {
      setError("Passwords do not match!");
      toast.error("password do not match");

      return;
    }

    const data = {
      email,
      newPassword: enteredNewPassword,
      confirmPassword: enteredConfirmPassword,
    };
    let result;
    try {
      const response = await fetch(`${ADMIN_END_POINT}/change-password`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "failed to set password");

        // throw new Error(result.error || "Failed to set password");
      }

      toast.success(" Your new password is set successfully.");
      navigate("/admin/login");
    } catch (error) {
      console.error(error);
      toast.error("Something Went Wrong!!" || error.message);
      setError(error.message);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>🔑 Set New Password</h2>
        <form onSubmit={submitHandler} className={styles.form}>
          <p className={styles.info}>Please set a strong new password</p>
          <p className={styles.requirements}>
            Must be at least <b>8 characters</b> long & include: <br />1
            uppercase, 1 lowercase, 1 digit, and 1 special character (@$!%*?&).
          </p>

          {/* {error && <p className={styles.error}>{error}</p>} */}

          {/* New Password */}
          <div className={styles.inputGroup}>
            <input
              type={showPassword ? "text" : "password"}
              id="newPassword"
              placeholder="New Password"
              ref={newPasswordInputRef}
              required
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              placeholder="Confirm Password"
              ref={confirmPasswordInputRef}
              required
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" className={styles.submitButton}>
            Set Password
          </button>
        </form>
      </div>
    </div>
  );
}

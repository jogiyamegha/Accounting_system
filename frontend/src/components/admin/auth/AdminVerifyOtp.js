import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ADMIN_END_POINT } from "../../../utils/constants";
import styles from "../../../styles/verifyOTP.module.css";
import { toast } from "react-toastify";

export default function AdminVerifyOtp() {
    const otpInputRef = useRef();
    const navigate = useNavigate();
    const location = useLocation();
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
                toast.error("Invalid OTP");

                throw new Error("Invalid OTP");
            }

            toast.success("OTP Verified Successfully");
            navigate("/admin/change-password", { state: { email } });
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.otpWrapper}>
            <div className={styles.otpCard}>
                <h2 className={styles.title}>🔐 Verify OTP</h2>
                <form onSubmit={submitHandler} className={styles.otpForm}>
                    <p className={styles.info}>
                        Please enter the OTP sent to <strong>{email}</strong>
                    </p>

                    {error && <p className={styles.error}>{error}</p>}

                    <div className={styles.formGroup}>
                        <label htmlFor="otp">OTP</label>
                        <input
                            type="text"
                            id="otp"
                            ref={otpInputRef}
                            required
                            placeholder="Enter OTP"
                            maxLength="6"
                        />
                    </div>

                    <button type="submit" className={styles.otpButton} disabled={loading}>
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </form>
            </div>
        </div>
    );
}

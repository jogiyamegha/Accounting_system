import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CLIENT_END_POINT } from "../../../utils/constants";
import { countries } from "../../../utils/countries";
import '../../../styles/profileUpdate.css';
import { useSelector } from "react-redux";

export default function ProfileUpdate() {
    const nameInputRef = useRef();
    const emailInputRef = useRef();
    const phoneCountryInputRef = useRef();
    const phoneNumberInputRef = useRef();
    const navigate = useNavigate();

    const { user } = useSelector(state => state.user); // get registration info

    const [error, setError] = useState("");

    // Prefill name and email from registration
    useEffect(() => {
        if (user) {
            if(nameInputRef.current) nameInputRef.current.value = user.name || "";
            if(emailInputRef.current) emailInputRef.current.value = user.email || "";
        }
    }, [user]);

    const submitHandler = async (event) => {
        event.preventDefault();
        setError("");

        const data = {
            name: nameInputRef.current.value,
            phoneCountry: phoneCountryInputRef.current.value,
            phone: phoneNumberInputRef.current.value,
        };

        try {
            const response = await fetch(`${CLIENT_END_POINT}/client-profile`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error("Failed to set profile");
            }

            alert("Your Profile is set Successfully..");
            navigate("/client/profile");
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    };

    return (
        <form onSubmit={submitHandler}>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <div>
                <p>Please Set the Profile..</p>
                <p>Please first select country type then enter number</p>
            </div>

            {/* Name field - editable */}
            <div>
                <input
                    type="text"
                    placeholder="Full Name"
                    ref={nameInputRef}
                    required
                />
            </div>

            {/* Email field - read-only */}
            <div>
                <input
                    type="email"
                    placeholder="Email Address"
                    ref={emailInputRef}
                    readOnly
                />
            </div>

            {/* Country Dropdown */}
            <div>
                <select
                    ref={phoneCountryInputRef}
                    required
                >
                    <option value="">--Select Country--</option>
                    {countries.map((country, index) => (
                        <option key={index} value={country.code}>
                            {country.name} ({country.code})
                        </option>
                    ))}
                </select>
            </div>

            {/* Phone Number */}
            <div>
                <input
                    type="number"
                    placeholder="Phone Number"
                    ref={phoneNumberInputRef}
                    maxLength={10}
                    onInput={(e) => {
                        e.target.value = e.target.value.replace(/\D/g, "")
                        if(e.target.value.length > 10){
                            e.target.value = e.target.value.slice(0, 10)
                        }
                    }}
                    required
                />
            </div>

            <div>
                <button type="submit">Set Profile</button>
            </div>
        </form>
    );
}

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CLIENT_END_POINT } from "../../../utils/constants";
import { countries } from "../../../utils/countries"; // <-- Imported here
import '../../../styles/profileUpdate.css';
 
export default function ProfileUpdate() {
    const phoneCountryInputRef = useRef();
    const phoneNumberInputRef = useRef();
    //   const nameInputRef = useRef();
    //   const emailInputRef = useRef();
    const navigate = useNavigate();
    
    const [error, setError] = useState("");
    //   const [loading, setLoading] = useState(false);
    
    //   const [userData, setUserData] = useState({
    //     // name: "",
    //     // email: "",
    //     phoneCountry: "",
    //     phone: "",
    //   });
    
    //   useEffect(() => {
    //     const fetchProfile = async () => {
    //       try {
    //         setLoading(true);
    //         const response = await fetch(`${CLIENT_END_POINT}/get-profile`);
    //         const result = await response.json();
    
    //         if (!response.ok) {
    //           throw new Error(result.message || "Failed to fetch profile");
    //         }
    
    //         setUserData(result.data);
    //       } catch (error) {
    //         console.error(error);
    //         setError(error.message);
    //       } finally {
    //         setLoading(false);
    //       }
    //     };
    
    //     fetchProfile();
    //   }, []);
    
    const submitHandler = async (event) => {
        event.preventDefault();
        setError("");
    
        const data = {
        //   name: nameInputRef.current.value,
        //   email: emailInputRef.current.value,
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
    
         console.log("1",response);

        // const result = await response.json();
        // console.log("2",result);
    
        if (!response.ok) {
            throw new Error( "Failed to set profile");
        }
    
            alert("Your Profile is set Successfully..");
            navigate("/client/company-profile");
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    };
    
    return (
        <form onSubmit={submitHandler}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {/* {loading && <p>Loading profile...</p>} */}
    
        <div>
            <p>Please Set the Profile..</p>
            <p>Please first select country type then enter number</p>
        </div>
    
        {/* <div>
            <input
            type="text"
            placeholder="Full Name"
            defaultValue={userData.name}
            ref={nameInputRef}
            required
            />
        </div>
    
        <div>
            <input
            type="email"
            placeholder="Email Address"
            defaultValue={userData.email}
            ref={emailInputRef}
            required
            />
        </div> */}
    
        {/* Country Dropdown from util file */}
        <div>
            <select
            ref={phoneCountryInputRef}
            //   defaultValue={userData.phoneCountry || ""}
                placeholder="Select Country"
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
    
        <div>
            <input
            type="number"
            placeholder="Phone Number"
            //   defaultValue={userData.phone}
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
    
    
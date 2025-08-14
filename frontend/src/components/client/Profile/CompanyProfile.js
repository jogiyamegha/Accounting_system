import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CLIENT_END_POINT } from "../../../utils/constants";
import '../../../styles/company.css';
import { countries } from "../../../utils/countries";

function formatDate(dateStr) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
}
 
export default function CompanyProfile() {
    const companyNameInputRef = useRef();
    const companyEmailInputRef = useRef();
    const addressLine1InputRef = useRef();
    const addressLine2InputRef = useRef();
    const streetInputRef = useRef();
    const landmarkInputRef = useRef();
    const zipcodeInputRef = useRef();
    const cityInputRef = useRef();
    const stateInputRef = useRef();
    const countryInputRef = useRef();
    const licenseTypeInputRef = useRef();
    const licenseNumberInputRef = useRef();
    const licenseIssueDateInputRef = useRef();
    const licenseExpiryInputRef = useRef();
    const startDateInputRef = useRef();
    const endDateInputRef = useRef();
    const taxRegistrationNumberInputRef = useRef();
    const businessTypeInputRef = useRef();
    const contactPersonNameInputRef = useRef();
    const phoneCountryInputRef = useRef();
    const phoneInputRef = useRef();
    
    const navigate = useNavigate();
    const [error, setError] = useState("");
    
        const submitHandler = async (event) => {
            event.preventDefault();
            setError("");
        
            const data = {
                name: companyNameInputRef.current.value,
                email: companyEmailInputRef.current.value,
                addressLine1: addressLine1InputRef.current.value,
                addressLine2: addressLine2InputRef.current.value,
                street: streetInputRef.current.value,
                landmark: landmarkInputRef.current.value,
                zipcode: zipcodeInputRef.current.value,
                city: cityInputRef.current.value,
                state: stateInputRef.current.value,
                country: countryInputRef.current.value,
                licenseType: licenseTypeInputRef.current.value,
                licenseNumber: licenseNumberInputRef.current.value,
                licenseIssueDate: formatDate(licenseIssueDateInputRef.current.value),
                licenseExpiry: formatDate(licenseExpiryInputRef.current.value),
                startDate: formatDate(startDateInputRef.current.value),
                endDate: formatDate(endDateInputRef.current.value),
                taxRegistrationNumber: taxRegistrationNumberInputRef.current.value,
                businessType: businessTypeInputRef.current.value,
                contactPersonName: contactPersonNameInputRef.current.value,
                phoneCountry: phoneCountryInputRef.current.value,
                phone: phoneInputRef.current.value,
            };
    
        try {

            console.log(data);
            const response = await fetch(`${CLIENT_END_POINT}/company-profile`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
            });
        
            console.log(response);
            
            if (!response.ok) {
                throw new Error( "Failed to set company details");
            }
        
            alert("Your Company Details are set successfully.");
            navigate("/client/document");
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    };
    
    return (
        <div className="form-container">
        <h2 className="form-title">Fill Company Details</h2>
        <form onSubmit={submitHandler} className="common-form">
            {error && <p className="error-message">{error}</p>}
    
            <div className="form-group">
            <label>Company Name</label>
            <input type="text" ref={companyNameInputRef} required />
            </div>
    
            <div className="form-group">
            <label>Company Email</label>
            <input type="email" ref={companyEmailInputRef} required />
            </div>
    
            <div className="form-group">
            <label>Address Line 1</label>
            <input type="text" ref={addressLine1InputRef} required />
            </div>
    
            <div className="form-group">
            <label>Address Line 2</label>
            <input type="text" ref={addressLine2InputRef} />
            </div>
    
            <div className="form-group">
            <label>Street</label>
            <input type="text" ref={streetInputRef} required />
            </div>
    
            <div className="form-group">
            <label>Landmark</label>
            <input type="text" ref={landmarkInputRef} />
            </div>
    
            <div className="form-group">
            <label>Zip Code</label>
            <input
                type="text"
                ref={zipcodeInputRef}
                maxLength={6}
                onInput={(e) => {
                e.target.value = e.target.value.replace(/\D/g, "");
                if (e.target.value.length > 6) {
                    e.target.value = e.target.value.trim(0, 6);
                }
                }}
                required
            />
            </div>
    
            <div className="form-group">
            <label>City</label>
            <input type="text" ref={cityInputRef} required />
            </div>
    
            <div className="form-group">
            <label>State</label>
            <input type="text" ref={stateInputRef} required />
            </div>
    
            <div className="form-group">
            <label>Country</label>
            <input type="text" ref={countryInputRef} required />
            </div>
    
            <div className="form-group">
            <label>License Type</label>
            <select ref={licenseTypeInputRef} required>
                <option value="">--Select License Type--</option>
                <option value="Trade License">Trade License</option>
                <option value="Industrial License">Industrial License</option>
                <option value="Professional License">Professional License</option>
                <option value="Commercial License">Commercial License</option>
            </select>
            </div>
    
            <div className="form-group">
            <label>License Number</label>
            <input type="text" ref={licenseNumberInputRef} required />
            </div>
    
            <div className="form-group">
            <label>License Issue Date</label>
            <input type="date" ref={licenseIssueDateInputRef} required />
            </div>
    
            <div className="form-group">
            <label>License Expiry Date</label>
            <input type="date" ref={licenseExpiryInputRef} required />
            </div>
    
            <div className="form-group">
            <label>Start Date</label>
            <input type="date" ref={startDateInputRef} />
            </div>
    
            <div className="form-group">
            <label>End Date</label>
            <input type="date" ref={endDateInputRef} />
            </div>
    
            <div className="form-group">
            <label>Tax Registration Number</label>
            <input type="text" ref={taxRegistrationNumberInputRef} 
            maxLength={15}
                onInput={(e) => {
                e.target.value = e.target.value.replace(/\D/g, "");
                if (e.target.value.length > 15) {
                    e.target.value = e.target.value.trim(0, 15);
                }
                }}
            
            />
            </div>
    
            <div className="form-group">
            <label>Business Type</label>
            <select ref={businessTypeInputRef} required>
                <option value="">--Select Business Type--</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="Corporation">Corporation</option>
                <option value="LLC">Limited Liability Company (LLC)</option>
                <option value="Non-Profit">Non-Profit</option>
            </select>
            </div>
    
            <div className="form-group">
            <label>Contact Person Name</label>
            <input type="text" ref={contactPersonNameInputRef} required />
            </div>
    
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
    
            <div className="form-group">
            <label>Phone Number</label>
            <input
                type="text"
                ref={phoneInputRef}
                maxLength={10}
                onInput={(e) => {
                e.target.value = e.target.value.replace(/\D/g, "");
                if (e.target.value.length > 10) {
                    e.target.value = e.target.value.trim(0, 10);
                }
                }}
                required
            />
            </div>
    
            <button type="submit" className="submit-btn">
            Submit Company Details
            </button>
        </form>
        </div>
    );
}
    
    
    
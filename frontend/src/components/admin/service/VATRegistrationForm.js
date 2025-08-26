import { useState } from "react";
 
export default function VATRegistrationForm() {
    const [step, setStep] = useState(1); // step wizard
    const [authority, setAuthority] = useState("");
    const [businessOwnerType, setBusinessOwnerType] = useState(""); // Legal or Natural
    const [hasIncorpCert, setHasIncorpCert] = useState(null);
 
    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);
 
    return (
        <div className="form-container">
        <h2>VAT Registration Form</h2>
 
        {/* Step 1: Trade License */}
        {step === 1 && (
            <form
            onSubmit={(e) => {
                e.preventDefault();
                alert("Details saved successfully!");
                nextStep();
            }}
            >
            <h3>Trade License Details</h3>
            <div className="form-group">
                <label>Issuing Authority</label>
                <select
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
                required
                >
                <option value="">-- Select Authority --</option>
                <option value="DED Dubai">DED Dubai</option>
                <option value="Sharjah Economic Dept">Sharjah Economic Dept</option>
                <option value="Abu Dhabi Dept">Abu Dhabi Dept</option>
                <option value="Other">Other</option>
                </select>
            </div>
 
            <div className="form-group">
                <label>Trade License Number</label>
                <input type="text" required />
            </div>
 
            <div className="form-group">
                <label>Issue Date</label>
                <input type="date" required />
            </div>
 
            <div className="form-group">
                <label>Upload Trade License</label>
                <input type="file" required />
            </div>
 
            <button type="submit">Save Details</button>
            </form>
        )}
 
        {/* Step 2: Business Owner */}
        {step === 2 && (
            <div>
            <h3>Business Owner Details</h3>
            <div>
                <label>
                <input
                    type="radio"
                    name="ownerType"
                    value="Legal"
                    checked={businessOwnerType === "Legal"}
                    onChange={(e) => setBusinessOwnerType(e.target.value)}
                />{" "}
                Legal Person
                </label>
                <label style={{ marginLeft: "15px" }}>
                <input
                    type="radio"
                    name="ownerType"
                    value="Natural"
                    checked={businessOwnerType === "Natural"}
                    onChange={(e) => setBusinessOwnerType(e.target.value)}
                />{" "}
                Natural Person
                </label>
            </div>
 
            {/* Legal Person Form */}
            {businessOwnerType === "Legal" && (
                <form
                onSubmit={(e) => {
                    e.preventDefault();
                    alert("Owner (Legal Person) details saved successfully!");
                    nextStep();
                }}
                >
                <div className="form-group">
                    <label>Owner Name</label>
                    <input type="text" required />
                </div>
                <div className="form-group">
                    <label>Trade License Authority</label>
                    <input type="text" required />
                </div>
                <div className="form-group">
                    <label>Trade License Number</label>
                    <input type="text" required />
                </div>
                <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="date" required />
                </div>
                <div className="form-group">
                    <label>Upload Trade License Document</label>
                    <input type="file" required />
                </div>
                <button type="submit">Save</button>
                </form>
            )}
 
            {/* Natural Person Form */}
            {businessOwnerType === "Natural" && (
                <form
                onSubmit={(e) => {
                    e.preventDefault();
                    alert("Owner (Natural Person) details saved successfully!");
                    nextStep();
                }}
                >
                <div className="form-group">
                    <label>Owner Name</label>
                    <input type="text" required />
                </div>
                <div className="form-group">
                    <label>Resident of UAE?</label>
                    <input type="radio" name="resident" value="Yes" /> Yes
                    <input type="radio" name="resident" value="No" /> No
                </div>
                <div className="form-group">
                    <label>Emirates ID Number</label>
                    <input type="text" />
                </div>
                <div className="form-group">
                    <label>Emirates ID Expiry</label>
                    <input type="date" />
                </div>
                <div className="form-group">
                    <label>Upload Emirates ID</label>
                    <input type="file" />
                </div>
                <div className="form-group">
                    <label>Passport Number</label>
                    <input type="text" required />
                </div>
                <div className="form-group">
                    <label>Passport Expiry</label>
                    <input type="date" required />
                </div>
                <div className="form-group">
                    <label>Upload Passport</label>
                    <input type="file" required />
                </div>
                <button type="submit">Save</button>
                </form>
            )}
            </div>
        )}
 
        {/* Step 3: Incorporation Certificate */}
        {step === 3 && (
            <div>
            <h3>Incorporation Certificate</h3>
            <p>Do you have an incorporation certificate?</p>
            <label>
                <input
                type="radio"
                name="incorp"
                value="Yes"
                onChange={() => setHasIncorpCert(true)}
                />{" "}
                Yes
            </label>
            <label style={{ marginLeft: "15px" }}>
                <input
                type="radio"
                name="incorp"
                value="No"
                onChange={() => setHasIncorpCert(false)}
                />{" "}
                No
            </label>
 
            {hasIncorpCert === true && (
                <div className="form-group">
                <label>Upload Incorporation Certificate</label>
                <input type="file" />
                </div>
            )}
 
            <div className="form-group">
                <label>Upload Partnership Document</label>
                <input type="file" />
            </div>
 
            <button onClick={nextStep}>Save & Next</button>
            </div>
        )}
 
        {/* Step 4: Manager Details */}
        {step === 4 && (
            <form
            onSubmit={(e) => {
                e.preventDefault();
                alert("Manager details saved successfully!");
                nextStep();
            }}
            >
            <h3>Manager Details</h3>
            <div className="form-group">
                <label>Manager Name</label>
                <input type="text" required />
            </div>
            <div className="form-group">
                <label>Nationality</label>
                <input type="text" required />
            </div>
            <div className="form-group">
                <label>Passport Number</label>
                <input type="text" required />
            </div>
            <div className="form-group">
                <label>Passport Expiry</label>
                <input type="date" required />
            </div>
            <div className="form-group">
                <label>Upload Passport</label>
                <input type="file" required />
            </div>
            <div className="form-group">
                <label>Manager is Resident of UAE?</label>
                <input type="radio" name="mgrResident" value="Yes" /> Yes
                <input type="radio" name="mgrResident" value="No" /> No
            </div>
            <div className="form-group">
                <label>Emirates ID (if resident)</label>
                <input type="text" />
            </div>
            <div className="form-group">
                <label>Upload Emirates ID</label>
                <input type="file" />
            </div>
            <button type="submit">Save & Next</button>
            </form>
        )}
 
        {/* Step 5: Business Contact Details */}
        {step === 5 && (
            <form
            onSubmit={(e) => {
                e.preventDefault();
                alert("Business contact details saved successfully!");
                nextStep();
            }}
            >
            <h3>Business Contact Details</h3>
            <div className="form-group">
                <label>Business Address</label>
                <input type="text" required />
            </div>
            <div className="form-group">
                <label>PO Box</label>
                <input type="text" required />
            </div>
            <div className="form-group">
                <label>Emirate</label>
                <select required>
                <option value="">-- Select Emirate --</option>
                <option>Dubai</option>
                <option>Abu Dhabi</option>
                <option>Sharjah</option>
                <option>Ajman</option>
                <option>Ras Al Khaimah</option>
                <option>Fujairah</option>
                <option>Umm Al Quwain</option>
                </select>
            </div>
            <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" required />
            </div>
            <button type="submit">Save & Next</button>
            </form>
        )}
 
        {/* Step 6: Bank Details */}
        {step === 6 && (
            <form
            onSubmit={(e) => {
                e.preventDefault();
                alert("Bank details saved successfully!");
                nextStep();
            }}
            >
            <h3>Bank Details</h3>
            <div className="form-group">
                <label>IBAN</label>
                <input type="text" required />
            </div>
            <div className="form-group">
                <label>BIC</label>
                <input type="text" required />
            </div>
            <div className="form-group">
                <label>Bank Name</label>
                <input type="text" required />
            </div>
            <div className="form-group">
                <label>Branch Name</label>
                <input type="text" required />
            </div>
            <div className="form-group">
                <label>Account Holder Name</label>
                <input type="text" required />
            </div>
            <div className="form-group">
                <label>Account Number</label>
                <input type="text" required />
            </div>
            <button type="submit">Save & Next</button>
            </form>
        )}
 
        {/* Step 7: VAT Registration */}
        {step === 7 && (
            <form
            onSubmit={(e) => {
                e.preventDefault();
                alert("VAT Registration details saved successfully!");
                nextStep();
            }}
            >
            <h3>VAT Registration Details</h3>
            <div className="form-group">
                <label>Primary Activity of Business</label>
                <select required>
                <option value="">-- Select Activity --</option>
                <option>Trading</option>
                <option>Services</option>
                <option>Manufacturing</option>
                </select>
            </div>
            <div className="form-group">
                <label>Turnover (Last 12 months)</label>
                <input type="number" required />
            </div>
            <div className="form-group">
                <label>Upload Turnover / Expense Evidence</label>
                <input type="file" required />
            </div>
            <div className="form-group">
                <label>Expected Turnover (Next 30 days)</label>
                <input type="number" required />
            </div>
            <div className="form-group">
                <label>Expenses (Last 12 months)</label>
                <input type="number" />
            </div>
            <div className="form-group">
                <label>Expected Expenses</label>
                <input type="number" />
            </div>
            <div className="form-group">
                <p>Do you expect VAT on expenses to regularly exceed VAT on supplies?</p>
                <input type="radio" name="vatCompare" value="Yes" /> Yes
                <input type="radio" name="vatCompare" value="No" /> No
            </div>
            <div className="form-group">
                <p>Do you also expect to make exempt supply?</p>
                <input type="radio" name="exemptSupply" value="Yes" /> Yes
                <input type="radio" name="exemptSupply" value="No" /> No
            </div>
            <button type="submit">Save & Finish</button>
            </form>
        )}
 
        {/* Final Step */}
        {step === 8 && (
            <div>
            <h2>✅ VAT Registration Completed</h2>
            <p>Your details have been submitted successfully.</p>
            </div>
        )}
 
        {step > 1 && step < 8 && (
            <button style={{ marginTop: "15px" }} onClick={prevStep}>
            Back
            </button>
        )}
        </div>
    );
}
 
 
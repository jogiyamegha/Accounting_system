// import React, { useState } from "react";
// import { BusinessType } from "../../../utils/constants";

// function VATRegistrationForm() {
//     const [vatLiable, setVatLiable] = useState(""); // yes/no
//     const [formData, setFormData] = useState({
//         businessName: "",
//         tradeName : '',
//         tradeLicenseNumber: "",
//         ownerName: "",
//         email: "",
//         annualTurnover: "",
//         tradeLicenseFile: null,
//         idProofFile: null,
//         bankStatementFile: null,
//     });

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };

//     // Handle file upload changes
//     const handleFileChange = (e) => {
//         const { name, files } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: files[0] }));
//     };

//     // Submit form
//     const handleSubmit = (e) => {
//         e.preventDefault();
//         console.log("Form submitted:", formData, "VAT liable:", vatLiable);
//         alert("VAT Registration Form Submitted Successfully!");
//     };

//     return (
//         <div style={{ maxWidth: "600px", margin: "20px auto" }}>
//         <h2>VAT Registration Form</h2>
//         <form onSubmit={handleSubmit}>
//             <h3>Business Details</h3>
//             <div>
//                 <label>Business Name</label>
//                 <input
//                     type="text"
//                     name="businessName"
//                     value={formData.businessName}
//                     onChange={handleChange}
//                     required
//                 />
//             </div>
//             <div>
//                 <label>Business Type</label>
//                 <select
//                     name="phoneCountry"
//                     value={client.phoneCountry}
//                     onChange={handleClientChange}
//                     required
//                 >
//                     <option value="">--Country Code--</option>
//                         {countries.map((c) => (
//                             <option key={`${c.code}-${c.name}`} value={c.code}>
//                                 {c.name} ({c.code})
//                             </option>
//                         ))}
//                 </select>
//             </div>

//             <div>
//             <label>Trade License Number:</label>
//             <input
//                 type="text"
//                 name="tradeLicenseNumber"
//                 value={formData.tradeLicenseNumber}
//                 onChange={handleChange}
//                 required
//             />
//             </div>
//             <div>
//             <label>Owner Name:</label>
//             <input
//                 type="text"
//                 name="ownerName"
//                 value={formData.ownerName}
//                 onChange={handleChange}
//                 required
//             />
//             </div>
//             <div>
//                 <label>Email:</label>
//                 <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     required
//                 />
//             </div>
//             <div>
//             <label>Annual Turnover (AED):</label>
//             <input
//                 type="number"
//                 name="annualTurnover"
//                 value={formData.annualTurnover}
//                 onChange={handleChange}
//                 required
//             />
//             </div>

//             {/* VAT Liable Radio */}
//             <div>
//             <label>Are you liable for VAT?</label>
//             <input
//                 type="radio"
//                 name="vatLiable"
//                 value="yes"
//                 checked={vatLiable === "yes"}
//                 onChange={() => setVatLiable("yes")}
//             />
//             Yes
//             <input
//                 type="radio"
//                 name="vatLiable"
//                 value="no"
//                 checked={vatLiable === "no"}
//                 onChange={() => setVatLiable("no")}
//             />
//             No
//             </div>

//             {/* Conditional Uploads */}
//             {vatLiable === "yes" && (
//             <div style={{ marginTop: "15px" }}>
//                 <h4>Required Documents</h4>

//                 <div>
//                 <label>Upload Trade License:</label>
//                 <input
//                     type="file"
//                     name="tradeLicenseFile"
//                     onChange={handleFileChange}
//                     required
//                 />
//                 </div>

//                 <div>
//                 <label>Upload ID Proof (Owner/Shareholder):</label>
//                 <input
//                     type="file"
//                     name="idProofFile"
//                     onChange={handleFileChange}
//                     required
//                 />
//                 </div>

//                 <div>
//                 <label>Upload Bank Statement:</label>
//                 <input
//                     type="file"
//                     name="bankStatementFile"
//                     onChange={handleFileChange}
//                     required
//                 />
//                 </div>
//             </div>
//             )}

//             {/* Submit Button */}
//             <div style={{ marginTop: "20px" }}>
//             <button type="submit">Submit Registration</button>
//             </div>
//         </form>
//         </div>
//     );
// }

// export default VATRegistrationForm;

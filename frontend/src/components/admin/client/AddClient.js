import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADMIN_END_POINT } from "../../../utils/constants";
import { countries } from "../../../utils/countries";
import classes from "../../../styles/addClient.module.css";
import Sidebar from "../../Sidebar";
 
export default function AddClient() {
  const navigate = useNavigate();
 
  const [client, setClient] = useState({
    name: "",
    email: "",
    phoneCountry: "",
    phone: "",
    position: "",
  });
 
  const [company, setCompany] = useState({
    companyName: "",
    companyEmail: "",
    addressLine1: "",
    addressLine2: "",
    street: "",
    landmark: "",
    zipcode: "",
    city: "",
    state: "",
    country: "",
    licenseType: "",
    licenseNumber: "",
    licenseIssueDate: "",
    licenseExpiry: "",
    taxRegistrationNumber: "",
    businessType: "",
    startDate: "",
    endDate: "",
  });
 
  const documentTypes = [
    "VATcertificate",
    "CorporateTaxDocument",
    "BankStatement",
    // "DrivingLicense",
    "Invoice",
    "auditFiles",
    "TradeLicense",
    "passport",
    "FinancialStatements",
    "BalanceSheet",
    "Payroll",
    "WPSReport",
    "ExpenseReciept",
    "Other",
  ];
 
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  const handleClientChange = (e) => {
    const { name, value } = e.target;
 
    // Validation for name & position (only alphabets and spaces)
    if ((name === "name" || name === "position") && /\d/.test(value)) {
      return; // prevent numbers
    }
 
    setClient({ ...client, [name]: value });
  };
 
  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
 
    setCompany((prev) => {
      let updated = { ...prev, [name]: value };
 
      // Validation: companyName & landmark should not contain numbers
      if ((name === "companyName" || name === "landmark") && /\d/.test(value)) {
        return prev;
      }
 
      // Zip code → only digits & length 6
      if (name === "zipcode") {
        if (!/^\d{0,6}$/.test(value)) return prev; // block non-digits
      }
 
      // Tax registration number → max 15 digits
      if (name === "taxRegistrationNumber") {
        if (!/^\d{0,15}$/.test(value)) return prev;
      }
 
      // // License expiry should not be earlier than issue date
      // if (
      //   name === "licenseExpiry" &&
      //   updated.licenseIssueDate &&
      //   value < updated.licenseIssueDate
      // ) {
      //   alert("License expiry date cannot be earlier than issue date!");
      //   return prev;
      // }
 
      // License issue date should not be in future
      if (name === "licenseIssueDate") {
        const today = new Date().toISOString().split("T")[0];
        if (value > today) {
          alert("License issue date cannot be in the future!");
          return prev;
        }
      }

      // if (
      //   name === "endDate" &&
      //   updated.startDate &&
      //   value < updated.startDate
      // ) {
      //   alert("Financial End date cannot be earlier than start date!");
      //   return prev;
      // }
 
      return updated;
    });
  };
 
  const handleAddDocument = () =>
    setDocuments((prev) => [...prev, { documentType: "", file: null }]);
 
  const handleDocumentChange = (index, field, value) => {
    setDocuments((prev) =>
      prev.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc))
    );
  };
 
  const handleRemoveDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
 
    // Final validation before submit
    if (company.zipcode.length !== 6) {
      return setError("Zipcode must be exactly 6 digits.");
    }
    if (company.taxRegistrationNumber.length !== 15) {
      return setError("Tax Registration Number must be exactly 15 digits.");
    }
 
    setLoading(true);
 
    try {
      const merged = Object.assign({}, client, company);
      const formData = new FormData();
 
      for (const [key, value] of Object.entries(merged)) {
        formData.append(key, value);
      }
 
      documents.forEach((doc, index) => {
        // console.log(doc)
        formData.append(`documents[${index}][file]`, doc.file);
        formData.append(
          `documents[${index}][documentType]`,
          doc.documentType
        );
      });
 
      const response = await fetch(`${ADMIN_END_POINT}/add-client`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
 
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to add client");
      }
 
      alert("Client added successfully!");
      navigate("/admin/client-management");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className={classes.addClientContainer}>
      <Sidebar />
 
      {error && <p className={classes.errorMessage}>{error}</p>}
 
      <form onSubmit={handleSubmit} className={classes.addClientForm}>
        <h2>Add New Client</h2>
        {/* Client Info */}
        <div className={classes.cardSection}>
          <h3>Client Info</h3>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={client.name}
            onChange={handleClientChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={client.email}
            onChange={handleClientChange}
            required
          />
          <input
            type="text"
            name="position"
            placeholder="Position"
            value={client.position}
            onChange={handleClientChange}
            required
          />
          <select
            name="phoneCountry"
            value={client.phoneCountry}
            onChange={handleClientChange}
            required
          >
            <option value="">--Country Code--</option>
            {countries.map((c) => (
              <option key={`${c.code}-${c.name}`} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
          <input
            type="number"
            name="phone"
            placeholder="Contact Number"
            value={client.phone}
            onChange={handleClientChange}
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
 
        {/* Company Info */}
        <div className={classes.cardSection}>
          <h3>Company Info</h3>
          <input
            type="text"
            name="companyName"
            placeholder="Company Name"
            value={company.companyName}
            onChange={handleCompanyChange}
            required
          />
          <input
            type="email"
            name="companyEmail"
            placeholder="Company Email"
            value={company.companyEmail}
            onChange={handleCompanyChange}
            required
          />
          <input
            type="text"
            name="addressLine1"
            placeholder="Address Line 1"
            value={company.addressLine1}
            onChange={handleCompanyChange}
            required
          />
          <input
            type="text"
            name="addressLine2"
            placeholder="Address Line 2 (Optional)"
            value={company.addressLine2}
            onChange={handleCompanyChange}
          />
          <input
            type="text"
            name="street"
            placeholder="Street (Optional)"
            value={company.street}
            onChange={handleCompanyChange}
          />
          <input
            type="text"
            name="landmark"
            placeholder="Landmark (Optional)"
            value={company.landmark}
            onChange={handleCompanyChange}
          />
          <input
            type="text"
            name="zipcode"
            placeholder="Zip Code"
            value={company.zipcode}
            onChange={handleCompanyChange}
            required
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={company.city}
            onChange={handleCompanyChange}
            required
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={company.state}
            onChange={handleCompanyChange}
            required
          />
          <select
            name="country"
            value={company.country}
            onChange={handleCompanyChange}
            required
          >
            <option value="">--Select Country--</option>
            {countries.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="licenseType"
            value={company.licenseType}
            onChange={handleCompanyChange}
            required
          >
            <option value="">--Select License Type--</option>
            <option value="Trade License">Trade License</option>
            <option value="Industrial License">Industrial License</option>
            <option value="Professional License">Professional License</option>
            <option value="Commercial License">Commercial License</option>
          </select>
          <input
            type="text"
            name="licenseNumber"
            placeholder="License Number"
            value={company.licenseNumber}
            onChange={handleCompanyChange}
            required
          />
          <label>License Issue Date :</label>
          <input
            type="date"
            name="licenseIssueDate"
            value={company.licenseIssueDate}
            onChange={handleCompanyChange}
            required
            max={new Date().toISOString().split("T")[0]} // prevent future dates
          />
          <select
            name="businessType"
            value={company.businessType}
            onChange={handleCompanyChange}
            required
          >
            <option value="">--Select Business Type--</option>
            <option value="Sole Proprietorship">Sole Proprietorship</option>
            <option value="Partnership">Partnership</option>
            <option value="Corporation">Corporation</option>
            <option value="LLC">LLC</option>
            <option value="Non-Profit">Non-Profit</option>
            <option value="Private Limited">Private Limited</option>
          </select>
          <label>License Expiry Date :</label>
          <input
            type="date"
            name="licenseExpiry"
            value={company.licenseExpiry}
            onChange={handleCompanyChange}
            required
            min={
              company.licenseIssueDate
                ? company.licenseIssueDate
                : new Date().toISOString().split("T")[0]
            }
          />
          <input
            type="text"
            name="taxRegistrationNumber"
            placeholder="Tax Registration Number"
            value={company.taxRegistrationNumber}
            onChange={handleCompanyChange}
            required
          />

            <>
            </>
          <label>Financial Year Start Date :</label>
          <input
            type="date"
            name="startDate"
            value={company.startDate}
            onChange={handleCompanyChange}
            required
            max={new Date().toISOString().split("T")[0]} // prevent future dates
          />

          <label>Financial Year End Date :</label>
          <input
            type="date"
            name="endDate"
            value={company.endDate}
            onChange={handleCompanyChange}
            required
            min={
              company.startDate
                ? company.startDate
                : new Date().toISOString().split("T")[0]
            }
          />

        </div>
 
        {/* Documents */}
        <div className={classes.cardSection}>
          <h3>Upload Documents</h3>
          <button
            type="button"
            className={classes.btnAddDocument}
            onClick={handleAddDocument}
          >
            + Add Document
          </button>
          {documents.map((doc, index) => (
            <div key={index} className={classes.documentBlock}>
              <select
                value={doc.documentType}
                onChange={(e) =>
                  handleDocumentChange(index, "documentType", e.target.value)
                }
                required
              >
                <option value="">--Select Document Type--</option>
                {documentTypes.map((type) => (
                  <option key={type.trim()} value={type.trim()}>
                    {type.trim()}
                  </option>
                ))}
              </select>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) =>
                  handleDocumentChange(index, "file", e.target.files[0])
                }
                required
              />
              <button
                type="button"
                className={classes.addBtn}
                onClick={() => handleRemoveDocument(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
 
        <div style={{ width: "100%" }}>
          <button  type="submit" disabled={loading}>
            {loading ? "Adding..." : "+ Add Client"}
          </button>
        </div>
      </form>
    </div>
  );
}
 
 
 
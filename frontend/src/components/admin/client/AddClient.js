import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADMIN_END_POINT, formDataToJSON } from "../../../utils/constants";
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
  });

  const documentTypes = [
    "VATcertificate",
    "CorporateTaxDocument",
    "BankStatement",
    "DrivingLicense",
    "Invoice",
    "auditFiles",
    "TradeLicense",
    "passport",
    "Other",
  ];

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClientChange = (e) =>
    setClient({ ...client, [e.target.name]: e.target.value });

  const handleCompanyChange = (e) =>
    setCompany({ ...company, [e.target.name]: e.target.value });

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
    setLoading(true);

    try {
      //   console.log("client",client)

      // console.log("company",company)

      console.log("docs", documents);

      const merged = Object.assign({}, client, company);
      console.log(merged);

      const formData = new FormData();

      for (const [key, value] of Object.entries(merged)) {
        formData.append(key, value);
      }

      documents.forEach((doc, index) => {
        formData.append(`documents[${index}][file]`, doc.file);
        formData.append(`documents[${index}][documentType]`, doc.documentType);
      });

      console.log([...formData.entries()]);

      // ✅ Send FormData directly
      const response = await fetch(`${ADMIN_END_POINT}/add-client`, {
        method: "POST",
        // body: formData,
        body: formData,
        // headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to add client");
      }

      // const data = await response.json();
      // console.log("3", data);
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
        {/* Client Info Card */}
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
            required
          />
        </div>

        {/* Company Info Card */}
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
              <option key={`${c.name}`} value={c.name}>
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
          <label>licenseIssueDate</label>
          <input
            type="date"
            name="licenseIssueDate"
            value={company.licenseIssueDate}
            onChange={handleCompanyChange}
            required
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
          </select>

          <label>licenseIssueDate</label>
          <input
            type="date"
            name="licenseExpiry"
            value={company.licenseExpiry}
            onChange={handleCompanyChange}
            required
          />
          <input
            type="text"
            name="taxRegistrationNumber"
            placeholder="Tax Registration Number"
            value={company.taxRegistrationNumber}
            onChange={handleCompanyChange}
            maxLength={15}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/\D/g, "");
              if (e.target.value.length > 15) {
                e.target.value = e.target.value.trim(0, 15);
              }
            }}
            required
          />
        </div>

        {/* Documents Card */}
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
              +{" "}
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
                className="btn-remove-document"
                onClick={() => handleRemoveDocument(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Submit button */}
        <div style={{ width: "100%" }}>
          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Client"}
          </button>
        </div>
      </form>
    </div>
  );
}

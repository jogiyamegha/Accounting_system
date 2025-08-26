import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ADMIN_END_POINT, docTypeMap } from "../../../utils/constants";
import { countries } from "../../../utils/countries";
import classes from "../../../styles/addClient.module.css";
import Sidebar from "../../Sidebar";

function formatForDateInput(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

export default function EditClient() {
  const navigate = useNavigate();
  const { clientId } = useParams();

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

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  /** Fetch client details **/
  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${ADMIN_END_POINT}/client-detail/${clientId}`,
          { credentials: "include" }
        );
        if (!response.ok) throw new Error("Failed to fetch client details");

        const data = await response.json();
        // console.log("data",data)

        // assuming API response shape { client, company, documents }
        setClient({
          name: data.client?.name || "",
          email: data.client?.email || "",
          phoneCountry: data.client.contact?.phoneCountry || "",
          phone: data.client.contact?.phone || "",
          position: data.client?.position || "",
        });

        setCompany({
          companyName: data.company?.name || "",
          companyEmail: data.company?.email || "",
          addressLine1: data.company.address?.addressLine1 || "",
          addressLine2: data.company.address?.addressLine2 || "",
          street: data.company.address?.street || "",
          landmark: data.company.address?.landmark || "",
          zipcode: data.company.address?.zipcode || "",
          city: data.company.address?.city || "",
          state: data.company.address?.state || "",
          country: data.company.address?.country || "",
          licenseType: data.company.licenseDetails?.licenseType || "",
          licenseNumber: data.company.licenseDetails?.licenseNumber || "",
          licenseIssueDate:
            formatForDateInput(data.company.licenseDetails?.licenseIssueDate) ||
            "",
          licenseExpiry:
            formatForDateInput(data.company.licenseDetails?.licenseExpiry) ||
            "",
          taxRegistrationNumber: data.company?.taxRegistrationNumber || "",
          businessType: data.company?.businessType || "",
          startDate:
            formatForDateInput(data.company?.financialYear.startDate) || "",
          endDate:
            formatForDateInput(data.company?.financialYear.endDate) || "",
        });

        setDocuments(
          data.document.documents?.map((doc) => {
            const fileName = doc.documentDetails.document?.split("/").pop(); // extract just the filename
            return {
              documentType: docTypeMap[doc.documentDetails.documentType],
              file: null, // user can re-upload
              existingFileUrl: fileName
                ? `http://localhost:8000/admin/files/${fileName}`
                : null,
            };
          }) || []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  /** Handlers **/
  const handleClientChange = (e) => {
    const { name, value } = e.target;
    if ((name === "name" || name === "position") && /\d/.test(value)) return;
    setClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompany((prev) => {
      let updated = { ...prev, [name]: value };
      if ((name === "companyName" || name === "landmark") && /\d/.test(value))
        return prev;
      if (name === "zipcode" && !/^\d{0,6}$/.test(value)) return prev;
      if (name === "taxRegistrationNumber" && !/^\d{0,15}$/.test(value))
        return prev;
      if (
        name === "licenseExpiry" &&
        updated.licenseIssueDate &&
        value < updated.licenseIssueDate
      ) {
        alert("License expiry cannot be earlier than issue date");
        return prev;
      }
      if (name === "licenseIssueDate") {
        const today = new Date().toISOString().split("T")[0];
        if (value > today) {
          alert("License issue date cannot be in the future");
          return prev;
        }
      }

      if (
        name === "endDate" &&
        updated.startDate &&
        value < updated.startDate
      ) {
        alert("License expiry cannot be earlier than issue date");
        return prev;
      }

      return updated;
    });
  };

  const handleDocumentChange = (index, field, value) => {
    setDocuments((prev) =>
      prev.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc))
    );
  };

  const handleAddDocument = () =>
    setDocuments((prev) => [...prev, { documentType: "", file: null }]);

  const handleRemoveDocument = (index) =>
    setDocuments((prev) => prev.filter((_, i) => i !== index));

  /** Submit updated client **/
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // if (company.zipcode.length !== 6)
    //   return setError("Zipcode must be exactly 6 digits.");
    // if (company.taxRegistrationNumber.length !== 15)
    //   return setError("Tax Registration Number must be exactly 15 digits.");

    setLoading(true);
    try {
      const merged = Object.assign({}, client, company);
      const formData = new FormData();
      for (const [key, value] of Object.entries(merged)) {
        formData.append(key, value);
      }

      documents.forEach((doc, index) => {
        if (doc.file) {
          formData.append(`documents[${index}][file]`, doc.file);
        }
        formData.append(`documents[${index}][documentType]`, doc.documentType);
      });

      const response = await fetch(
        `${ADMIN_END_POINT}/edit-client/${clientId}`,
        {
          method: "PATCH",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to edit client");
      }

      alert("Client updated successfully!");
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

      {/* {error && <p className={classes.errorMessage}>{error}</p>} */}

      <form onSubmit={handleSubmit} className={classes.addClientForm}>
        <h2>Edit Client</h2>

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
            readOnly
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
              e.target.value = e.target.value.replace(/\D/g, "");
              if (e.target.value.length > 10) {
                e.target.value = e.target.value.slice(0, 10);
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
            max={new Date().toISOString().split("T")[0]}
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
          <label>Financial Year Star Date :</label>
          <input
            type="date"
            name="startDate"
            value={company.startDate}
            onChange={handleCompanyChange}
            required
            max={new Date().toISOString().split("T")[0]}
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
              />
              {doc.existingFileUrl && !doc.file && (
                <a
                  href={doc.existingFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classes.viewLink}
                >
                  View Existing
                </a>
              )}
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
          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Client"}
          </button>
        </div>
      </form>
    </div>
  );
}

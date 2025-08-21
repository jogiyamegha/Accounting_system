
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADMIN_END_POINT, DocumentType } from "../../../utils/constants";
import { countries } from "../../../utils/countries";
import "../../../styles/addClient.css";
import Sidebar from "../../Sidebar";

export default function AddClient() {
    const navigate = useNavigate();

    const [client, setClient] = useState({
        name: "",
        email: "",
        contact: "",
        position: "",
    });

    const [company, setCompany] = useState({
        name: "",
        email: "",
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
            const formData = new FormData();

            // Append client data with prefix
            Object.keys(client).forEach((key) => {
                formData.append(`client[${key}]`, client[key]);
            });
            client.forEach((key) => console.log("fghjgfgv",key))

            // Append company data with prefix
            Object.keys(company).forEach((key) => {
                formData.append(`company[${key}]`, company[key]);
            });


            // Append documents as array of objects, including type and file
            documents.forEach((doc, index) => {
                if (!doc.documentType || !doc.file) throw new Error(`Document ${index + 1} missing type or file`);
                formData.append(`documents[${index}][documentType]`, doc.documentType);
                formData.append(`documents[${index}][file]`, doc.file);
            });

            // Debug: Log FormData content (optional)
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            console.log(formData);
            const response = await fetch(`${ADMIN_END_POINT}/add-client`, {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            console.log(response);
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || "Failed to add client";
                } catch {
                    errorMessage = errorText || "Failed to add client";
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            alert("Client added successfully!");
            navigate("/admin/client-management");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="add-client-container">
            <Sidebar />
            <h2>Add New Client</h2>

            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit} className="add-client-form">
                {/* Client Info Card */}
                <div className="card-section">
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
                        name="contact"
                        placeholder="Contact Number"
                        value={client.contact}
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
                </div>

                {/* Company Info Card */}
                <div className="card-section">
                    <h3>Company Info</h3>
                    <input
                        type="text"
                        name="name"
                        placeholder="Company Name"
                        value={company.name}
                        onChange={handleCompanyChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Company Email"
                        value={company.email}
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
                            <option key={c.code} value={c.code}>
                                {c.name} ({c.code})
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
                    <input
                        type="date"
                        name="licenseIssueDate"
                        value={company.licenseIssueDate}
                        onChange={handleCompanyChange}
                        required
                    />
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
                </div>

                {/* Documents Card */}
                <div className="card-section">
                    <h3>Upload Documents</h3>
                    <button
                        type="button"
                        className="btn-add-document"
                        onClick={handleAddDocument}
                    >
                        + Add Document
                    </button>

                    {documents.map((doc, index) => (
                        <div key={index} className="document-block">
                            <select
                                value={doc.documentType}
                                onChange={(e) =>
                                    handleDocumentChange(index, "documentType", e.target.value)
                                }
                                required
                            >
                                <option value="">--Select Document Type--</option>
                                {Object.keys(DocumentType).map((key) => (
                                    <option key={key} value={key}>
                                        {DocumentType[key]} {/* Show the display value */}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="file"
                                accept="application/pdf,.pdf,.doc,.docx,.jpg,.jpeg,.png"
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
                    <button type="submit" disabled={loading || documents.length === 0}>
                        {loading ? "Submitting..." : "Submit Client"}
                    </button>
                </div>
            </form>
        </div>
    );
}

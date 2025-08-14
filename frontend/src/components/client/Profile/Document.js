import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CLIENT_END_POINT } from "../../../utils/constants";
import "../../../styles/document.css";
 
export default function DocumentPage() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [documents, setDocuments] = useState([]);
    
    const documentTypes = [
        "Aadhar Card",
        "PAN Card",
        "Passport",
        "Driving License",
        "Bank Statement",
    ];
    
    const handleAddDocument = () => {
        setDocuments((prev) => [
        ...prev,
        { documentType: "", file: null, comments: "", status: "pending" },
        ]);
    };
    
    const handleChange = (index, field, value) => {
        setDocuments((prev) =>
        prev.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc))
        );
    };
    
    const handleUpload = async (index) => {
        try {
        setError("");
        const doc = documents[index];
    
        if (!doc.documentType || !doc.file) {
            setError("Please select a document type and upload a file.");
            return;
        }
    
        const formData = new FormData();
        formData.append("documentType", doc.documentType);
        formData.append("document", doc.file);
        formData.append("comments", doc.comments);
    
        const response = await fetch(`${CLIENT_END_POINT}/document`, {
            method: "POST",
            body: formData,
        });
    
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Failed to upload document");
        }
    
        alert(`${doc.documentType} uploaded successfully!`);
        setDocuments((prev) =>
            prev.map((d, i) =>
            i === index ? { ...d, status: "uploaded" } : d
            )
        );
        } catch (err) {
        console.error(err);
        setError(err.message);
        }
    };
    
    const handleFinalSubmit = () => {
        const pendingDocs = documents.filter((doc) => doc.status !== "uploaded");
        if (pendingDocs.length > 0) {
        alert("Some documents are not uploaded yet.");
        return;
        }
        alert("All documents submitted successfully!");
        navigate("/client/home");
    };
    
    return (
        <div className="form-container">
        <h2 className="form-title">Upload Documents</h2>
    
        {error && <p className="error-message">{error}</p>}
    
        <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAddDocument}
        >
            + Add Document
        </button>
    
        {documents.map((doc, index) => (
            <div key={index} className="document-card">
            <select
                className="form-select"
                value={doc.documentType}
                onChange={(e) => handleChange(index, "documentType", e.target.value)}
            >
                <option value="">Select Document Type</option>
                {documentTypes.map((type, idx) => (
                <option key={idx} value={type}>
                    {type}
                </option>
                ))}
            </select>
    
            <input
                type="file"
                className="form-input"
                onChange={(e) => handleChange(index, "file", e.target.files[0])}
            />
    
            <input
                type="text"
                className="form-input"
                placeholder="Comments"
                value={doc.comments}
                onChange={(e) => handleChange(index, "comments", e.target.value)}
            />
    
            <button
                type="button"
                className={`btn ${doc.status === "uploaded" ? "btn-success" : "btn-primary"}`}
                onClick={() => handleUpload(index)}
                disabled={doc.status === "uploaded"}
            >
                {doc.status === "uploaded" ? "Uploaded" : "Upload"}
            </button>
            </div>
        ))}
    
        {documents.length > 0 && (
            <button
            type="button"
            className="btn btn-primary final-submit-btn"
            onClick={handleFinalSubmit}
            >
            Final Submit
            </button>
        )}
        </div>
    );
}
    
    
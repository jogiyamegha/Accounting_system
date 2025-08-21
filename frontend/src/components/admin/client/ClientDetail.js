import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ADMIN_END_POINT, DocStatus, DocumentType } from "../../../utils/constants";

import "../../../styles/clientDetail.css"; 
import Sidebar from "../../Sidebar";

export default function ClientDetail() {
  const { clientId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const res = await fetch(`${ADMIN_END_POINT}/client-detail/${clientId}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Failed to fetch client details");

        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [clientId]);

  if (loading) return <p className="loading-text">Loading client details...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!data) return <p className="empty-text">No client details found</p>;

  const { client, company, document } = data;

  return (
    <div className="client-detail-page">
        <Sidebar />
      <h2 className="page-title">Client Details</h2>

      {/* Client Info */}
      {client && (
        <div className="clientCard">
          <h3 className="clientCard-title">👤 Client Information</h3>
          <p><strong>Name:</strong> {client.name}</p>
          <p><strong>Email:</strong> {client.email}</p>
          {client.contact && (
            <p>
              <strong>Contact:</strong> {client.contact.phoneCountry} {client.contact.phone}
            </p>
          )}
        </div>
      )}

      {/* Company Info */}
      {company && (
        <div className="clientCard">
          <h3 className="clientCard-title">🏢 Company Information</h3>
          <p><strong>Name:</strong> {company.name}</p>
          <p><strong>Email:</strong> {company.email}</p>

          {company.address && (
            <p>
              <strong>Address:</strong>{" "}
              {company.address.addressLine1}, {company.address.addressLine2},{" "}
              {company.address.street}, {company.address.landmark},{" "}
              {company.address.city} - {company.address.zipcode},{" "}
              {company.address.state}, {company.address.country}
            </p>
          )}

          {company.licenseDetails && (
            <>
              <p><strong>License Type:</strong> {company.licenseDetails.licenseType}</p>
              <p><strong>License Number:</strong> {company.licenseDetails.licenseNumber}</p>
              <p><strong>Issue Date:</strong> {new Date(company.licenseDetails.licenseIssueDate).toLocaleDateString()}</p>
              <p><strong>Expiry Date:</strong> {new Date(company.licenseDetails.licenseExpiry).toLocaleDateString()}</p>
            </>
          )}

          {company.financialYear && (
            <p>
              <strong>Financial Year:</strong>{" "}
              {new Date(company.financialYear.startDate).toLocaleDateString()} -{" "}
              {new Date(company.financialYear.endDate).toLocaleDateString()}
            </p>
          )}

          {company.contactPerson && (
            <p>
              <strong>Contact Person:</strong> {company.contactPerson.name} (
              {company.contactPerson.contact.phoneCountry}{" "}
              {company.contactPerson.contact.phone})
            </p>
          )}

          <p><strong>Tax Registration Number:</strong> {company.taxRegistrationNumber}</p>
          <p><strong>Business Type:</strong> {company.businessType}</p>
        </div>
      )}

      {/* Documents */}
      <div className="clientCard">
        <h3 className="clientCard-title">📄 Documents</h3>
        {document && document.documents && document.documents.length > 0 ? (
          <ul className="document-list">
            {document.documents.map((doc, index) => (
              <li className="document-item" key={doc._id || index}>
                <p>
                  {Object.entries(DocumentType).map(([typeName, typeValue]) =>
                    typeValue === doc.documentDetails.docStatus ? (
                      <span key={typeValue}>
                        <strong>Document Type:</strong> {typeName}
                      </span>
                    ) : null
                  )}
                </p>
                <p>
                  {Object.entries(DocStatus).map(([statusName, statusValue]) =>
                    statusValue === doc.documentDetails.docStatus ? (
                      <span key={statusValue}>
                        <strong>Status:</strong> {statusName}
                      </span>
                    ) : null
                  )}
                </p>
                <p><strong>Uploaded:</strong> {new Date(doc.documentDetails.uploadedAt).toLocaleString()}</p>
                <p>
                  <a
                    href={`/${doc.documentDetails.document}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-link"
                  >
                    View Document
                  </a>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-text">No documents uploaded</p>
        )}
      </div>
    </div>
  );
}

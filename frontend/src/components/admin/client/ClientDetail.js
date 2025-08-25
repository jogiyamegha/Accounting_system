import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ADMIN_END_POINT,
  DocStatus,
  DocumentType,
} from "../../../utils/constants";
import "../../../styles/clientDetail.css";

import Sidebar from "../../Sidebar";

function formatDateToDDMMYYYY(dateString) {
  if (!dateString) return ""; // handle null or undefined

  const date = new Date(dateString);

  const day = ("0" + date.getDate()).slice(-2);

  const month = ("0" + (date.getMonth() + 1)).slice(-2);

  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export default function ClientDetail() {
  const { clientId } = useParams();

  const [data, setData] = useState(null);

  const [invoices, setInvoices] = useState({ invoiceList: [] });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleGenerateInvoice = async (clientId) => {
    navigate(`/admin/generate-invoice/${clientId}`);
  };

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const res = await fetch(
          `${ADMIN_END_POINT}/client-detail/${clientId}`,

          {
            method: "GET",

            credentials: "include",

            headers: { "Content-Type": "application/json" },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch client details");

        const result = await res.json();

        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchInvoices = async () => {
      try {
        const res = await fetch(
          `${ADMIN_END_POINT}/clients/${clientId}/invoices`,

          { credentials: "include" }
        );

        if (res.ok) {
          const result = await res.json();

          setInvoices(result);
        }
      } catch (err) {
        console.error("Error fetching invoices:", err);
      }
    };

    fetchClientDetails();

    fetchInvoices();
  }, [clientId]);

  if (loading) return <p className="loading-text">Loading client details...</p>;

  if (error) return <p className="error-text">{error}</p>;

  if (!data) return <p className="empty-text">No client details found</p>;

  const { client, company, document, invoice } = data;

  console.log("d",document)

  // 🔹 View & Download invoice helpers

  const handleViewInvoice = (filename) => {
    window.open(`${ADMIN_END_POINT}/invoices/${filename}`, "_blank");
  };

  const handleDownloadInvoice = async (filename) => {
    try {
      const res = await fetch(`${ADMIN_END_POINT}/invoices/${filename}`, {
        credentials: "include",
      });

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;

      a.download = filename;

      document.body.appendChild(a);

      a.click();

      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading invoice:", err);
    }
  };

  return (
    <div className="client-detail-page">
      <Sidebar />
      <div className="adjustment">

        <h2 className="page-title">Client Details</h2>
        <button className="gtBtn" onClick={() => handleGenerateInvoice(client._id)}>
          Generate Invoice
        </button>
      </div>


      {/* Client Info */}

      {client && (
        <div className="clientCard">
          <h3 className="clientCard-title">👤 Client Information</h3>
          <p>
            <strong>Name:</strong> {client.name}
          </p>
          <p>
            <strong>Email:</strong> {client.email}
          </p>
          <p>
            <strong>Position:</strong> {client.position}
          </p>

          {client.contact && (
            <p>
              <strong>Contact:</strong> {client.contact.phoneCountry}{" "}
              {client.contact.phone}
            </p>
          )}
        </div>
      )}

      {/* Company Info */}

      {company && (
        <div className="clientCard">
          <h3 className="clientCard-title">🏢 Company Information</h3>
          <p>
            <strong>Name:</strong> {company.name}
          </p>
          <p>
            <strong>Email:</strong> {company.email}
          </p>

          {company.address && (
            <p>
              <strong>Address:</strong> {company.address.addressLine1}{" "}
              {company.address.addressLine2} {company.address.street}{" "}
              {company.address.landmark} ,{company.address.city} -{" "}
              {company.address.zipcode}, {company.address.state},{" "}
              {company.address.country}
            </p>
          )}

          {company.licenseDetails && (
            <>
              <p>
                <strong>License Type:</strong>{" "}
                {company.licenseDetails.licenseType}
              </p>
              <p>
                <strong>License Number:</strong>{" "}
                {company.licenseDetails.licenseNumber}
              </p>
              <p>
                <strong>Issue Date:</strong>{" "}
                {formatDateToDDMMYYYY(company.licenseDetails.licenseIssueDate)}
              </p>
              <p>
                <strong>Expiry Date:</strong>{" "}
                {formatDateToDDMMYYYY(company.licenseDetails.licenseExpiry)}
              </p>
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

          <p>
            <strong>Tax Registration Number:</strong>{" "}
            {company.taxRegistrationNumber}
          </p>
          <p>
            <strong>Business Type:</strong> {company.businessType}
          </p>
        </div>
      )}

      {/* Documents */}
      <div className="clientCard">
        <h3 className="clientCard-title">📃 Documents</h3>

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
                <p>
                  <strong>Uploaded:</strong>{" "}
                  {formatDateToDDMMYYYY(doc.documentDetails.uploadedAt)}
                </p>
                <p>
                  <a
                    href={`${ADMIN_END_POINT}/files/${doc.documentDetails.document.replace(
                      "uploads/document/",

                      ""
                    )}`}
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

      <div className="clientCard">
        <h3 className="text-xl font-semibold mb-2">📑Invoices</h3>

        {invoice?.invoiceList?.length > 0 ? (
          <table className="invoice-item">
            {/* <thead> */}
              <tr className="">
                <th className="">Index</th>
                <th className="">Name</th>
                <th className="">Actions</th>
              </tr>
            {/* </thead> */}
            <tbody>
              {invoice.invoiceList.map((doc, idx) => (
                <tr key={idx} className="invoice-row">
                  <td>
                    <p className="index">{idx + 1 }</p>
                  </td>
                  <td>{doc.invoiceNumber}</td>
                  <td className="buttons">
                    <a
                      href={`${ADMIN_END_POINT}/invoice/${doc.invoice.replace(
                        "uploads/invoice/",
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view"
                    >
                      View
                    </a>

                    <a
                      href={`${ADMIN_END_POINT}/invoice/${doc.invoice.replace(
                        "uploads/invoice/",
                        ""
                      )}?download=true`}
                      className="download"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No invoices available</p>
        )}
      </div>
    </div>
  );
}

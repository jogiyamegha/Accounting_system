import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ADMIN_END_POINT,
  DocStatus,
  DocumentType,
} from "../../../utils/constants";
import "../../../styles/clientDetail.css";

import Sidebar from "../../Sidebar";

function formatDateToDDMMYYYY(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = ("0" + date.getDate()).slice(-2);
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function ClientDetail() {
  const { clientId } = useParams();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [invoices, setInvoices] = useState({ invoiceList: [] });
  const [documents, setDocuments] = useState([]); // ✅ keep documents in state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 New states for filtering
  const [searchType, setSearchType] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [editedDocs, setEditedDocs] = useState({});

  const navigate = useNavigate();

  const handleGenerateInvoice = (clientId) => {
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
        setDocuments(result.document?.documents || []); // ✅ set docs in state
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

  // ✅ initialize editedDocs only when documents change
  useEffect(() => {
    let initialEdited = {};
    (documents || []).forEach((doc) => {
      const currentStatusKey = Object.keys(DocStatus).find(
        (key) => DocStatus[key] === doc.documentDetails.docStatus
      );
      initialEdited[doc._id] = {
        comments: doc.documentDetails.comments || "",
        status: currentStatusKey || "",
        docId: doc._id,
      };
    });
    console.log("initialEdited", initialEdited);
    setEditedDocs(initialEdited);
  }, [documents]);

  useEffect(() => {
    if (!loading && location.state?.scrollToDocuments ) {
      const el = document.getElementById("documents");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [loading, location.state]);

  if (loading) return <p className="loading-text">Loading client details...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!data) return <p className="empty-text">No client details found</p>;

  const { client, company } = data;

  // 🔹 Filtered Documents
  const filteredDocuments =
    documents.filter((doc) => {
      const docTypeName = Object.entries(DocumentType).find(
        ([, typeValue]) => typeValue === doc.documentDetails.documentType
      )?.[0];

      const docDate = formatDateToDDMMYYYY(doc.documentDetails.uploadedAt);

      const matchesType = searchType ? docTypeName === searchType : true;
      const matchesDate = searchDate ? docDate === searchDate : true;

      return matchesType && matchesDate;
    }) || [];

  const handleFieldChange = (docId, field, value) => {
    setEditedDocs((prev) => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        [field]: value,
      },
    }));
  };

  const handleUpdate = async (docId) => {
    // console.log("1",editedDocs)
    try {
      if (!clientId) return;
      setError("");

      const { status, comments } = editedDocs[docId];
      // console.log("editedDocs",editedDocs)

      const response = await fetch(
        `${ADMIN_END_POINT}/update-doc-status/${clientId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, comments, docId }),
          credentials: "include",
        }
      );

      console.log(response);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to update document status");
      }

      setDocuments((prevDocs) =>
        prevDocs.map((doc) =>
          doc._id === docId
            ? {
                ...doc,
                documentDetails: {
                  ...doc.documentDetails,
                  docStatus: DocStatus[status],
                  comments,
                },
              }
            : doc
        )
      );

      alert("Status Submitted & client is notified.");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="client-detail-page">
      <Sidebar />
      <div className="adjustment">
        <h2 className="page-title">Client Details</h2>
        <button
          className="gtBtn"
          onClick={() => handleGenerateInvoice(client._id)}
        >
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
                <strong>License Issue Date:</strong>{" "}
                {formatDateToDDMMYYYY(company.licenseDetails.licenseIssueDate)}
              </p>
              <p>
                <strong>License Expiry Date:</strong>{" "}
                {formatDateToDDMMYYYY(company.licenseDetails.licenseExpiry)}
              </p>
            </>
          )}

          {company.financialYear && (
            <p>
              <strong>Financial Year:</strong>{" "}
              {formatDateToDDMMYYYY(company.financialYear.startDate)} -{" "}
              {formatDateToDDMMYYYY(company.financialYear.endDate)}
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
      <div className="clientCard" id="documents">
        <h3 className="clientCard-title">📃 Documents</h3>

        {/* Filters */}
        <div className="filter-bar">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="filter-input"
          >
            <option value="">All Types</option>
            {Object.entries(DocumentType).map(([typeName, typeValue]) => (
              <option key={typeValue} value={typeName}>
                {typeName}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={
              searchDate
                ? (() => {
                    const [dd, mm, yyyy] = searchDate.split("/");
                    return `${yyyy}-${mm}-${dd}`;
                  })()
                : ""
            }
            onChange={(e) => {
              if (!e.target.value) return setSearchDate("");
              const [yyyy, mm, dd] = e.target.value.split("-");
              setSearchDate(`${dd}/${mm}/${yyyy}`);
            }}
            className="filter-input"
          />
        </div>

        {filteredDocuments.length > 0 ? (
          <ul className="document-list">
            {filteredDocuments.map((doc, index) => (
              <li className="document-item" key={doc._id || index}>
                <p>
                  <strong>Type:</strong>{" "}
                  {
                    Object.entries(DocumentType).find(
                      ([, v]) => v === doc.documentDetails.documentType
                    )?.[0]
                  }
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {
                    Object.entries(DocStatus).find(
                      ([, v]) => v === doc.documentDetails.docStatus
                    )?.[0]
                  }
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

                <div className="doc-action">
                  <label className="doc-label">Comments:</label>
                  <input
                    type="text"
                    className="doc-input"
                    value={editedDocs[doc._id]?.comments || ""}
                    onChange={(e) =>
                      handleFieldChange(doc._id, "comments", e.target.value)
                    }
                    placeholder="Add comment..."
                  />
                </div>

                <div className="doc-action">
                  <label className="doc-label">
                    Status: {editedDocs[doc._id]?.status}
                  </label>
                  <select
                    className="doc-select"
                    value={editedDocs[doc._id]?.status || ""}
                    onChange={(e) =>
                      handleFieldChange(doc._id, "status", e.target.value)
                    }
                  >
                    {Object.keys(DocStatus).map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="doc-action">
                  <button
                    className="doc-update-btn"
                    onClick={() => handleUpdate(doc._id)}
                  >
                    Update
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-text">No documents found</p>
        )}
      </div>

      {/* Invoices */}
      <div className="clientCard">
        <h3 className="text-xl font-semibold mb-2">📑Invoices</h3>

        {invoices?.invoiceList?.length > 0 ? (
          <table className="invoice-item">
            <thead>
              <tr>
                <th>Index</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.invoiceList.map((doc, idx) => (
                <tr key={idx} className="invoice-row">
                  <td>{idx + 1}</td>
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

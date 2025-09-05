// import { useEffect, useState } from "react";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import {
//     ADMIN_END_POINT,
//     DocStatus,
//     DocumentType,
// } from "../../../utils/constants";
// import styles from "../../../styles/clientDetail.module.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faDownload, faEye } from "@fortawesome/free-solid-svg-icons";
// import Sidebar from "../../Sidebar";
// import { toast } from 'react-toastify';

// function formatDateToDDMMYYYY(dateString) {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     const day = ("0" + date.getDate()).slice(-2);
//     const month = ("0" + (date.getMonth() + 1)).slice(-2);
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
// }

// export default function ClientDetail() {
//     const { clientId } = useParams();
//     const location = useLocation();

//     const [data, setData] = useState(null);
//     const [invoices, setInvoices] = useState({ invoiceList: [] });
//     const [documents, setDocuments] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     const [searchType, setSearchType] = useState("");
//     const [searchDate, setSearchDate] = useState("");
//     const [editedDocs, setEditedDocs] = useState({});

//     const navigate = useNavigate();

//     const handleGenerateInvoice = (clientId) => {
//         navigate(`/admin/generate-invoice/${clientId}`);
//     };

//     useEffect(() => {
//         const fetchClientDetails = async () => {
//             try {
//                 const res = await fetch(
//                     `${ADMIN_END_POINT}/client-detail/${clientId}`,
//                     {
//                         method: "GET",
//                         credentials: "include",
//                         headers: { "Content-Type": "application/json" },
//                     }
//                 );

//                 if (!res.ok) {
//                     toast.error("Failed to fetch client details")
//                     throw new Error("Failed to fetch client details");
//                 }

//                 const result = await res.json();
//                 setData(result);
//                 setDocuments(result.document?.documents || []);
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         const fetchInvoices = async () => {
//             try {
//                 const res = await fetch(
//                     `${ADMIN_END_POINT}/generate-invoice/${clientId}`,
//                     { credentials: "include" }
//                 );

//                 if (res.ok) {
//                     const result = await res.json();
//                     setInvoices(result.invoice);
//                 }
//             } catch (err) {
//                 toast.error("Error fetching invoices")
//                 console.error("Error fetching invoices:", err);
//             }
//         };

//         fetchClientDetails();
//         fetchInvoices();
//     }, [clientId]);

//     useEffect(() => {
//         let initialEdited = {};
//         (documents || []).forEach((doc) => {
//             const currentStatusKey = Object.keys(DocStatus).find(
//                 (key) => DocStatus[key] === doc.documentDetails.docStatus
//             );
//             initialEdited[doc._id] = {
//                 comments: doc.documentDetails.comments || "",
//                 status: currentStatusKey || "",
//                 docId: doc._id,
//             };
//         });
//         setEditedDocs(initialEdited);
//     }, [documents]);

//     useEffect(() => {
//         if (!loading && location.state?.scrollToDocuments) {
//             const el = document.getElementById("documents");
//             if (el) {
//                 el.scrollIntoView({ behavior: "smooth" });
//             }
//         }
//     }, [loading, location.state]);

//     if (loading) return <p className="loading-text">Loading client details...</p>;
//     if (error) return <p className="error-text">{error}</p>;
//     if (!data) return <p className="empty-text">No client details found</p>;

//     const { client, company } = data;

//     const filteredDocuments =
//         documents.filter((doc) => {
//             const docTypeName = Object.entries(DocumentType).find(
//                 ([, typeValue]) => typeValue === doc.documentDetails.documentType
//             )?.[0];

//             const docDate = formatDateToDDMMYYYY(doc.documentDetails.uploadedAt);

//             const matchesType = searchType ? docTypeName === searchType : true;
//             const matchesDate = searchDate ? docDate === searchDate : true;

//             return matchesType && matchesDate;
//         }) || [];

//     const handleFieldChange = (docId, field, value) => {
//         setEditedDocs((prev) => ({
//             ...prev,
//             [docId]: {
//                 ...prev[docId],
//                 [field]: value,
//             },
//         }));
//     };

//     const handleUpdate = async (docId) => {
//         // console.log("1",editedDocs)
//         try {
//             if (!clientId) return;
//             setError("");

//             const { status, comments } = editedDocs[docId];

//             const response = await fetch(
//                 `${ADMIN_END_POINT}/update-doc-status/${clientId}`,
//                 {
//                     method: "PATCH",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ status, comments, docId }),
//                     credentials: "include",
//                 }
//             );

//             if (!response.ok) {
//                 const errData = await response.json();
//                 throw new Error(errData.message || "Failed to update document status");
//             }

//             setDocuments((prevDocs) =>
//                 prevDocs.map((doc) =>
//                     doc._id === docId
//                         ? {
//                             ...doc,
//                             documentDetails: {
//                                 ...doc.documentDetails,
//                                 docStatus: DocStatus[status],
//                                 comments,
//                             },
//                         }
//                         : doc
//                 )
//             );
//             toast.success("Status Submitted & client is notified.")
//         } catch (err) {
//             console.error(err);
//             setError(err.message);
//         }
//     };

//     return (
//         <div className={styles.clientDetailPage}>
//             <Sidebar />

//             <div className={styles.adjustment}>
//                 <h2 className={styles.pageTitle}>Client Details</h2>
//                 <button
//                     className={styles.gtBtn}
//                     onClick={() => handleGenerateInvoice(client._id)}
//                 >
//                     Generate Invoice
//                 </button>
//             </div>

//             {/* Client Info */}
//             {client && (
//                 <div className={styles.clientCard}>
//                     <h3 className={styles.clientCardTitle}>👤 Client Information</h3>
//                     <div className={styles.infoGrid}>
//                         <div className={styles.infoRow}>
//                             <span className={styles.infoLabel}>Name:</span>
//                             <span className={styles.infoValue}>{client.name}</span>
//                         </div>
//                         <div className={styles.infoRow}>
//                             <span className={styles.infoLabel}>Email:</span>
//                             <span className={styles.infoValue}>{client.email}</span>
//                         </div>
//                         <div className={styles.infoRow}>
//                             <span className={styles.infoLabel}>Position:</span>
//                             <span className={styles.infoValue}>{client.position}</span>
//                         </div>
//                         {client.contact && (
//                             <div className={styles.infoRow}>
//                                 <span className={styles.infoLabel}>Contact:</span>
//                                 <span className={styles.infoValue}>
//                                     {client.contact.phoneCountry} {client.contact.phone}
//                                 </span>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}

//             {/* Company Info */}
//             {company && (
//                 <div className={styles.clientCard}>
//                     <h3 className={styles.clientCardTitle}>🏢 Company Information</h3>
//                     <div className={styles.infoGrid}>
//                         <div className={styles.infoRow}>
//                             <span className={styles.infoLabel}>Name:</span>
//                             <span className={styles.infoValue}>{company.name}</span>
//                         </div>
//                         <div className={styles.infoRow}>
//                             <span className={styles.infoLabel}>Email:</span>
//                             <span className={styles.infoValue}>{company.email}</span>
//                         </div>

//                         {company.address && (
//                             <div className={styles.infoRow}>
//                                 <span className={styles.infoLabel}>Address:</span>
//                                 <span className={styles.infoValue}>
//                                     {company.address.addressLine1} {company.address.addressLine2}{" "}
//                                     {company.address.street} {company.address.landmark},{" "}
//                                     {company.address.city} - {company.address.zipcode},{" "}
//                                     {company.address.state}, {company.address.country}
//                                 </span>
//                             </div>
//                         )}

//                         {company.licenseDetails && (
//                             <>
//                                 <div className={styles.infoRow}>
//                                     <span className={styles.infoLabel}>License Type:</span>
//                                     <span className={styles.infoValue}>
//                                         {company.licenseDetails.licenseType}
//                                     </span>
//                                 </div>
//                                 <div className={styles.infoRow}>
//                                     <span className={styles.infoLabel}>License Number:</span>
//                                     <span className={styles.infoValue}>
//                                         {company.licenseDetails.licenseNumber}
//                                     </span>
//                                 </div>
//                                 <div className={styles.infoRow}>
//                                     <span className={styles.infoLabel}>License Issue Date:</span>
//                                     <span className={styles.infoValue}>
//                                         {formatDateToDDMMYYYY(
//                                             company.licenseDetails.licenseIssueDate
//                                         )}
//                                     </span>
//                                 </div>
//                                 <div className={styles.infoRow}>
//                                     <span className={styles.infoLabel}>License Expiry Date:</span>
//                                     <span className={styles.infoValue}>
//                                         {formatDateToDDMMYYYY(company.licenseDetails.licenseExpiry)}
//                                     </span>
//                                 </div>
//                             </>
//                         )}

//                         {company.financialYear && (
//                             <div className={styles.infoRow}>
//                                 <span className={styles.infoLabel}>Financial Year:</span>
//                                 <span className={styles.infoValue}>
//                                     {formatDateToDDMMYYYY(company.financialYear.startDate)} -{" "}
//                                     {formatDateToDDMMYYYY(company.financialYear.endDate)}
//                                 </span>
//                             </div>
//                         )}

//                         {company.contactPerson && (
//                             <div className={styles.infoRow}>
//                                 <span className={styles.infoLabel}>Contact Person:</span>
//                                 <span className={styles.infoValue}>
//                                     {company.contactPerson.name} (
//                                     {company.contactPerson.contact.phoneCountry}{" "}
//                                     {company.contactPerson.contact.phone})
//                                 </span>
//                             </div>
//                         )}

//                         <div className={styles.infoRow}>
//                             <span className={styles.infoLabel}>Tax Registration Number:</span>
//                             <span className={styles.infoValue}>
//                                 {company.taxRegistrationNumber}
//                             </span>
//                         </div>
//                         <div className={styles.infoRow}>
//                             <span className={styles.infoLabel}>Business Type:</span>
//                             <span className={styles.infoValue}>{company.businessType}</span>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Documents */}
//             <div className={styles.clientCard} id="documents">
//                 <h3 className={styles.clientCardTitle}>📃 Documents</h3>

//                 {/* Filters */}
//                 <div className={styles.filterBar}>
//                     <select
//                         value={searchType}
//                         onChange={(e) => setSearchType(e.target.value)}
//                         className={styles.filterInput}
//                     >
//                         <option value="">All Types</option>
//                         {Object.entries(DocumentType).map(([typeName, typeValue]) => (
//                             <option key={typeValue} value={typeName}>
//                                 {typeName}
//                             </option>
//                         ))}
//                     </select>

//                     <input
//                         type="date"
//                         value={
//                             searchDate
//                                 ? (() => {
//                                     const [dd, mm, yyyy] = searchDate.split("/");
//                                     return `${yyyy}-${mm}-${dd}`;
//                                 })()
//                                 : ""
//                         }
//                         onChange={(e) => {
//                             if (!e.target.value) return setSearchDate("");
//                             const [yyyy, mm, dd] = e.target.value.split("-");
//                             setSearchDate(`${dd}/${mm}/${yyyy}`);
//                         }}
//                         className={styles.filterInput}
//                     />
//                 </div>

//                 {filteredDocuments.length > 0 ? (
//                     <ul className={styles.documentList}>
//                         {filteredDocuments.map((doc) => (
//                             <li className={styles.documentItem} key={doc._id}>
//                                 <p>
//                                     <strong>Type:</strong>{" "}
//                                     {
//                                         Object.entries(DocumentType).find(
//                                             ([, v]) => v === doc.documentDetails.documentType
//                                         )?.[0]
//                                     }
//                                 </p>
//                                 <p>
//                                     <strong>Status:</strong>{" "}
//                                     {
//                                         Object.entries(DocStatus).find(
//                                             ([, v]) => v === doc.documentDetails.docStatus
//                                         )?.[0]
//                                     }
//                                 </p>
//                                 <p>
//                                     <strong>Uploaded:</strong>{" "}
//                                     {formatDateToDDMMYYYY(doc.documentDetails.uploadedAt)}
//                                 </p>
//                                 <p>
//                                     <a
//                                         href={`${ADMIN_END_POINT}/files/${doc.documentDetails.document.replace(
//                                             "uploads/document/",
//                                             ""
//                                         )}`}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className={styles.viewLink}
//                                     >
//                                         View Document
//                                     </a>
//                                 </p>

//                                 <div className={styles.docAction}>
//                                     <label className={styles.docLabel}>Comments:</label>
//                                     <input
//                                         type="text"
//                                         className={styles.docInput}
//                                         value={editedDocs[doc._id]?.comments || ""}
//                                         onChange={(e) =>
//                                             handleFieldChange(doc._id, "comments", e.target.value)
//                                         }
//                                         placeholder="Add comment..."
//                                     />
//                                 </div>

//                                 <div className={styles.docAction}>
//                                     <label className={styles.docLabel}>
//                                         Status: {editedDocs[doc._id]?.status}
//                                     </label>
//                                     <select
//                                         className={styles.docSelect}
//                                         value={editedDocs[doc._id]?.status || ""}
//                                         onChange={(e) =>
//                                             handleFieldChange(doc._id, "status", e.target.value)
//                                         }
//                                     >
//                                         {Object.keys(DocStatus).map((key) => (
//                                             <option key={key} value={key}>
//                                                 {key}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>

//                                 <div className={styles.docAction}>
//                                     <button
//                                         className={styles.docUpdateBtn}
//                                         onClick={() => handleUpdate(doc._id)}
//                                     >
//                                         Update
//                                     </button>
//                                 </div>
//                             </li>
//                         ))}
//                     </ul>
//                 ) : (
//                     <p className={styles.emptyText}>No documents found</p>
//                 )}
//             </div>

//             {/* Invoices */}
//             <div className={styles.clientCard}>
//                 <h3 className={styles.clientCardTitle}>📑 Invoices</h3>

//                 {invoices?.invoiceList?.length > 0 ? (
//                     <table className={styles.invoiceTable}>
//                         <thead>
//                             <tr>
//                                 <th>Index</th>
//                                 <th>Invoice Number</th>
//                                 <th>Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {invoices.invoiceList.map((doc, idx) => (
//                                 <tr key={idx} className={styles.invoiceRow}>
//                                     <td>{idx + 1}</td>
//                                     <td>{doc.invoiceNumber}</td>
//                                     <td>
//                                         <div className={styles.invoiceButtons}>
//                                             <a
//                                                 href={`${ADMIN_END_POINT}/invoice/${doc.invoice.replace(
//                                                     "uploads/invoice/",
//                                                     ""
//                                                 )}`}
//                                                 target="_blank"
//                                                 rel="noopener noreferrer"
//                                                 className={`${styles.invoiceLink} ${styles.view}`}
//                                             > <FontAwesomeIcon icon={faEye} />
//                                                 View
//                                             </a>
//                                             <a
//                                                 href={`${ADMIN_END_POINT}/invoice/${doc.invoice.replace(
//                                                     "uploads/invoice/",
//                                                     ""
//                                                 )}?download=true`}
//                                                 className={`${styles.invoiceLink} ${styles.download}`}
//                                             >
//                                                 {" "}
//                                                 <FontAwesomeIcon icon={faDownload} />
//                                                 Download
//                                             </a>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 ) : (
//                     <p className={styles.emptyText}>No invoices available</p>
//                 )}
//             </div>
//         </div>
//     );
// }

import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ADMIN_END_POINT,
  DocStatus,
  DocumentType,
} from "../../../utils/constants";
import styles from "../../../styles/clientDetail.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faEye,
  faUserCircle,
  faPen,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../../Sidebar";
import { toast } from "react-toastify";

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
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        if (!res.ok) {
          let errorData = await res.json();
          toast.error(errorData.error || "Failed to fetch client details");
          // throw new Error("Failed to fetch client details");
        }

        const result = await res.json();
        setData(result);
        setDocuments(result.document?.documents || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchInvoices = async () => {
      try {
        const res = await fetch(
          `${ADMIN_END_POINT}/generate-invoice/${clientId}`,
          { credentials: "include" }
        );

        if (res.ok) {
          const result = await res.json();
          setInvoices(result.invoice);
        } else{
          let errorData = await res.json();
          toast.error(errorData.error || "Error fetching invoices")
        }
      } catch (err) {
        toast.error("Error fetching invoices");
        console.error("Error fetching invoices:", err);
      }
    };

    fetchClientDetails();
    fetchInvoices();
  }, [clientId]);

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
    setEditedDocs(initialEdited);
  }, [documents]);

  useEffect(() => {
    if (!loading && location.state?.scrollToDocuments) {
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
    try {
      if (!clientId) return;
      setError("");

      const { status, comments } = editedDocs[docId];

      const response = await fetch(
        `${ADMIN_END_POINT}/update-doc-status/${clientId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, comments, docId }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        toast.error(errData.error || "Failed to update document status");
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
      toast.success("Status Submitted & client is notified.");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className={styles.clientDetailPage}>
      <Sidebar />

      <div className={styles.adjustment}>
        <h2 className={styles.pageTitle}> <FontAwesomeIcon icon={faClipboardList} /> Client Details</h2>
        <button
          className={styles.gtBtn}
          onClick={() => handleGenerateInvoice(client._id)}
        >
          Generate Invoice
        </button>
      </div>

      {/* Header Card with User Icon */}
      {client && (
        <div className={styles.profileCard}>
          <div className={styles.profileLeft}>
            <FontAwesomeIcon
              icon={faUserCircle}
              className={styles.profileIcon}
            />
            <div>
              <h2 className={styles.profileName}>{client.name}</h2>
              <p className={styles.profileRole}>
                {client.position || "Client"}
              </p>
              {/* <p className={styles.profileLocation}>
                {company?.address?.city}, {company?.address?.state},{" "}
                {company?.address?.country}
              </p> */}
              {client.contact && (
                <div className={styles.infoRow}>
                  {/* <span className={styles.infoLabel}>Contact:</span> */}
                  <span className={styles.infoValue}>
                    Mobile: {client.contact.phoneCountry} {client.contact.phone}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            className={styles.editBtn}
            onClick={() => navigate(`/admin/edit-client/${client._id}`)}
          >
            <FontAwesomeIcon icon={faPen} />
          </button>
        </div>
      )}

      {/* Personal Information */}
      <div className={styles.clientCard}>
        <div className={styles.cardHeader}>
          <h3>Personal Information</h3>
          <button className={styles.editBtn}
            onClick={() => navigate(`/admin/edit-client/${client._id}`)}

          >
            <FontAwesomeIcon icon={faPen} />
          </button>
        </div>
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Name:</span>
            <span className={styles.infoValue}>{client?.name}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Email:</span>
            <span className={styles.infoValue}>{client?.email}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Phone:</span>
            <span className={styles.infoValue}>
              {client?.contact?.phoneCountry} {client?.contact?.phone}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Role:</span>
            <span className={styles.infoValue}>{client?.position}</span>
          </div>
        </div>
      </div>

      {/* Company */}
      <div className={styles.clientCard}>
        <div className={styles.cardHeader}>
          <h3>Company Information</h3>
          <button className={styles.editBtn}
            onClick={() => navigate(`/admin/edit-client/${client._id}`)}
          
          >
            <FontAwesomeIcon icon={faPen} />
          </button>
        </div>
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Company Name:</span>
            <span className={styles.infoValue}>{company.name}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Email:</span>
            <span className={styles.infoValue}>{company.email}</span>
          </div>
          {company.address && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Address:</span>
              <span className={styles.infoValue}>
                {company.address.addressLine1} {company.address.addressLine2}{" "}
                {company.address.street} {company.address.landmark},{" "}
                {company.address.city} , {company.address.state},{" "}
                {company.address.country}- {company.address.zipcode}
              </span>
            </div>
          )}
          {company.contactPerson && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Contact Person:</span>
              <span className={styles.infoValue}>
                {company.contactPerson.name} (
                {company.contactPerson.contact.phoneCountry}{" "}
                {company.contactPerson.contact.phone})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Credentials */}

      <div className={styles.clientCard}>
        <div className={styles.cardHeader}>
          <h3>Credentials</h3>
          <button className={styles.editBtn}
            onClick={() => navigate(`/admin/edit-client/${client._id}`)}
          
          >
            <FontAwesomeIcon icon={faPen} />
          </button>
        </div>
        <div className={styles.infoGrid}>
          {company.licenseDetails && (
            <>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>License Type:</span>
                <span className={styles.infoValue}>
                  {company.licenseDetails.licenseType}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>License Number:</span>
                <span className={styles.infoValue}>
                  {company.licenseDetails.licenseNumber}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>License Issue Date:</span>
                <span className={styles.infoValue}>
                  {formatDateToDDMMYYYY(
                    company.licenseDetails.licenseIssueDate
                  )}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>License Expiry Date:</span>
                <span className={styles.infoValue}>
                  {formatDateToDDMMYYYY(company.licenseDetails.licenseExpiry)}
                </span>
              </div>
            </>
          )}

          {company.financialYear && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Financial Year:</span>
              <span className={styles.infoValue}>
                {formatDateToDDMMYYYY(company.financialYear.startDate)} -{" "}
                {formatDateToDDMMYYYY(company.financialYear.endDate)}
              </span>
            </div>
          )}

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Tax Registration Number:</span>
            <span className={styles.infoValue}>
              {company.taxRegistrationNumber}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Business Type:</span>
            <span className={styles.infoValue}>{company.businessType}</span>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className={styles.clientCard} id="documents">
        <div className={styles.cardHeader}>
          <h3>Documents</h3>
          <button className={styles.editBtn}
            onClick={() => navigate(`/admin/edit-client/${client._id}`)}
          
          >
            <FontAwesomeIcon icon={faPen} />
          </button>
        </div>

        {/* Filters */}
        <div className={styles.filterBar}>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className={styles.filterInput}
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
            className={styles.filterInput}
          />
        </div>

        {/* {filteredDocuments.length > 0 ? (
          <ul className={styles.documentList}>
            {filteredDocuments.map((doc) => (
              <li className={styles.documentItem} key={doc._id}>
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
                    className={styles.viewLink}
                  >
                    View Document
                  </a>
                </p>

                <div className={styles.docAction}>
                  <label className={styles.docLabel}>Comments:</label>
                  <input
                    type="text"
                    className={styles.docInput}
                    value={editedDocs[doc._id]?.comments || ""}
                    onChange={(e) =>
                      handleFieldChange(doc._id, "comments", e.target.value)
                    }
                    placeholder="Add comment..."
                  />
                </div>

                <div className={styles.docAction}>
                  <label className={styles.docLabel}>
                    Status: {editedDocs[doc._id]?.status}
                  </label>
                  <select
                    className={styles.docSelect}
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

                <div className={styles.docAction}>
                  <button
                    className={styles.docUpdateBtn}
                    onClick={() => handleUpdate(doc._id)}
                  >
                    Update
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyText}>No documents found</p>
        )} */}
        {filteredDocuments.length > 0 ? (
          <table className={styles.documentTable}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th>Document</th>
                <th>Comments</th>
                <th>Change Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc._id}>
                  <td>
                    {
                      Object.entries(DocumentType).find(
                        ([, v]) => v === doc.documentDetails.documentType
                      )?.[0]
                    }
                  </td>
                  <td>
                    {
                      Object.entries(DocStatus).find(
                        ([, v]) => v === doc.documentDetails.docStatus
                      )?.[0]
                    }
                  </td>
                  <td>
                    {formatDateToDDMMYYYY(doc.documentDetails.uploadedAt)}
                  </td>
                  <td>
                    <a
                      href={`${ADMIN_END_POINT}/files/${doc.documentDetails.document.replace(
                        "uploads/document/",
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.viewLink}
                    >
                      View
                    </a>
                  </td>
                  <td>
                    <input
                      type="text"
                      className={styles.docInput}
                      value={editedDocs[doc._id]?.comments || ""}
                      onChange={(e) =>
                        handleFieldChange(doc._id, "comments", e.target.value)
                      }
                      placeholder="Add comment..."
                    />
                  </td>
                  <td>
                    <select
                      className={styles.docSelect}
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
                  </td>
                  <td>
                    <button
                      className={styles.docUpdateBtn}
                      onClick={() => handleUpdate(doc._id)}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.emptyText}>No documents found</p>
        )}
      </div>

      {/* Invoices */}
      <div className={styles.clientCard}>
        <div className={styles.cardHeader}>
          <h3>Invoices</h3>
          <button
            className={styles.gtBtn}
            onClick={() => handleGenerateInvoice(client._id)}
          >
            Generate Invoice
          </button>
        </div>

        {invoices?.invoiceList?.length > 0 ? (
          <table className={styles.invoiceTable}>
            <thead>
              <tr>
                <th>Index</th>
                <th>Invoice Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.invoiceList.map((doc, idx) => (
                <tr key={idx} className={styles.invoiceRow}>
                  <td>{idx + 1}</td>
                  <td>{doc.invoiceNumber}</td>
                  <td>
                    <div className={styles.invoiceButtons}>
                      <a
                        href={`${ADMIN_END_POINT}/invoice/${doc.invoice.replace(
                          "uploads/invoice/",
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.invoiceLink} ${styles.view}`}
                      >
                        <FontAwesomeIcon icon={faEye} /> View
                      </a>
                      <a
                        href={`${ADMIN_END_POINT}/invoice/${doc.invoice.replace(
                          "uploads/invoice/",
                          ""
                        )}?download=true`}
                        className={`${styles.invoiceLink} ${styles.download}`}
                      >
                        <FontAwesomeIcon icon={faDownload} /> Download
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.emptyText}>No invoices available</p>
        )}
      </div>
    </div>
  );
}

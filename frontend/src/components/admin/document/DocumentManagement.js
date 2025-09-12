// import { useEffect, useState } from "react";
// import styles from "../../../styles/documentManagement.module.css";
// import { ADMIN_END_POINT, DocStatus } from "../../../utils/constants";
// import Sidebar from "../../Sidebar";
// import { useNavigate } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faArrowLeft, faFolderOpen, faTrash } from "@fortawesome/free-solid-svg-icons";
// import { toast } from "react-toastify";
// const API_URL = `${ADMIN_END_POINT}/document-management`;

// const docTypeMap = {
//   1: "VATcertificate",
//   2: "CorporateTaxDocument",
//   3: "BankStatement",
//   4: "Invoice",
//   5: "auditFiles",
//   6: "TradeLicense",
//   7: "passport",
//   8: "FinancialStatements",
//   9: "BalanceSheet",
//   10: "Payroll",
//   11: "WPSReport",
//   12: "ExpenseReciept",
// };

// export default function DocumentManagement() {
//   const [documents, setDocuments] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchDocuments();
//   }, [searchTerm]);

//   const fetchDocuments = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(
//         `${API_URL}?searchTerm=${encodeURIComponent(searchTerm)}`,
//         { method: "GET", credentials: "include" }
//       );

//       if (!res.ok) {
//         let errorData = await res.json();
//         toast.error(errorData.error || "Ooops, error in fetching documents...");
//       }

//       const data = await res.json();
//       setDocuments(data.records || []);
//     } catch (err) {
//       toast.error("Ooops, error in fetching documents...");
//       console.error("Error fetching documents", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (clientId, docId) => {
//     if (!window.confirm("Are you sure you want to delete this document?"))
//       return;
//     try {
//       const res = await fetch(`${ADMIN_END_POINT}/delete-document`, {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ clientId, docId }),
//       });
//       if (res.ok) {
//         toast.success("Document deleted successfully");
//         fetchDocuments();
//       } else {
//         let errorData = await res.json();
//         toast.error(errorData.error || "Failed to delete document");
//       }
//     } catch (err) {
//       console.error("Error deleting document", err);
//       toast.error("Something went wrong while deleting.");
//     }
//   };

//   const categorizedDocs = documents.map((client) => {
//     let categories = {};
//     client.documents.forEach((doc) => {
//       const type = doc.documentDetails.documentType;
//       const category = docTypeMap[type];
//       if (!categories[category]) categories[category] = [];
//       categories[category].push(doc);
//     });
//     return { ...client, categories };
//   });

//   return (
//     <div className={styles.container}>
//       <Sidebar />

//       <div className={styles.title}>
//         <h1>

//         <FontAwesomeIcon icon={faFolderOpen} /> Document Management
//         </h1>
//       </div>

//       <div className={styles.searchContainer}>
//         <input
//           type="text"
//           placeholder="Search documents..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className={styles.searchInput}
//         />
//       </div>

//       {loading ? (
//         <p className={styles.loading}>Loading documents...</p>
//       ) : documents.length === 0 ? (
//         <p className={styles.empty}>No document uploaded</p>
//       ) : (
//         <div className={styles.clientList}>
//           {categorizedDocs.map((client) => (
//             <div key={client._id} className={styles.clientCard}>
//               <h3
//                 className={styles.clientTitle}
//                 onClick={() =>
//                   navigate(`/admin/client-detail/${client.clientId}`, {
//                     state: { scrollToDocuments: true },
//                   })
//                 }
//               >
//                 Client Name: <span>{client.client.name}</span>
//               </h3>

//               {Object.keys(client.categories).map((category) => (
//                 <div key={category} className={styles.category}>
//                   <h4 className={styles.categoryTitle}>{category}</h4>
//                   <ul className={styles.docList}>
//                     {client.categories[category].map((doc) => (
//                       <li key={doc._id} className={styles.docItem}>
//                         <a
//                           href={`http://localhost:8000/${doc.documentDetails.document}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className={styles.docLink}
//                         >
//                           {doc.documentDetails.document.split("/").pop()}
//                         </a>
//                         <span className={styles.docStatus}>
//                           Status:{" "}
//                           {
//                             Object.entries(DocStatus).find(
//                               ([, v]) => v === doc.documentDetails.docStatus
//                             )?.[0]
//                           }
//                         </span>
//                         <button
//                           className={styles.deleteBtn}
//                           onClick={() => handleDelete(client.clientId, doc._id)}
//                         >
//                           <FontAwesomeIcon icon={faTrash} /> Delete
//                         </button>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>
//       )}
//       <button
//           className={styles.backButton}
//           onClick={() => window.history.back()}
//         >
//           Back
//           <div className={styles.icon}>
//             <FontAwesomeIcon icon={faArrowLeft} />
//           </div>
//         </button>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import styles from "../../../styles/documentManagement2.module.css";
import { ADMIN_END_POINT, DocStatus } from "../../../utils/constants";
import Sidebar from "../../Sidebar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaDownload,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaCircle,
} from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFolderOpen } from "@fortawesome/free-solid-svg-icons";

const API_URL = `${ADMIN_END_POINT}/document-management`;

const docTypeMap = {
  1: "VATcertificate",
  2: "CorporateTaxDocument",
  3: "BankStatement",
  4: "Invoice",
  5: "auditFiles",
  6: "TradeLicense",
  7: "passport",
  8: "FinancialStatements",
  9: "BalanceSheet",
  10: "Payroll",
  11: "WPSReport",
  12: "ExpenseReciept",
};

export default function DocumentManagement() {
  const [documents, setDocuments] = useState([]);
  const [filters, setFilters] = useState({
    documentType: "All",
    status: "All",
    uploadDateFrom: "",
    uploadDateTo: "",
    searchTerm: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [editedDocs, setEditedDocs] = useState({});

  // fetch documents from API
  useEffect(() => {
    fetchDocuments();
  }, [filters.searchTerm]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}?searchTerm=${encodeURIComponent(filters.searchTerm)}`,
        { method: "GET", credentials: "include" }
      );
      if (!res.ok) {
        let errorData = await res.json();
        toast.error(errorData.error || "Ooops, error in fetching documents...");
      }
      const data = await res.json();
      const docs = data.records || [];
      setDocuments(docs);
      // calculate pending
      const allDocs = docs.flatMap((c) => c.documents);
      const pendingDocs = allDocs.filter(
        (d) => d.documentDetails.docStatus === "Pending"
      ).length;
      setPendingCount(pendingDocs);
    } catch (err) {
      toast.error("Ooops, error in fetching documents...");
      console.error("Error fetching documents", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clientId, docId) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;
    try {
      const res = await fetch(`${ADMIN_END_POINT}/delete-document`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ clientId, docId }),
      });
      if (res.ok) {
        toast.success("Document deleted successfully");
        fetchDocuments();
      } else {
        let errorData = await res.json();
        toast.error(errorData.error || "Failed to delete document");
      }
    } catch (err) {
      console.error("Error deleting document", err);
      toast.error("Something went wrong while deleting.");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  // flatten all client documents into a single array for filtering
  const allDocsFlattened = documents.flatMap((client) =>
    client.documents.map((doc) => ({
      ...doc,
      clientName: client.client.name,
      clientId: client.clientId,
    }))
  );

  // filtering logic
  const filteredDocuments = allDocsFlattened.filter((doc) => {
    // Safely extract details
    const details = doc?.documentDetails || {};

    const docType = Number(details.documentType); // now numeric
    const docStatus = Number(details.docStatus); // now numeric
    const uploaded = details.uploadedAt ? new Date(details.uploadedAt) : null;

    // ✅ Handle "All" → means don’t filter by that
    const docTypeMatch =
      filters.documentType === "All" ||
      docType === Number(filters.documentType);

    const statusMatch =
      filters.status === "All" || docStatus === Number(filters.status);

    // ✅ Date filtering
    const dateFromMatch =
      !filters.uploadDateFrom ||
      (uploaded && uploaded >= new Date(filters.uploadDateFrom));

    const dateToMatch =
      !filters.uploadDateTo ||
      (uploaded && uploaded <= new Date(filters.uploadDateTo));

    // ✅ Exclude soft-deleted docs if needed
    const notDeleted = !details.deleteDoc;

    return (
      docTypeMatch && statusMatch && dateFromMatch && dateToMatch && notDeleted
    );
  });

  // pagination
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDocuments = filteredDocuments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // status UI helpers
  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <FaCheckCircle className={styles.approvedIcon} />;
      case "Pending":
        return <FaCircle className={styles.pendingIcon} />;
      case "Rejected":
        return <FaTimesCircle className={styles.rejectedIcon} />;
      default:
        return null;
    }
  };

  const getStatusButtonClass = (status) => {
    switch (status) {
      case "Approved":
        return styles.statusApproved;
      case "Pending":
        return styles.statusPending;
      case "Rejected":
        return styles.statusRejected;
      default:
        return "";
    }
  };

  const lastUpload =
    allDocsFlattened.length > 0
      ? allDocsFlattened
          .map((d) => new Date(d.documentDetails.uploadedAt))
          .sort((a, b) => b - a)[0]
          .toISOString()
          .split("T")[0]
      : "N/A";

  const handleUpdate = async (docId, clientId, status) => {
    try {
      // const { status, comments } = editedDocs[docId];
      const comments = editedDocs[docId]?.comments;
      console.log("status", status);

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
      await fetchDocuments();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  return (
    <div className={styles.container}>
      {/* keep your Sidebar untouched */}
      <Sidebar />

      <div className={styles.mainContent}>
        <header className={styles.title}>
          <h1>
            <FontAwesomeIcon icon={faFolderOpen} /> Document Management
          </h1>
        </header>

        <section className={styles.documentHeader}>
          <div className={styles.summaryStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total Documents:</span>
              <span className={styles.statValue}>
                {allDocsFlattened.length}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Pending Approval:</span>
              <span className={styles.statValue}>{pendingCount}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Last Upload:</span>
              <span className={styles.statValue}>
                {new Date(lastUpload)
                  .toLocaleDateString("en-GB")
                  .replace(/\//g, "-")}
              </span>
            </div>
          </div>
        </section>

        <div className={styles.searchBar}>
          <input
            type="text"
            name="searchTerm"
            placeholder="Search documents.."
            value={filters.searchTerm}
            onChange={handleFilterChange}
          />
        </div>

        {/* Filters */}
        <section className={styles.filtersSection}>
          <div className={styles.filterGroup}>
            <label>Document Type</label>
            <select
              name="documentType"
              value={filters.documentType}
              onChange={handleFilterChange}
            >
              <option value="All">All</option>
              {Object.entries(docTypeMap).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="All">All</option>
              {Object.entries(DocStatus).map(([key, value]) => (
                <option key={value} value={value}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Upload Date: From</label>
            <input
              type="date"
              name="uploadDateFrom"
              value={filters.uploadDateFrom}
              onChange={handleFilterChange}
            />
          </div>
          <div className={styles.filterGroup}>
            <label>To</label>
            <input
              type="date"
              name="uploadDateTo"
              value={filters.uploadDateTo}
              onChange={handleFilterChange}
            />
          </div>
        </section>

        {/* Document Table */}
        {loading ? (
          <p className={styles.loading}>Loading documents...</p>
        ) : (
          <section className={styles.documentTable}>
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Document Name</th>
                  <th>Document Type / Upload Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentDocuments.map((doc) => (
                  <tr key={doc._id}>
                    <td>{doc.clientName}</td>
                    <td>{doc.documentDetails.document.split("/").pop()}</td>
                    <td>
                      {docTypeMap[doc.documentDetails.documentType]} <br />
                      {doc.documentDetails?.uploadedAt
                        ? new Date(
                            doc.documentDetails.uploadedAt
                          ).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td>
                      {(() => {
                        // Get current DB status key
                        const currentStatusKey =
                          Object.entries(DocStatus).find(
                            ([, v]) => v === doc.documentDetails.docStatus
                          )?.[0] || "";

                        const statusClass =
                          currentStatusKey === "approved"
                            ? styles.statusApproved
                            : currentStatusKey === "rejected"
                            ? styles.statusRejected
                            : styles.statusPending;

                        return (
                          <select
                            className={`${styles.statusButton} ${statusClass}`}
                            value={
                              editedDocs[doc._id]?.status || currentStatusKey
                            }
                            onChange={(e) => {
                              const selectedStatus = e.target.value;

                              console.log("ddj", selectedStatus);

                              // update local state
                              setEditedDocs((prev) => ({
                                ...prev,
                                [doc._id]: {
                                  ...prev[doc._id],
                                  status: selectedStatus,
                                },
                              }));

                              // call handleUpdate immediately with new status
                              handleUpdate(
                                doc._id,
                                doc.clientId,
                                selectedStatus
                              );
                            }}
                          >
                            {Object.keys(DocStatus).map((key) => (
                              <option key={key} value={key}>
                                {key}
                              </option>
                            ))}
                          </select>
                        );
                      })()}
                    </td>
                    <td className={styles.statusActions}>
                      <a
                        href={`http://localhost:8000/${doc.documentDetails.document}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.downloadBtn}
                      >
                        <FaDownload />
                      </a>
                      <button
                        onClick={() => handleDelete(doc.clientId, doc._id)}
                        className={styles.deleteBtn}
                      >
                        <FaTrash />
                      </button>
                      {doc.documentDetails.docStatus === "Pending" && (
                        <div className={styles.actionIcons}>
                          <FaCheckCircle className={styles.approveIcon} />
                          <FaTimesCircle className={styles.rejectIcon} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={currentPage === i + 1 ? styles.activePage : ""}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </section>
        )}

        <button
          className={styles.backButton}
          onClick={() => window.history.back()}
        >
          Back
          <div className={styles.icon}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </div>
        </button>
      </div>
    </div>
  );
}

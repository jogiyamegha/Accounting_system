import { useEffect, useState } from "react";
import styles from "../../../styles/documentManagement.module.css";
import { ADMIN_END_POINT, DocStatus } from "../../../utils/constants";
import Sidebar from "../../Sidebar";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, [searchTerm]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}?searchTerm=${encodeURIComponent(searchTerm)}`,
        { method: "GET", credentials: "include" }
      );

      if (!res.ok) {
        let errorData = await res.json();
        toast.error(errorData.error || "Ooops, error in fetching documents...");
      }

      const data = await res.json();
      setDocuments(data.records || []);
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

  const categorizedDocs = documents.map((client) => {
    let categories = {};
    client.documents.forEach((doc) => {
      const type = doc.documentDetails.documentType;
      const category = docTypeMap[type];
      if (!categories[category]) categories[category] = [];
      categories[category].push(doc);
    });
    return { ...client, categories };
  });

  return (
    <div className={styles.container}>
      <Sidebar />
      
      <div className={styles.title}>
        <h1>

        <FontAwesomeIcon icon={faFolderOpen} /> Document Management
        </h1>
      </div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {loading ? (
        <p className={styles.loading}>Loading documents...</p>
      ) : documents.length === 0 ? (
        <p className={styles.empty}>No document uploaded</p>
      ) : (
        <div className={styles.clientList}>
          {categorizedDocs.map((client) => (
            <div key={client._id} className={styles.clientCard}>
              <h3
                className={styles.clientTitle}
                onClick={() =>
                  navigate(`/admin/client-detail/${client.clientId}`, {
                    state: { scrollToDocuments: true },
                  })
                }
              >
                Client Name: <span>{client.client.name}</span>
              </h3>

              {Object.keys(client.categories).map((category) => (
                <div key={category} className={styles.category}>
                  <h4 className={styles.categoryTitle}>{category}</h4>
                  <ul className={styles.docList}>
                    {client.categories[category].map((doc) => (
                      <li key={doc._id} className={styles.docItem}>
                        <a
                          href={`http://localhost:8000/${doc.documentDetails.document}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.docLink}
                        >
                          {doc.documentDetails.document.split("/").pop()}
                        </a>
                        <span className={styles.docStatus}>
                          Status:{" "}
                          {
                            Object.entries(DocStatus).find(
                              ([, v]) => v === doc.documentDetails.docStatus
                            )?.[0]
                          }
                        </span>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(client.clientId, doc._id)}
                        >
                          <FontAwesomeIcon icon={faTrash} /> Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import "../../../styles/documentMangement.css";
import { ADMIN_END_POINT, DocStatus } from "../../../utils/constants";
import Sidebar from "../../Sidebar";
import { useNavigate } from "react-router-dom";

const API_URL = `${ADMIN_END_POINT}/document-management`; // adjust backend URL

// Map backend documentType numbers → categories
const docTypeMap = {
  1: "Financial Statements",
  2: "VAT Returns & Invoices",
  3: "Payroll & WPS Reports",
  4: "Bank Statements",
  5: "Expense Receipts",
  6: "Audit Reports",
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
        {
          method: "GET",

          credentials: "include",
        }
      );
      const data = await res.json();
      setDocuments(data.records || []);
    } catch (err) {
      console.error("Error fetching documents", err);
    } finally {
      setLoading(false);
    }
  };

  // Group documents by client and category
  const categorizedDocs = documents.map((client) => {
    let categories = {};
    client.documents.forEach((doc) => {
      const type = doc.documentDetails.documentType;
      const category = docTypeMap[type] || "Other";

      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(doc);
    });

    return { ...client, categories };
  });
//   console.log("gbhnj", categorizedDocs);

  return (
    <div className="doc-management-container">
      <Sidebar />
      <h2 className="doc-title">📂 Document Management</h2>

      {/* Search bar */}
      <div className="doc-search-container">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="doc-search-input"
        />
      </div>

      {loading ? (
        <p className="doc-loading">Loading documents...</p>
      ) : (
        <div className="doc-client-list">
          {categorizedDocs.map((client) => (
            <div key={client._id} className="doc-client-card">
              <h3
                className="doc-client-title "
                onClick={() =>
                  navigate(`/admin/client-detail/${client.clientId}`, {
                    state: { scrollToDocuments: true },
                  })
                }
              >
                Client Name: <span>{client.client.name}</span>
              </h3>

              {/* Categories inside client */}
              {Object.keys(client.categories).map((category) => (
                <div key={category} className="doc-category">
                  <h4 className="doc-category-title">{category}</h4>
                  <ul className="doc-list">
                    {client.categories[category].map((doc) => (
                      <li key={doc._id} className="doc-item">
                        <a
                          href={`http://localhost:8000/${doc.documentDetails.document}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="doc-link"
                        >
                          {doc.documentDetails.document.split("/").pop()}
                        </a>
                        <span className="doc-status">
                          Status:{" "}
                          {
                            Object.entries(DocStatus).find(
                              ([, v]) => v === doc.documentDetails.docStatus
                            )?.[0]
                          }
                        </span>
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

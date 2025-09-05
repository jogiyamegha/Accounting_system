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
  faTimes,
  faUserEdit,
} from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../../Sidebar";
import { toast } from "react-toastify";
import { countries } from "../../../utils/countries";

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

  const [isEditing, setIsEditing] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [companyData, setCompanyData] = useState(null);

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
        setClientData(result.client);
        setCompanyData(result.company);
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
        } else {
          let errorData = await res.json();
          toast.error(errorData.error || "Error fetching invoices");
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

  const handleClientChange = (field, value) => {
    setClientData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClientNestedChange = (nested, field, value) => {
    setClientData((prev) => ({
      ...prev,
      [nested]: { ...prev[nested], [field]: value },
    }));
  };

  const handleCompanyChange = (field, value) => {
    setCompanyData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCompanyNestedChange = (nested, field, value) => {
    setCompanyData((prev) => ({
      ...prev,
      [nested]: { ...prev[nested], [field]: value },
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

  const handleEdit = async () => {
    try {
      if (!clientId) return;
      setError("");
      setLoading(true);

      // merge client + company
      const mergedData = { ...clientData, ...companyData };

      const formData = new FormData();
      for (const [key, value] of Object.entries(mergedData)) {
        formData.append(key, value ?? "");
      }

      documents.forEach((doc, index) => {
        if (doc.file) {
          formData.append(`documents[${index}][file]`, doc.file);
        }
        if (doc.documentType) {
          formData.append(
            `documents[${index}][documentType]`,
            doc.documentType
          );
        }
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
        toast.error(errorText || "Failed to update client");
        return;
      }

      toast.success("Client updated successfully!");
      setIsEditing(false);
      navigate(`/admin/client-detail/${clientId}`);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.clientDetailPage}>
      <Sidebar />

      <div className={styles.adjustment}>
        <h2 className={styles.pageTitle}>
          {" "}
          <FontAwesomeIcon icon={faClipboardList} /> Client Details
        </h2>
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
                  <span className={styles.infoValue}>
                    Mobile: {client.contact.phoneCountry} {client.contact.phone}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <div className={styles.clientCard}>
        <div className={styles.cardHeader}>
          <h3>Personal Information</h3>
          <button
            className={styles.editBtn}
            // onClick={() => navigate(`/admin/edit-client/${client._id}`)}
            onClick={() => setIsEditing((prev) => !prev)}
          >
            <FontAwesomeIcon icon={isEditing ? faTimes : faUserEdit} />{" "}
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Name:</span>

            {isEditing ? (
              <input
                value={client.name || ""}
                onChange={(e) => handleClientChange("name", e.target.value)}
              />
            ) : (
              <span className={styles.infoValue}>{client?.name}</span>
            )}
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Email:</span>
            <span className={styles.infoValue}>{client?.email}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Phone:</span>
            <span className={styles.infoValue}>
              {client.contact &&
                (isEditing ? (
                  <>
                    <select
                      name="phoneCountry"
                      value={client.contact?.phoneCountry || ""}
                      onChange={(e) =>
                        handleClientNestedChange(
                          "contact",
                          "phoneCountry",
                          e.target.value
                        )
                      }
                      style={{ width: "80px" }}
                      required
                    >
                      <option value="">Select</option>
                      {countries.map((c) => (
                        <option key={`${c.code}-${c.name}`} value={c.code}>
                          ({c.code}){c.name}
                        </option>
                      ))}
                    </select>
                    <input
                      value={client.contact?.phone || ""}
                      onChange={(e) =>
                        handleClientNestedChange(
                          "contact",
                          "phone",
                          e.target.value
                        )
                      }
                    />
                  </>
                ) : (
                  <>
                    {client?.contact?.phoneCountry} {client?.contact?.phone}
                  </>
                ))}
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Role:</span>
            {isEditing ? (
              <input
                value={client.position || ""}
                onChange={(e) => handleClientChange("position", e.target.value)}
              />
            ) : (
              <span className={styles.infoValue}>{client?.position}</span>
            )}
          </div>
        </div>
      </div>

      {/* Company */}
      <div className={styles.clientCard}>
        <div className={styles.cardHeader}>
          <h3>Company Information</h3>
          <button
            className={styles.editBtn}
            // onClick={() => navigate(`/admin/edit-client/${client._id}`)}
            onClick={() => setIsEditing((prev) => !prev)}
          >
            <FontAwesomeIcon icon={isEditing ? faTimes : faUserEdit} />{" "}
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Company Name:</span>
            {isEditing ? (
              <input
                value={company.name || ""}
                onChange={(e) => handleCompanyChange("name", e.target.value)}
              />
            ) : (
              <span className={styles.infoValue}>{company.name}</span>
            )}
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Email:</span>
            {isEditing ? (
              <input
                value={company.email || ""}
                onChange={(e) => handleCompanyChange("email", e.target.value)}
              />
            ) : (
              <span className={styles.infoValue}>{company.email}</span>
            )}
          </div>
          {company.address && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Address:</span>
              <span className={styles.infoValue}>
                <span>
                  {isEditing ? (
                    <>
                      <strong>Address Line 1:</strong>{" "}
                      <input
                        value={company.address?.addressLine1 || ""}
                        onChange={(e) =>
                          handleCompanyNestedChange(
                            "address",
                            "addressLine1",
                            e.target.value
                          )
                        }
                      />
                    </>
                  ) : (
                    company.address?.addressLine1
                  )}
                </span>{" "}
                <span>
                  {isEditing ? (
                    <>
                      <strong>Address Line 2:</strong>{" "}
                      <input
                        value={company.address?.addressLine2 || ""}
                        onChange={(e) =>
                          handleCompanyNestedChange(
                            "address",
                            "addressLine2",
                            e.target.value
                          )
                        }
                      />
                    </>
                  ) : (
                    company.address?.addressLine2
                  )}
                </span>{" "}
                <span>
                  {isEditing ? (
                    <>
                      <strong>Street:</strong>{" "}
                      <input
                        value={company.address?.street || ""}
                        onChange={(e) =>
                          handleCompanyNestedChange(
                            "address",
                            "street",
                            e.target.value
                          )
                        }
                      />
                    </>
                  ) : (
                    company.address?.street
                  )}
                </span>{" "}
                <span>
                  {isEditing ? (
                    <>
                      <strong>Landmark:</strong>{" "}
                      <input
                        value={company.address?.landmark || ""}
                        onChange={(e) =>
                          handleCompanyNestedChange(
                            "address",
                            "landmark",
                            e.target.value
                          )
                        }
                      />
                    </>
                  ) : (
                    company.address?.landmark
                  )}
                </span>{" "}
                <span>
                  {isEditing ? (
                    <>
                      <strong>City:</strong>{" "}
                      <input
                        value={company.address?.city || ""}
                        onChange={(e) =>
                          handleCompanyNestedChange(
                            "address",
                            "city",
                            e.target.value
                          )
                        }
                      />
                    </>
                  ) : (
                    company.address?.city
                  )}
                </span>{" "}
                <span>
                  {isEditing ? (
                    <>
                      <strong>State:</strong>{" "}
                      <input
                        value={company.address?.state || ""}
                        onChange={(e) =>
                          handleCompanyNestedChange(
                            "address",
                            "state",
                            e.target.value
                          )
                        }
                      />
                    </>
                  ) : (
                    company.address?.state
                  )}
                </span>{" "}
                <span>
                  {isEditing ? (
                    <>
                      <strong>Country:</strong>{" "}
                      <select
                        name="country"
                        value={company.country}
                        onChange={(e) =>
                          handleCompanyChange("country", e.target.value)
                        }
                        required
                      >
                        <option value="">{company.address?.country}</option>
                        {countries.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    company.address?.country
                  )}
                </span>{" "}
                <span>
                  {isEditing ? (
                    <>
                      <strong>Zipcode:</strong>{" "}
                      <input
                        type="number"
                        value={company.address?.zipcode || ""}
                        onChange={(e) =>
                          handleCompanyNestedChange(
                            "address",
                            "zipcode",
                            e.target.value
                          )
                        }
                      />
                    </>
                  ) : (
                    company.address?.zipcode
                  )}
                </span>
              </span>
            </div>
          )}

          {company.contactPerson && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Contact Person:</span>
              <span className={styles.infoValue}>
                {isEditing ? (
                  <>
                    <p>
                      <strong>Name:</strong>{" "}
                      <input
                        value={company.contactPerson?.name || ""}
                        onChange={(e) =>
                          handleCompanyNestedChange(
                            "contactPerson",
                            "name",
                            e.target.value
                          )
                        }
                      />
                    </p>
                  </>
                ) : (
                  company.contactPerson?.name
                )}{" "}
                {isEditing ? (
                  <>
                    <p>
                      <strong>Phone Country:</strong>{" "}
                      <select
                        style={{ width: "70px" }}
                        value={
                          company.contactPerson?.contact?.phoneCountry || ""
                        }
                        onChange={(e) =>
                          setCompanyData((prev) => ({
                            ...prev,
                            contactPerson: {
                              ...prev.contactPerson,
                              contact: {
                                ...prev.contactPerson.contact,
                                phoneCountry: e.target.value,
                              },
                            },
                          }))
                        }
                      >
                        <option value="">Select</option>
                        {countries.map((c) => (
                          <option key={`${c.code}-${c.name}`} value={c.code}>
                            ({c.code}){c.name}
                          </option>
                        ))}
                      </select>
                    </p>
                  </>
                ) : (
                  company.contactPerson?.contact?.phoneCountry
                )}{" "}
                {isEditing ? (
                  <>
                    <p>
                      <strong>Phone:</strong>{" "}
                      <input
                        value={company.contactPerson?.contact?.phone || ""}
                        onChange={(e) =>
                          setCompanyData((prev) => ({
                            ...prev,
                            contactPerson: {
                              ...prev.contactPerson,
                              contact: {
                                ...prev.contactPerson.contact,
                                phone: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </p>
                  </>
                ) : (
                  company.contactPerson?.contact?.phone
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Credentials */}

      <div className={styles.clientCard}>
        <div className={styles.cardHeader}>
          <h3>Credentials</h3>
          <button
            className={styles.editBtn}
            // onClick={() => navigate(`/admin/edit-client/${client._id}`)}
            onClick={() => setIsEditing((prev) => !prev)}
          >
            <FontAwesomeIcon icon={isEditing ? faTimes : faUserEdit} />{" "}
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>
        <div className={styles.infoGrid}>
          {company.licenseDetails && (
            <>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>License Type:</span>
                <span className={styles.infoValue}>
                  {isEditing ? (
                    <select
                      value={company.licenseDetails?.licenseType || ""}
                      onChange={(e) =>
                        handleCompanyNestedChange(
                          "licenseDetails",
                          "licenseType",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        {company.licenseDetails?.licenseType}
                      </option>
                      <option value="Trade License">Trade License</option>
                      <option value="Industrial License">
                        Industrial License
                      </option>
                      <option value="Professional License">
                        Professional License
                      </option>
                      <option value="Commercial License">
                        Commercial License
                      </option>
                    </select>
                  ) : (
                    company.licenseDetails?.licenseType
                  )}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>License Number:</span>
                <span className={styles.infoValue}>
                  {isEditing ? (
                    <input
                      value={company.licenseDetails?.licenseNumber || ""}
                      onChange={(e) =>
                        handleCompanyNestedChange(
                          "licenseDetails",
                          "licenseNumber",
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    company.licenseDetails?.licenseNumber
                  )}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>License Issue Date:</span>
                <span className={styles.infoValue}>
                  {isEditing ? (
                    <input
                      type="date"
                      value={
                        company.licenseDetails?.licenseIssueDate
                          ? new Date(company.licenseDetails.licenseIssueDate)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleCompanyNestedChange(
                          "licenseDetails",
                          "licenseIssueDate",
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    formatDateToDDMMYYYY(
                      company.licenseDetails?.licenseIssueDate
                    )
                  )}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>License Expiry Date:</span>
                <span className={styles.infoValue}>
                  {isEditing ? (
                    <input
                      type="date"
                      value={
                        company.licenseDetails?.licenseExpiry
                          ? new Date(company.licenseDetails.licenseExpiry)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleCompanyNestedChange(
                          "licenseDetails",
                          "licenseExpiry",
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    formatDateToDDMMYYYY(company.licenseDetails?.licenseExpiry)
                  )}
                </span>
              </div>
            </>
          )}

          {company.financialYear && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Financial Year:</span>
              <span className={styles.infoValue}>
                {isEditing ? (
                  <>
                    <input
                      type="date"
                      value={
                        company.financialYear?.startDate
                          ? new Date(company.financialYear.startDate)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleCompanyNestedChange(
                          "financialYear",
                          "startDate",
                          e.target.value
                        )
                      }
                    />
                    {" - "}
                    <input
                      type="date"
                      value={
                        company.financialYear?.endDate
                          ? new Date(company.financialYear.endDate)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleCompanyNestedChange(
                          "financialYear",
                          "endDate",
                          e.target.value
                        )
                      }
                    />
                  </>
                ) : (
                  <>
                    {formatDateToDDMMYYYY(company.financialYear?.startDate)} -{" "}
                    {formatDateToDDMMYYYY(company.financialYear?.endDate)}
                  </>
                )}
              </span>
            </div>
          )}

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Tax Registration Number:</span>
            <span className={styles.infoValue}>
              {isEditing ? (
                <input
                  type="text"
                  value={company.taxRegistrationNumber || ""}
                  onChange={(e) =>
                    handleCompanyChange("taxRegistrationNumber", e.target.value)
                  }
                />
              ) : (
                company.taxRegistrationNumber
              )}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Business Type:</span>
            <span className={styles.infoValue}>
              {isEditing ? (
                <select
                  name="businessType"
                  value={company.businessType}
                  onChange={(e) =>
                    handleCompanyChange("businessType", e.target.value)
                  }
                  required
                >
                  <option value="">{company.businessType}</option>
                  <option value="Sole Proprietorship">
                    Sole Proprietorship
                  </option>
                  <option value="Partnership">Partnership</option>
                  <option value="Corporation">Corporation</option>
                  <option value="LLC">LLC</option>
                  <option value="Non-Profit">Non-Profit</option>
                </select>
              ) : (
                company.businessType
              )}{" "}
            </span>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className={styles.clientCard} id="documents">
        <div className={styles.cardHeader}>
          <h3>Documents</h3>
          <button
            className={styles.editBtn}
            // onClick={() => navigate(`/admin/edit-client/${client._id}`)}
            onClick={() => setIsEditing((prev) => !prev)}
          >
            <FontAwesomeIcon icon={isEditing ? faTimes : faUserEdit} />{" "}
            {isEditing ? "Cancel" : "Edit"}
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
                  {/* Document Type */}
                  <td>
                    {isEditing ? (
                      <select
                        className={styles.docSelect}
                        value={
                          editedDocs[doc._id]?.documentType ||
                          doc.documentDetails.documentType
                        }
                        onChange={(e) =>
                          handleFieldChange(
                            doc._id,
                            "documentType",
                            e.target.value
                          )
                        }
                      >
                        {Object.entries(DocumentType).map(([key, val]) => (
                          <option key={val} value={val}>
                            {key}
                          </option>
                        ))}
                      </select>
                    ) : (
                      Object.entries(DocumentType).find(
                        ([, v]) => v === doc.documentDetails.documentType
                      )?.[0]
                    )}
                  </td>

                  {/* Current Status */}
                  <td>
                    {
                      Object.entries(DocStatus).find(
                        ([, v]) => v === doc.documentDetails.docStatus
                      )?.[0]
                    }
                  </td>

                  {/* Uploaded Date */}
                  <td>
                    {formatDateToDDMMYYYY(doc.documentDetails.uploadedAt)}
                  </td>

                  {/* Document Upload + Existing Link */}
                  <td>
                    {isEditing ? (
                      <>
                        <input
                          type="file"
                          onChange={(e) =>
                            handleFieldChange(
                              doc._id,
                              "newDocument",
                              e.target.files[0]
                            )
                          }
                        />
                        <br />
                        <a
                          href={`${ADMIN_END_POINT}/files/${doc.documentDetails.document.replace(
                            "uploads/document/",
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.viewLink}
                        >
                          View Existing
                        </a>
                      </>
                    ) : (
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
                    )}
                  </td>

                  {/* Comments */}
                  <td>
                    <input
                      type="text"
                      className={styles.docInput}
                      value={editedDocs[doc._id]?.comments || ""}
                      onChange={(e) =>
                        handleFieldChange(doc._id, "comments", e.target.value)
                      }
                      placeholder="Add comment..."
                      disabled={!isEditing}
                    />
                  </td>

                  {/* Change Status */}
                  <td>
                    <select
                      className={styles.docSelect}
                      value={editedDocs[doc._id]?.status || ""}
                      onChange={(e) =>
                        handleFieldChange(doc._id, "status", e.target.value)
                      }
                      disabled={!isEditing}
                    >
                      {Object.keys(DocStatus).map((key) => (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Action */}
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

      {isEditing && (
        <div className={styles.saveBar}>
          <button
            className={styles.saveBtn}
            onClick={handleEdit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}

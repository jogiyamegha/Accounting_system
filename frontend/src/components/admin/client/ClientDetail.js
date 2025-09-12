import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ADMIN_END_POINT,
  DocStatus,
  DocumentType,
} from "../../../utils/constants";
import styles from "../../../styles/clientDetail.module.css";
import loaderStyles from "../../../styles/loader.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faEye,
  faUserCircle,
  faPen,
  faClipboardList,
  faTimes,
  faUserEdit,
  faSave,
  faArrowLeft,
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
  const [newDocs, setNewDocs] = useState([]);

  const [isEditing1, setIsEditing1] = useState(false);
  const [isEditing2, setIsEditing2] = useState(false);
  const [isEditing3, setIsEditing3] = useState(false);
  const [isEditing4, setIsEditing4] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [companyData, setCompanyData] = useState(null);

  const navigate = useNavigate();

  const handleGenerateInvoice = (clientId) => {
    navigate(`/admin/generate-invoice/${clientId}`);
  };

  const fetchClientDetails = async () => {
    try {
      const res = await fetch(`${ADMIN_END_POINT}/client-detail/${clientId}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

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
  useEffect(() => {
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

  if (loading)
    return (
      <div className={loaderStyles.dotLoaderWrapper}>
        <div className={loaderStyles.dotLoader}></div>
      </div>
    );
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
    setCompanyData((prev) => {
      if (field === "licenseIssueDate") {
        const today = new Date().toISOString().split("T")[0];
        if (value > today) {
          toast.error("🚫 License issue date cannot be in the future!");
          return prev;
        }
      }

      return {
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value,
        },
      };
    });
  };

  const handleAddDocument = () => {
    setNewDocs([...newDocs, { documentType: "", file: null }]);
  };

  const handleRemoveDocument = (index) => {
    setNewDocs(newDocs.filter((_, i) => i !== index));
  };

  const handleNewDocChange = (index, field, value) => {
    const updated = [...newDocs];
    updated[index][field] = value;
    setNewDocs(updated);
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

      const formData = new FormData();

      // 🔹 1. Append edited documents
      Object.entries(editedDocs).forEach(([docId, values], index) => {
        if (values.newDocument) {
          formData.append(`editedDocs[${index}][file]`, values.newDocument);
        }
        if (values.documentType) {
          formData.append(
            `editedDocs[${index}][documentType]`,
            values.documentType
          );
        }
        if (values.comments) {
          formData.append(`editedDocs[${index}][comments]`, values.comments);
        }
        if (values.status) {
          formData.append(`editedDocs[${index}][status]`, values.status);
        }
        formData.append(`editedDocs[${index}][docId]`, docId);
      });

      // 🔹 2. Append newly added documents
      newDocs.forEach((doc, index) => {
        if (doc.file) {
          formData.append(`newDocs[${index}][file]`, doc.file);
        }
        if (doc.documentType) {
          formData.append(`newDocs[${index}][documentType]`, doc.documentType);
        }
        if (doc.comments) {
          formData.append(`newDocs[${index}][comments]`, doc.comments);
        }
      });

      const response = await fetch(
        `${ADMIN_END_POINT}/edit-client-document-data/${clientId}`,
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
      setIsEditing4(false);
      fetchClientDetails();
      fetchInvoices();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit1 = async () => {
    try {
      if (!clientId) return;
      setError("");
      setLoading(true);

      const mergeData = { ...clientData };

      const formData = new FormData();
      for (const [key, value] of Object.entries(mergeData)) {
        formData.append(key, value ?? "");
      }

      const response = await fetch(
        `${ADMIN_END_POINT}/edit-client-profile-data/${clientId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mergeData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(errorText || "Failed to update client");
        return;
      }

      toast.success("Personal Information updated successfully!");
      setIsEditing1(false);
      fetchClientDetails();
      fetchInvoices();
      // navigate(0);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit2 = async () => {
    try {
      if (!clientId) return;
      setError("");
      setLoading(true);

      const mergedData = { ...companyData };

      const formData = new FormData();
      for (const [key, value] of Object.entries(mergedData)) {
        formData.append(key, value ?? "");
      }

      const response = await fetch(
        `${ADMIN_END_POINT}/edit-client-company-data/${clientId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mergedData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        toast.error(errorText || "Failed to update company");
        return;
      }

      toast.success("Client's company data updated successfully!");
      setIsEditing2(false);
      setIsEditing3(false);
      // navigate(0);
      fetchClientDetails();
      fetchInvoices();
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
        <h1 className={styles.pageTitle}>
          {" "}
          <FontAwesomeIcon icon={faClipboardList} /> Client Details
        </h1>
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

              <div className={styles.infoRow}>
                <span className={styles.infoValue}>{client.email}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <div className={styles.clientCard}>
        <div className={styles.cardHeader}>
          <h3>Personal Information</h3>
          <div className={styles.btnGrid}>
            <button
              className={styles.editBtn}
              // onClick={() => navigate(`/admin/edit-client/${client._id}`)}
              onClick={() => setIsEditing1((prev) => !prev)}
            >
              <FontAwesomeIcon icon={isEditing1 ? faTimes : faUserEdit} />{" "}
              {isEditing1 ? "Cancel" : "Edit"}
            </button>
            {isEditing1 && (
              // <div className={styles.saveBar}>
              <button
                className={styles.saveBtn}
                onClick={handleEdit1}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faSave} />{" "}
                {loading ? "Saving..." : "Save Changes"}
              </button>
              // </div>
            )}
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Name:</span>
            {isEditing1 ? (
              <input
                value={clientData.name || ""}
                className={styles.textField}
                onChange={(e) => handleClientChange("name", e.target.value)}
              />
            ) : (
              <span className={styles.infoValue}>{client?.name}</span>
            )}
          </div>
          {/* <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Email:</span>
            <span className={styles.infoValue}>{client?.email}</span>
          </div> */}
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Phone:</span>
            {clientData.contact &&
              (isEditing1 ? (
                <div className={styles.infoRow1}>
                  <select
                    name="phoneCountry"
                    className={styles.selectField1}
                    value={clientData.contact?.phoneCountry || ""}
                    onChange={(e) =>
                      handleClientNestedChange(
                        "contact",
                        "phoneCountry",
                        e.target.value
                      )
                    }
                    style={{ width: "80px" }}
                    maxLength={10}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, "");
                      if (e.target.value.length > 10) {
                        e.target.value = e.target.value.slice(0, 10);
                      }
                    }}
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
                    className={styles.textField}
                    value={clientData.contact?.phone || ""}
                    onChange={(e) =>
                      handleClientNestedChange(
                        "contact",
                        "phone",
                        e.target.value
                      )
                    }
                  />
                </div>
              ) : (
                <span className={styles.infoValue}>
                  {client?.contact?.phoneCountry} {client?.contact?.phone}
                </span>
              ))}
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Role:</span>
            {isEditing1 ? (
              <input
                value={clientData.position || ""}
                className={styles.textField}
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
          <div className={styles.btnGrid}>
            <button
              className={styles.editBtn}
              // onClick={() => navigate(`/admin/edit-client/${client._id}`)}
              onClick={() => setIsEditing2((prev) => !prev)}
            >
              <FontAwesomeIcon icon={isEditing2 ? faTimes : faUserEdit} />{" "}
              {isEditing2 ? "Cancel" : "Edit"}
            </button>
            {isEditing2 && (
              // <div className={styles.saveBar}>
              <button
                className={styles.saveBtn}
                onClick={handleEdit2}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faSave} />{" "}
                {loading ? "Saving..." : "Save Changes"}
              </button>
              // </div>
            )}
          </div>
        </div>
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Company Name:</span>
            {isEditing2 ? (
              <input
                className={styles.textField}
                value={companyData.name || ""}
                onChange={(e) => handleCompanyChange("name", e.target.value)}
              />
            ) : (
              <span className={styles.infoValue}>{company.name}</span>
            )}
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Email:</span>
            {isEditing2 ? (
              <input
                className={styles.textField}
                value={companyData.email || ""}
                onChange={(e) => handleCompanyChange("email", e.target.value)}
              />
            ) : (
              <span className={styles.infoValue}>{company.email}</span>
            )}
          </div>

          {/* {companyData.contactPerson && (
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Contact Person:</span>
                            <span className={styles.infoValue}>
                                {isEditing2 ? (
                                    <>
                                        <p>
                                            <strong>Name:</strong>{" "}
                                            <input
                                                value={companyData.contactPerson?.name || ""}
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
                                {isEditing2 ? (
                                    <>
                                        <p>
                                            <strong>Phone Country:</strong>{" "}
                                            <select
                                                style={{ width: "70px" }}
                                                value={
                                                    companyData.contactPerson?.contact?.phoneCountry || ""
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
                                {isEditing2 ? (
                                    <>
                                        <p>
                                            <strong>Phone:</strong>{" "}
                                            <input
                                                value={companyData.contactPerson?.contact?.phone || ""}
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
                    )} */}

          {companyData.address && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Address:</span>
              <span className={styles.infoValue}>
                <span>
                  {isEditing2 ? (
                    <>
                      <strong>Address Line 1:</strong>{" "}
                      <input
                        className={styles.textField}
                        value={companyData.address?.addressLine1 || ""}
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
                  {isEditing2 ? (
                    <>
                      <strong>Address Line 2:</strong>{" "}
                      <input
                        className={styles.textField}
                        value={companyData.address?.addressLine2 || ""}
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
                  {isEditing2 ? (
                    <>
                      <strong>Street:</strong>{" "}
                      <input
                        className={styles.textField}
                        value={companyData.address?.street || ""}
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
                  {isEditing2 ? (
                    <>
                      <strong>Landmark:</strong>{" "}
                      <input
                        className={styles.textField}
                        value={companyData.address?.landmark || ""}
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
                  {isEditing2 ? (
                    <>
                      <strong>City:</strong>{" "}
                      <input
                        className={styles.textField}
                        value={companyData.address?.city || ""}
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
                  {isEditing2 ? (
                    <>
                      <strong>State:</strong>{" "}
                      <input
                        className={styles.textField}
                        value={companyData.address?.state || ""}
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
                  {isEditing2 ? (
                    <>
                      <strong>Country:</strong>{" "}
                      <select
                        className={styles.selectField}
                        name="country"
                        value={companyData.country}
                        onChange={(e) =>
                          handleCompanyChange("country", e.target.value)
                        }
                        required
                      >
                        <option value="">{companyData.address?.country}</option>
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
                  {isEditing2 ? (
                    <>
                      <strong>Zipcode:</strong>{" "}
                      <input
                        className={styles.textField}
                        type="number"
                        maxLength={6}
                        pattern="\d{6}"
                        value={companyData.address?.zipcode || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d{0,6}$/.test(value)) {
                            handleCompanyNestedChange(
                              "address",
                              "zipcode",
                              value
                            );
                          }
                        }}
                      />
                    </>
                  ) : (
                    company.address?.zipcode
                  )}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Credentials */}

      <div className={styles.clientCard}>
        <div className={styles.cardHeader}>
          <h3>Credentials</h3>
          <div className={styles.btnGrid}>
            <button
              className={styles.editBtn}
              // onClick={() => navigate(`/admin/edit-client/${client._id}`)}
              onClick={() => setIsEditing3((prev) => !prev)}
            >
              <FontAwesomeIcon icon={isEditing3 ? faTimes : faUserEdit} />{" "}
              {isEditing3 ? "Cancel" : "Edit"}
            </button>
            {isEditing3 && (
              // <div className={styles.saveBar}>
              <button
                className={styles.saveBtn}
                onClick={handleEdit2}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faSave} />{" "}
                {loading ? "Saving..." : "Save Changes"}
              </button>
              // </div>
            )}
          </div>
        </div>
        <div className={styles.infoGrid}>
          {companyData.licenseDetails && (
            <>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>License Type:</span>
                {isEditing3 ? (
                  <select
                    className={styles.selectField}
                    value={companyData.licenseDetails?.licenseType || ""}
                    onChange={(e) =>
                      handleCompanyNestedChange(
                        "licenseDetails",
                        "licenseType",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      {/* {companyData.licenseDetails?.licenseType} */}
                      --Select License Type --
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
                  <span className={styles.infoValue}>
                    {company.licenseDetails?.licenseType}
                  </span>
                )}
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>License Number:</span>
                {isEditing3 ? (
                  <input
                    className={styles.textField}
                    value={companyData.licenseDetails?.licenseNumber || ""}
                    onChange={(e) =>
                      handleCompanyNestedChange(
                        "licenseDetails",
                        "licenseNumber",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <span className={styles.infoValue}>
                    {company.licenseDetails?.licenseNumber}
                  </span>
                )}
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>License Issue Date:</span>
                {isEditing3 ? (
                  <input
                    type="date"
                    className={styles.dateField}
                    value={
                      companyData.licenseDetails?.licenseIssueDate
                        ? new Date(companyData.licenseDetails.licenseIssueDate)
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
                  <span className={styles.infoValue}>
                    {formatDateToDDMMYYYY(
                      company.licenseDetails?.licenseIssueDate
                    )}
                  </span>
                )}
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>License Expiry Date:</span>
                {isEditing3 ? (
                  <input
                    type="date"
                    className={styles.dateField}
                    min={
                      companyData.licenseDetails?.licenseIssueDate
                        ? new Date(companyData.licenseDetails.licenseIssueDate)
                            .toISOString()
                            .split("T")[0]
                        : new Date().toISOString().split("T")[0]
                    }
                    value={
                      companyData.licenseDetails?.licenseExpiry
                        ? new Date(companyData.licenseDetails.licenseExpiry)
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
                  <span className={styles.infoValue}>
                    {formatDateToDDMMYYYY(
                      company.licenseDetails?.licenseExpiry
                    )}
                  </span>
                )}
              </div>
            </>
          )}

          {companyData.financialYear && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Financial Year:</span>
              {isEditing3 ? (
                <>
                  <input
                    className={styles.dateField}
                    type="date"
                    value={
                      companyData.financialYear?.startDate
                        ? new Date(companyData.financialYear.startDate)
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
                    className={styles.dateField}
                    min={
                      companyData.financialYear?.startDate
                        ? new Date(companyData.financialYear.startDate)
                            .toISOString()
                            .split("T")[0]
                        : new Date().toISOString().split("T")[0]
                    }
                    value={
                      companyData.financialYear?.endDate
                        ? new Date(companyData.financialYear.endDate)
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
                <span className={styles.infoValue}>
                  {formatDateToDDMMYYYY(company.financialYear?.startDate)} -{" "}
                  {formatDateToDDMMYYYY(company.financialYear?.endDate)}
                </span>
              )}
            </div>
          )}

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Tax Registration Number:</span>
            <span className={styles.infoValue}>
              {isEditing3 ? (
                <input
                  type="text"
                  className={styles.textField}
                  value={companyData.taxRegistrationNumber || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,15}$/.test(value)) {
                      handleCompanyChange("taxRegistrationNumber", value);
                    }
                  }}
                />
              ) : (
                company.taxRegistrationNumber
              )}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Business Type:</span>
            <span className={styles.infoValue}>
              {isEditing3 ? (
                <select
                  name="businessType"
                  className={styles.selectField}
                  value={companyData.businessType}
                  onChange={(e) =>
                    handleCompanyChange("businessType", e.target.value)
                  }
                  required
                >
                  <option value="">
                    {/* {companyData.businessType} */}
                    --Select Business Type --
                  </option>
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
          <div className={styles.btnGrid}>
            <button
              className={styles.editBtn}
              onClick={() => setIsEditing4((prev) => !prev)}
            >
              <FontAwesomeIcon icon={isEditing4 ? faTimes : faUserEdit} />{" "}
              {isEditing4 ? "Cancel" : "Edit"}
            </button>
            {isEditing4 && (
              <button
                className={styles.saveBtn}
                onClick={handleEdit}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faSave} />{" "}
                {loading ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
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

        {/* Existing Documents */}
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
                    {isEditing4 ? (
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
                    {isEditing4 ? (
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
                      // disabled={!isEditing4}
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
                      // disabled={!isEditing4}
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

        {/* ➕ New Document Upload Section (only visible in edit mode) */}
        {isEditing4 && (
          <div className={styles.newDocsSection}>
            <h4>Upload New Documents</h4>
            <button
              type="button"
              className={styles.btnAddDocument}
              onClick={handleAddDocument}
            >
              + Add Document
            </button>

            {newDocs.map((doc, index) => (
              <div key={index} className={styles.documentBlock}>
                <select
                  value={doc.documentType}
                  onChange={(e) =>
                    handleNewDocChange(index, "documentType", e.target.value)
                  }
                  required
                >
                  <option value="">--Select Document Type--</option>
                  {Object.entries(DocumentType).map(([key, val]) => (
                    <option key={val} value={val}>
                      {key}
                    </option>
                  ))}
                </select>

                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) =>
                    handleNewDocChange(index, "file", e.target.files[0])
                  }
                />

                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={() => handleRemoveDocument(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
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

      {/* {isEditing && (
        <div className={styles.saveBar}>
          <button
            className={styles.saveBtn}
            onClick={handleEdit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )} */}
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
  );
}

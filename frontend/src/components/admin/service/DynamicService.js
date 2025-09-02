// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { ADMIN_END_POINT } from "../../../utils/constants";
// import classes from "../../../styles/dynamicService.module.css";

// export default function DynamicService() {
//     const { serviceType } = useParams();
//     const [clients, setClients] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchClients = async () => {
//         try {
//             const res = await fetch(
//             `${ADMIN_END_POINT}/service/${serviceType}`,
//             {
//                 method: "GET",
//                 credentials: "include",
//                 headers: { "Content-Type": "application/json" },
//             }
//             );
//             if (!res.ok) {
//             throw new Error("Failed to fetch clients");
//             }
//             const data = await res.json();
//             setClients(data);
//         } catch (err) {
//             console.error("Error fetching clients:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     fetchClients();
//   }, [serviceType]);

//   if (loading) return <p>Loading...</p>;
//   if (clients.length === 0) return <p>No clients have applied for this service.</p>;

//   return (
//     <div className={classes.pageWrapper}>
//       <div className={classes.mainContent}>
//         <h1 className={classes.pageTitle}>
//           {`Service Management - Type ${serviceType}`}
//         </h1>

//         <div className={classes.card}>
//           <h2 className={classes.cardTitle}>Clients Applied</h2>
//           <ul className={classes.clientList}>
//             {clients.map((client) =>
//               client.services
//                 .filter((s) => s.serviceType === Number(serviceType))
//                 .map((service, idx) => (
//                   <li key={`${client._id}-${idx}`} className={classes.clientItem}>
//                     <div>
//                       <p className={classes.clientName}>
//                         {client.clientDetail.clientName}
//                       </p>
//                       <p className={classes.clientEmail}>
//                         {client.clientDetail.clientEmail}
//                       </p>
//                       <small className={classes.clientMeta}>
//                         Start:{" "}
//                         {service.serviceStartDate
//                           ? new Date(service.serviceStartDate).toLocaleDateString()
//                           : "-"}
//                         {" | "}
//                         End:{" "}
//                         {service.serviceEndDate
//                           ? new Date(service.serviceEndDate).toLocaleDateString()
//                           : "-"}
//                       </small>
//                     </div>
//                   </li>
//                 ))
//             )}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );

// }

// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { ADMIN_END_POINT, docTypeMap, serviceTypeMap } from "../../../utils/constants";
// import classes from "../../../styles/dynamicService.module.css";
// import Sidebar from "../../Sidebar";

// export default function DynamicService() {
//   const { serviceType } = useParams();
//   const navigate = useNavigate();
//   const [clients, setClients] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // modal states
//   const [showModal, setShowModal] = useState(false);
//   const [selectedClient, setSelectedClient] = useState(null);
//   const [documents, setDocuments] = useState([]);
//   const [requiredDocs, setRequiredDocs] = useState([]);
//   const [file, setFile] = useState({ type: "", file: null, comments: "" });

//   useEffect(() => {
//     const fetchClients = async () => {
//       try {
//         const res = await fetch(`${ADMIN_END_POINT}/service/${serviceType}`, {
//           method: "GET",
//           credentials: "include",
//           headers: { "Content-Type": "application/json" },
//         });
//         if (!res.ok) throw new Error("Failed to fetch clients");
//         const data = await res.json();
//         console.log("data",data)
//         setClients(data);
//       } catch (err) {
//         console.error("Error fetching clients:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchClients();
//   }, [serviceType]);

//   const openModal = async (clientId) => {
//     setSelectedClient(clientId);
//     setShowModal(true);

//     try {
//       const res = await fetch(
//         `${ADMIN_END_POINT}/documents/${clientId}/${serviceType}`,
//         { credentials: "include" }
//       );
//       if (!res.ok) throw new Error("Failed to fetch documents");
//       const data = await res.json();

//       setDocuments(data.uploadedDocs || []);
//       console.log(data.uploadedDocs)
//       setRequiredDocs(data.remainingDocs || []);
//     } catch (err) {
//       console.error("Error fetching documents:", err);
//     }
//   };

//   const handleFileUpload = async (e) => {
//     e.preventDefault();
//     if (!file.type || !file.file) {
//       alert("Please select a document type and file");
//       return;
//     }

//     console.log("first", file.file);

//     const formData = new FormData();
//     formData.append("documentType", file.type);
//     formData.append("file", file.file);
//     if (file.comments) formData.append("comments", file.comments);

//     // console.log("kjdk", formData.entries())

//     console.log(selectedClient)
//     try {
//       const res = await fetch(
//         `${ADMIN_END_POINT}/documents/upload/${selectedClient}/${serviceType}`,
//         {
//           method: "POST",
//           body: formData,
//           credentials: "include",
//         }
//       );

//       if (!res.ok) throw new Error("Upload failed");
//       const data = await res.json();

//       console.log("jycfj", data)

//       // refresh documents after upload
//       setDocuments((prev) => [...prev, data.documents]);
//       setRequiredDocs((prev) =>
//         prev.filter((req) => req.type !== Number(file.type))
//       );
//       // setFile({ type: "", file: null, comments: "" }); // reset form
//       navigate(0);

//     } catch (err) {
//       console.error("Upload error:", err);
//     }
//   };

//   if (loading) return <p>Loading...</p>;
//   if (clients.length === 0)
//     return <p>No clients have applied for this service.</p>;

//   return (
//     <div className={classes.pageWrapper}>
//       <Sidebar />
//       <div className={classes.mainContent}>
//         <h1 className={classes.pageTitle}>
//           {`Service Management   ${serviceTypeMap[serviceType]}`}
//         </h1>

//         <div className={classes.card}>
//           <h2 className={classes.cardTitle}>Clients Applied</h2>
//           <ul className={classes.clientList}>
//             {clients.map((client) =>
//               client.services
//                 .filter((s) => s.serviceType === Number(serviceType))
//                 .map((service, idx) => (
//                   <li
//                     key={`${client._id}-${idx}`}
//                     className={classes.clientItem}
//                   >
//                     <div>
//                       <p className={classes.clientName}>
//                         {client.clientDetail.clientName}
//                       </p>
//                       <p className={classes.clientEmail}>
//                         {client.clientDetail.clientEmail}
//                       </p>
//                       <small className={classes.clientMeta}>
//                         Start:{" "}
//                         {service.serviceStartDate
//                           ? new Date(
//                               service.serviceStartDate
//                             ).toLocaleDateString()
//                           : "-"}
//                         {" | "}End:{" "}
//                         {service.serviceEndDate
//                           ? new Date(
//                               service.serviceEndDate
//                             ).toLocaleDateString()
//                           : "-"}
//                       </small>
//                     </div>
//                     <button
//                       className={classes.uploadBtn}
//                       onClick={() => openModal(client.clientDetail.clientId)}
//                     >
//                       Manage Documents
//                     </button>
//                   </li>
//                 ))
//             )}
//           </ul>
//         </div>
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className={classes.modalOverlay}>
//           <div className={classes.modalContent}>
//             <h2>Manage Documents</h2>

//             {/* Already Uploaded */}
//             <h3>Already Uploaded</h3>
//             <ul>
//               {documents.length > 0 ? (
//                 documents.map((doc, i) => (
//                   <li key={i}>
//                     <strong>
//                       {docTypeMap[doc.type] || `Unknown (${doc.type})`}
//                     </strong>{" "}
//                     {/* –{" "}
//                     <a
//                       href={`${ADMIN_END_POINT}/uploads/${doc.file}`}
//                       target="_blank"
//                       rel="noreferrer"
//                     >
//                       {doc.file}
//                     </a>{" "} */}
//                     {/* | Status: {doc.status}{" "}
//                     {doc.uploadedAt &&
//                       `| ${new Date(doc.uploadedAt).toLocaleDateString()}`} */}
//                   </li>
//                 ))
//               ) : (
//                 <li>No documents uploaded yet.</li>
//               )}
//             </ul>

//             {/* Required Documents */}
//             <h3>Required Documents</h3>
//             <ul>
//               {requiredDocs.length > 0 ? (
//                 requiredDocs.map((req, i) => {
//                   const isUploaded = documents.some(
//                     (d) => d.type === req.type
//                   );
//                   return (
//                     <li key={i}>
//                       {docTypeMap[req.type] || `Unknown (${req.type})`}{" "}
//                       {isUploaded ? "✅ (uploaded)" : "(Remaining)"}
//                     </li>
//                   );
//                 })
//               ) : (
//                 <li>All documents uploaded 🎉</li>
//               )}
//             </ul>

//             {/* Upload Form */}
//             <form onSubmit={handleFileUpload}>
//               <label>Select Document Type:</label>
//               <select
//                 value={file.type}
//                 onChange={(e) =>
//                   setFile((prev) => ({ ...prev, type: e.target.value }))
//                 }
//                 required
//               >
//                 <option value="">-- Choose Type --</option>
//                 {requiredDocs.map((req) => (
//                   <option key={req.type} value={req.type}>
//                     {docTypeMap[req.type] || `Unknown (${req.type})`}
//                   </option>
//                 ))}
//               </select>

//               <input
//                 type="file"
//                 accept="application/pdf,.pdf"
//                 required
//                 onChange={(e) =>
//                   setFile((prev) => ({ ...prev, file: e.target.files[0] }))
//                 }
//               />

//               <input
//                 type="text"
//                 placeholder="Comments (optional)"
//                 value={file.comments}
//                 onChange={(e) =>
//                   setFile((prev) => ({ ...prev, comments: e.target.value }))
//                 }
//               />

//               <button type="submit">Upload</button>
//             </form>

//             <button onClick={() => setShowModal(false)}>Close</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ADMIN_END_POINT,
  docTypeMap,
  formatDateToDDMMYYYY,
  serviceStatusMap,
  serviceTypeMap,
} from "../../../utils/constants";
import classes from "../../../styles/dynamicService.module.css";
import Sidebar from "../../Sidebar";
import { toast } from "react-toastify";


export default function DynamicService() {
  const { serviceType } = useParams();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [requiredDocs, setRequiredDocs] = useState([]);
  const [file, setFile] = useState({ type: "", file: null, comments: "" });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch(`${ADMIN_END_POINT}/service/${serviceType}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch clients");
        }

        const data = await res.json();

        // console.log("data", data);
        setClients(data);
      } catch (err) {
        console.error("Error fetching clients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [serviceType]);

  const deAssignService = async (serviceId, clientId) => {
    try {
      if (!serviceId) return console.error("Service ID not found!");

      const res = await fetch(
        `${ADMIN_END_POINT}/de-assign-service/${serviceId}/${clientId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to de-assign service");
      }

      // const result = await res.json();

      setClients((prev) =>
        prev.map((client) =>
          client._id === clientId
            ? {
                ...client,
                services: client.services.filter((s) => s._id !== serviceId),
              }
            : client
        )
      );
      navigate(0);
    } catch (err) {
      console.error("Error de-assigning service:", err);
    }
  };

  const renewService = async (serviceId, clientId, serviceType) => {
    console.log(serviceType);
    try {
      if (!serviceId) return console.error("Service ID not found!");
      
      const res = await fetch(
        `${ADMIN_END_POINT}/renew-service/${serviceId}/${clientId}/${serviceType}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to de-assign service");
      }

      setClients((prev) =>
        prev.map((client) =>
          client._id === clientId
            ? {
                ...client,
                services: client.services.filter((s) => s._id !== serviceId),
              }
            : client
        )
      );
      navigate(0);
    } catch (error) {
      console.error("Error renew service:", error);
    }
  }

  const openModal = async (clientId) => {
    setSelectedClient(clientId);
    setShowModal(true);

    try {
      const res = await fetch(
        `${ADMIN_END_POINT}/documents/${clientId}/${serviceType}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      

      setDocuments(data.uploadedDocs || []);
      console.log(data.uploadedDocs);
      setRequiredDocs(data.remainingDocs || []);
      console.log(data.remainingDocs);

    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file.type || !file.file) {
      alert("Please select a document type and file");
      return;
    }

    // console.log("first", file.file);

    const formData = new FormData();
    formData.append("documentType", file.type);
    formData.append("file", file.file);
    if (file.comments) formData.append("comments", file.comments);

    try {
      const res = await fetch(
        `${ADMIN_END_POINT}/documents/upload/${selectedClient}/${serviceType}`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      // refresh documents after upload
      setDocuments((prev) => [...prev, data.documents]);
      setRequiredDocs((prev) =>
        prev.filter((req) => req.type !== Number(file.type))
      );
      // setFile({ type: "", file: null, comments: "" }); // reset form
      navigate(0);
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleDetails = async (clientId) => {
    navigate(`/admin/service-details/${clientId}`);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (clients.length === 0) {
    toast.info("No clients have applied for this service.")
    navigate('/admin/service-management')
  }

  return (
    <div className={classes.pageWrapper}>
      <Sidebar />
      <div className={classes.mainContent}>
        <h1 className={classes.pageTitle}>
          {`Service Management - Type ${serviceTypeMap[serviceType]}`}
        </h1>

        <div className={classes.card}>
          <h2 className={classes.cardTitle}>Clients Applied</h2>
          <ul className={classes.clientList}>
            {clients.map((client) =>
              client.services
                .filter((s) => s.serviceType === Number(serviceType))
                .map((service, idx) => (
                  <li
                    key={`${client._id}-${idx}`}
                    className={classes.clientItem}
                  >
                    <div>
                      <p className={classes.clientName}>
                        {client.clientDetail.clientName}
                      </p>
                      <p className={classes.clientEmail}>
                        {client.clientDetail.clientEmail}
                      </p>
                      <small className={classes.clientMeta}>
                        Start:{" "}
                        {service.serviceStartDate
                          ? formatDateToDDMMYYYY(
                              service.serviceStartDate
                            )
                          : "-"}
                        {" | "}End:{" "}
                        {service.serviceEndDate
                          ? formatDateToDDMMYYYY(
                              service.serviceEndDate
                            )
                          : "-"}
                      </small>
                      <br></br>
                      <small className={classes.clientMeta}>
                        Status: {serviceStatusMap[service.serviceStatus]}
                      </small>
                    </div>
                    <button
                      className={classes.uploadBtn}
                      onClick={() =>
                        handleDetails(client.clientDetail.clientId)
                      }
                    >
                      View Details
                    </button>

                    <button
                      className={classes.uploadBtn}
                      onClick={() => openModal(client.clientDetail.clientId)}
                    >
                      Manage Documents
                    </button>

                    <button
                      className={classes.uploadBtn}
                      onClick={() =>
                        deAssignService(
                          service._id,
                          client.clientDetail.clientId
                        )
                      }
                    >
                      De-Assign
                    </button>

                    <button
                     className={classes.uploadBtn}
                      onClick={() =>
                        renewService(
                          service._id,
                          client.clientDetail.clientId,
                          serviceType
                        )
                      }
                    >
                      Renew Service
                    </button>
                  </li>
                ))
            )}
          </ul>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className={classes.modalOverlay}>
          <div className={classes.modalContent}>
            <h2>Manage Documents</h2>

            {/* Already Uploaded */}
            <h3>Already Uploaded</h3>
            <ul>
              {documents.length > 0 ? (
                documents.map((doc, i) => (
                  <li key={i}>
                    <strong>
                      {docTypeMap[doc.type] || `Unknown (${doc.type})`}
                    </strong>{" "}
                    {/* –{" "}
                        <a
                        href={`${ADMIN_END_POINT}/uploads/${doc.file}`}
                        target="_blank"
                        rel="noreferrer"
                        >
                        {doc.file}
                        </a>{" "} */}
                    {/* | Status: {doc.status}{" "}
                        {doc.uploadedAt &&
                        `| ${new Date(doc.uploadedAt).toLocaleDateString()}`} */}
                  </li>
                ))
              ) : (
                <li>No documents uploaded yet.</li>
              )}
            </ul>

            {/* Required Documents */}
            <h3>Required Documents</h3>
            <ul>
              {requiredDocs.length > 0 ? (
                requiredDocs.map((req, i) => {
                  const isUploaded = documents.some((d) => d.type === req.type);
                  return (
                    <li key={i}>
                      {docTypeMap[req.type] || `Unknown (${req.type})`}{" "}
                      {isUploaded ? "✅ (uploaded)" : "(Remaining)"}
                    </li>
                  );
                })
              ) : (
                <li>All documents uploaded 🎉</li>
              )}
            </ul>

            {/* Upload Form */}
            {requiredDocs.length > 0 && (
            <form onSubmit={handleFileUpload}>
              <label>Select Document Type:</label>
              <select
                value={file.type}
                onChange={(e) =>
                  setFile((prev) => ({ ...prev, type: e.target.value }))
                }
                required
              >
                <option value="">-- Choose Type --</option>
                {requiredDocs.map((req) => (
                  <option key={req.type} value={req.type}>
                    {docTypeMap[req.type] || `Unknown (${req.type})`}
                  </option>
                ))}
              </select>

              <input
                type="file"
                accept="application/pdf,.pdf"
                required
                onChange={(e) =>
                  setFile((prev) => ({ ...prev, file: e.target.files[0] }))
                }
              />

              <input
                type="text"
                placeholder="Comments (optional)"
                value={file.comments}
                onChange={(e) =>
                  setFile((prev) => ({ ...prev, comments: e.target.value }))
                }
              />

              <button type="submit">Upload</button>
            </form>
            )}
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

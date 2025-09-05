// // import { useState } from "react";
// // import {
// //   DocumentType,
// //   DocStatus,
// //   ADMIN_END_POINT,
// // } from "../../../utils/constants";
// // import { toast } from "react-toastify";
// // import "../../../styles/docList.css";

// // export default function DocStatusChange() {
// //   const [error, setError] = useState("");
// //   const [email, setEmail] = useState("");
// //   const [documents, setDocuments] = useState([]);
// //   const [clientId, setClientId] = useState(null);

// //   // local state to hold editable values for each doc
// //   const [editedDocs, setEditedDocs] = useState({});

// //   const notifySuccess = () => {
// //     toast.success("Operation successful!");
// //   };

// //   const handleSearch = async () => {
// //     try {
// //       setError("");
// //       setDocuments([]);
// //       if (!email) {
// //         setError("Please enter client email");
// //         return;
// //       }

// //       const response = await fetch(`${ADMIN_END_POINT}/documents/`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ email }),
// //         credentials: "include",
// //       });

// //       if (!response.ok) {
// //         const errData = await response.json();
// //         throw new Error(errData.message || "Failed to fetch documents");
// //       }

// //       const data = await response.json();
// //       setDocuments(data.documents || []);
// //       setClientId(data.clientId);

// //       // prepare editable state
// //       const initialEdited = {};
// //       (data.documents || []).forEach((doc) => {
// //         const currentStatusKey = Object.keys(DocStatus).find(
// //           (key) => DocStatus[key] === doc.documentDetails.docStatus
// //         );
// //         initialEdited[doc._id] = {
// //           comments: doc.documentDetails.comments || "",
// //           status: currentStatusKey,
// //         };
// //       });
// //       setEditedDocs(initialEdited);
// //     } catch (err) {
// //       console.error(err);
// //       setError(err.message);
// //     }
// //   };

// //   const handleFieldChange = (docId, field, value) => {
// //     setEditedDocs((prev) => ({
// //       ...prev,
// //       [docId]: {
// //         ...prev[docId],
// //         [field]: value,
// //       },
// //     }));
// //   };

// //   const handleUpdate = async (docId) => {
// //     try {
// //       if (!clientId) return;
// //       setError("");

// //       const { status, comments } = editedDocs[docId];

// //       const response = await fetch(
// //         `${ADMIN_END_POINT}/update-doc-status/${clientId}/${docId}`,
// //         {
// //           method: "PATCH",
// //           headers: { "Content-Type": "application/json" },
// //           body: JSON.stringify({ status, comments }),
// //           credentials: "include",
// //         }
// //       );

// //       if (!response.ok) {
// //         const errData = await response.json();
// //         throw new Error(errData.message || "Failed to update document status");
// //       }

// //       setDocuments((prevDocs) =>
// //         prevDocs.map((doc) =>
// //           doc._id === docId
// //             ? {
// //                 ...doc,
// //                 documentDetails: {
// //                   ...doc.documentDetails,
// //                   docStatus: DocStatus[status.toLowerCase()],
// //                   comments: comments,
// //                 },
// //               }
// //             : doc
// //         )
// //       );
// //       {notifySuccess}
// //       alert('Status Submitted & client is notified. ')
// //     } catch (err) {
// //       console.error(err);
// //       setError(err.message);
// //     }
// //   };

// //   return (
// //     <div className="form-container">
// //       <h2 className="form-title">Admin: Client Document Status</h2>

// //       {error && <p className="error-message">{error}</p>}

// //       {/* Search by email */}
// //       <div className="form-group1">
// //         <input
// //           type="email"
// //           placeholder="Enter client email"
// //           className="form-input"
// //           value={email}
// //           onChange={(e) => setEmail(e.target.value)}
// //         />
// //         <button className="btn btn-primary" onClick={handleSearch}>
// //           Search
// //         </button>
// //       </div>

// //       {/* Documents list */}
// //       {documents.length === 0 && clientId && (
// //         <p>No documents found for this client.</p>
// //       )}

// //       {documents.map((doc) => {
// //         return (
// //           <div key={doc._id} className="document-card">
// //             <div className="form-group">
// //               <label>Type:</label>
// //               <p>
// //                 {Object.keys(DocumentType).find(
// //                   (key) =>
// //                     DocumentType[key] === doc.documentDetails.documentType
// //                 )}
// //               </p>
// //             </div>

// //             <div className="form-group">
// //               <label>File:</label>
// //               <a
// //                 href={doc.documentDetails.document}
// //                 target="_blank"
// //                 rel="noreferrer"
// //               >
// //                 View
// //               </a>
// //             </div>

// //             <div className="form-group">
// //               <label>Comments:</label>
// //               <input
// //                 type="text"
// //                 className="form-input"
// //                 value={editedDocs[doc._id]?.comments || ""}
// //                 onChange={(e) =>
// //                   handleFieldChange(doc._id, "comments", e.target.value)
// //                 }
// //                 placeholder="Add comment..."
// //               />
// //             </div>

// //             <div className="form-group">
// //               <label>Status:</label>
// //               <select
// //                 className="form-select"
// //                 value={editedDocs[doc._id]?.status || ""}
// //                 onChange={(e) =>
// //                   handleFieldChange(doc._id, "status", e.target.value)
// //                 }
// //               >
// //                 {Object.keys(DocStatus).map((key) => (
// //                   <option key={key} value={key}>
// //                     {key}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>

// //             {/* Update button */}
// //             <div className="form-group">
// //               <button
// //                 className="btn btn-success"
// //                 onClick={() => handleUpdate(doc._id)}
// //               >
// //                 Update
// //               </button>
// //             </div>
// //           </div>
// //         );
// //       })}
// //     </div>
// //   );
// // }

// import { useState } from "react";
// import {
//   DocumentType,
//   DocStatus,
//   ADMIN_END_POINT,
// } from "../../../utils/constants";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css"; // make sure styles are imported once
// import "../../../styles/docList.css";

// export default function DocStatusChange() {
//   const [error, setError] = useState("");
//   const [email, setEmail] = useState("");
//   const [documents, setDocuments] = useState([]);
//   const [clientId, setClientId] = useState(null);

//   // local state to hold editable values for each doc
//   const [editedDocs, setEditedDocs] = useState({});

//   const notifySuccess = (msg = "Operation successful!") => {
//     console.log("notification avi?");
//     toast.success(msg, { position: "top-right", autoClose: 3000 });
//   };

//   const handleSearch = async () => {
//     try {
//       setError("");
//       setDocuments([]);
//       if (!email) {
//         setError("Please enter client email");
//         return;
//       }

//       const response = await fetch(`${ADMIN_END_POINT}/documents/`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//         credentials: "include",
//       });

//       if (!response.ok) {
//         const errData = await response.json();
//         throw new Error(errData.message || "Failed to fetch documents");
//       }

//       const data = await response.json();
//       setDocuments(data.documents || []);
//       setClientId(data.clientId);

//       // prepare editable state
//       const initialEdited = {};
//       (data.documents || []).forEach((doc) => {
//         const currentStatusKey = Object.keys(DocStatus).find(
//           (key) => DocStatus[key] === doc.documentDetails.docStatus
//         );
//         initialEdited[doc._id] = {
//           comments: doc.documentDetails.comments || "",
//           status: currentStatusKey,
//         };
//       });
//       setEditedDocs(initialEdited);
//     } catch (err) {
//       console.error(err);
//       setError(err.message);
//     }
//   };

//   const handleFieldChange = (docId, field, value) => {
//     setEditedDocs((prev) => ({
//       ...prev,
//       [docId]: {
//         ...prev[docId],
//         [field]: value,
//       },
//     }));
//   };

//   const handleUpdate = async (docId) => {
//     try {
//       if (!clientId) return;
//       setError("");

//       const { status, comments } = editedDocs[docId];

//       const response = await fetch(
//         `${ADMIN_END_POINT}/update-doc-status/${clientId}/${docId}`,
//         {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ status, comments }),
//           credentials: "include",
//         }
//       );

//       if (!response.ok) {
//         const errData = await response.json();
//         throw new Error(errData.message || "Failed to update document status");
//       }

//       setDocuments((prevDocs) =>
//         prevDocs.map((doc) =>
//           doc._id === docId
//             ? {
//                 ...doc,
//                 documentDetails: {
//                   ...doc.documentDetails,
//                   docStatus: DocStatus[status.toLowerCase()],
//                   comments: comments,
//                 },
//               }
//             : doc
//         )
//       );

//       notifySuccess("Status updated & client notified!");
//     } catch (err) {
//       console.error(err);
//       setError(err.message);
//       toast.error(err.message || "Something went wrong", {
//         position: "top-right",
//         autoClose: 3000,
//       });
//     }
//   };

//   return (
//     <div className="form-container">
//       <h2 className="form-title">Admin: Client Document Status</h2>

//       {error && <p className="error-message">{error}</p>}

//       {/* Search by email */}
//       <div className="form-group1">
//         <input
//           type="email"
//           placeholder="Enter client email"
//           className="form-input"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <button className="btn btn-primary" onClick={handleSearch}>
//           Search
//         </button>
//       </div>

//       {/* Documents list */}
//       {documents.length === 0 && clientId && (
//         <p>No documents found for this client.</p>
//       )}

//       {documents.map((doc) => {
//         return (
//           <div key={doc._id} className="document-card">
//             <div className="form-group">
//               <label>Type:</label>
//               <p>
//                 {Object.keys(DocumentType).find(
//                   (key) =>
//                     DocumentType[key] === doc.documentDetails.documentType
//                 )}
//               </p>
//             </div>

//             <div className="form-group">
//               <label>File:</label>
//               <a
//                 href={doc.documentDetails.document}
//                 target="_blank"
//                 rel="noreferrer"
//               >
//                 View
//               </a>
//             </div>

//             <div className="form-group">
//               <label>Comments:</label>
//               <input
//                 type="text"
//                 className="form-input"
//                 value={editedDocs[doc._id]?.comments || ""}
//                 onChange={(e) =>
//                   handleFieldChange(doc._id, "comments", e.target.value)
//                 }
//                 placeholder="Add comment..."
//               />
//             </div>

//             <div className="form-group">
//               <label>Status:</label>
//               <select
//                 className="form-select"
//                 value={editedDocs[doc._id]?.status || ""}
//                 onChange={(e) =>
//                   handleFieldChange(doc._id, "status", e.target.value)
//                 }
//               >
//                 {Object.keys(DocStatus).map((key) => (
//                   <option key={key} value={key}>
//                     {key}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Update button */}
//             <div className="form-group">
//               <button
//                 className="btn btn-success"
//                 onClick={() => handleUpdate(doc._id)}
//               >
//                 Update
//               </button>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }


import { useState } from "react";
import {
    DocumentType,
    DocStatus,
    ADMIN_END_POINT,
} from "../../../utils/constants";
import { toast } from "react-toastify";
import Notification from "../../Notification";
import "../../../styles/docList.css";

export default function DocStatusChange() {
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [documents, setDocuments] = useState([]);
    const [clientId, setClientId] = useState(null);
    const [editedDocs, setEditedDocs] = useState({});

    const handleSearch = async () => {
        try {
            setError("");
            setDocuments([]);
            if (!email) {
                setError("Please enter client email");
                toast.warn("⚠️ Please enter client email");
                return;
            }

            const response = await fetch(`${ADMIN_END_POINT}/documents/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
                credentials: "include",
            });

            if (!response.ok) {
                const errData = await response.json();
                toast.error(errData.error || "Failed to fetch documents");
            }

            const data = await response.json();
            setDocuments(data.documents || []);
            setClientId(data.clientId);

            const initialEdited = {};
            (data.documents || []).forEach((doc) => {
                const currentStatusKey = Object.keys(DocStatus).find(
                    (key) => DocStatus[key] === doc.documentDetails.docStatus
                );
                initialEdited[doc._id] = {
                    comments: doc.documentDetails.comments || "",
                    status: currentStatusKey,
                };
            });
            setEditedDocs(initialEdited);

            toast.info("📂 Documents fetched successfully");
        } catch (err) {
            console.error(err);
            setError(err.message);
            toast.error(err.message || "❌ Error fetching documents");
        }
    };

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
                `${ADMIN_END_POINT}/update-doc-status/${clientId}/${docId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status, comments }),
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
                                docStatus: DocStatus[status.toLowerCase()],
                                comments: comments,
                            },
                        }
                        : doc
                )
            );

            toast.success("✅ Status updated & client notified!");
        } catch (err) {
            console.error(err);
            setError(err.message);
            toast.error(err.message || "❌ Failed to update document");
        }
    };

    return (
        <div className="form-container">
            <h2 className="form-title">Admin: Client Document Status</h2>

            {/* {error && <p className="error-message">{error}</p>} */}

            {/* Search by email */}
            <div className="form-group1">
                <input
                    type="email"
                    placeholder="Enter client email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleSearch}>
                    Search
                </button>
            </div>

            {/* Documents list */}
            {documents.length === 0 && clientId && (
                <p>No documents found for this client.</p>
            )}

            {documents.map((doc) => {
                return (
                    <div key={doc._id} className="document-card">
                        <div className="form-group">
                            <label>Type:</label>
                            <p>
                                {Object.keys(DocumentType).find(
                                    (key) =>
                                        DocumentType[key] === doc.documentDetails.documentType
                                )}
                            </p>
                        </div>

                        <div className="form-group">
                            <label>File:</label>
                            <a
                                href={doc.documentDetails.document}
                                target="_blank"
                                rel="noreferrer"
                            >
                                View
                            </a>
                        </div>

                        <div className="form-group">
                            <label>Comments:</label>
                            <input
                                type="text"
                                className="form-input"
                                value={editedDocs[doc._id]?.comments || ""}
                                onChange={(e) =>
                                    handleFieldChange(doc._id, "comments", e.target.value)
                                }
                                placeholder="Add comment..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Status:</label>
                            <select
                                className="form-select"
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

                        {/* Update button */}
                        <div className="form-group">
                            <button
                                className="btn btn-success"
                                onClick={() => handleUpdate(doc._id)}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                );
            })}

        </div>
    );
}

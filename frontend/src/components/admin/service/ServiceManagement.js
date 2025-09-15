// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { ADMIN_END_POINT } from "../../../utils/constants";
// import styles from "../../../styles/serviceManagement.module.css";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faTools, faEdit, faTrash, faPlus, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
// import { toast } from "react-toastify";
// import Sidebar from "../../Sidebar";

// export default function ServiceManagement() {
//     const navigate = useNavigate();
//     const [services, setServices] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [showModal, setShowModal] = useState(false);
//     const [formData, setFormData] = useState({
//         serviceName: "",
//         serviceDuration: "",
//     });

//     const [editId, setEditId] = useState(null); // id of row currently being edited
//     const [editData, setEditData] = useState({ serviceName: "", serviceDuration: "" });

//     useEffect(() => {
//         fetchServices();
//     }, []);

//     const fetchServices = async () => {
//         try {
//             const res = await fetch(`${ADMIN_END_POINT}/service-management`, { credentials: "include" });
//             const data = await res.json();
//             if (!res.ok) throw new Error(data.message || "Failed to fetch services");
//             console.log("data", data);
//             setServices(data);
//         } catch (err) {
//             console.error(err);
//             toast.error("Failed to load services");
//         }
//     };

//     const filteredServices = services.filter((s) =>
//         s.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const handleChange = (e) => {
//         setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const res = await fetch(`${ADMIN_END_POINT}/add-service`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 credentials: "include",
//                 body: JSON.stringify(formData),
//             });

//             const data = await res.json();
//             if (!res.ok) throw new Error(data.message || "Failed to add service");

//             toast.success("Service added successfully!");
//             setShowModal(false);
//             setFormData({ serviceName: "", serviceDuration: "" });
//             fetchServices();
//         } catch (err) {
//             toast.error(err.message);
//         }
//     };

//     // Start editing a row
//     const handleEdit = (service) => {
//         console.log("service", service);
//         setEditId(service._id);
//         console.log("editId", editId);
//         console.log("1",editData);
//         setEditData({ serviceName: service.serviceName, serviceDuration: service.serviceDuration });
//         console.log("2",editData);
//     };

//     // Cancel editing
//     const handleCancelEdit = () => {
//         setEditId(null);
//         setEditData({ serviceName: "", serviceDuration: "" });
//     };

//     // Save updated service
//     const handleSaveEdit = async (id) => {
//         console.log("id, ", id);
//         try {
//             const res = await fetch(`${ADMIN_END_POINT}/edit-service/${id}`, {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 credentials: "include",
//                 body: JSON.stringify(editData),
//             });

//             const data = await res.json();
//             if (!res.ok) throw new Error(data.message || "Failed to update service");

//             toast.success("Service updated successfully!");
//             setEditId(null);
//             fetchServices();
//         } catch (err) {
//             toast.error(err.message);
//         }
//     };

//     const handleDelete = async (id) => {
//         if (!window.confirm("Are you sure you want to delete this service?")) return;
//         try {
//             const res = await fetch(`${ADMIN_END_POINT}/services/${id}`, {
//                 method: "DELETE",
//                 credentials: "include",
//             });
//             const data = await res.json();
//             if (!res.ok) throw new Error(data.message || "Failed to delete service");

//             toast.success("Service deleted successfully!");
//             fetchServices();
//         } catch (err) {
//             toast.error(err.message);
//         }
//     };

//     return (
//         <div className={styles.container}>
//             <Sidebar />
//             <div className={styles.content}>
//                 <h1 className={styles.title}>
//                     <FontAwesomeIcon icon={faTools} /> Service Management
//                 </h1>

//                 {/* Search + Add Button */}
//                 <div className={styles.topBar}>
//                     <input
//                         type="text"
//                         placeholder="Search services..."
//                         className={styles.searchBar}
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                     <button className={styles.addBtn} onClick={() => setShowModal(true)}>
//                         <FontAwesomeIcon icon={faPlus} /> Add Service
//                     </button>
//                 </div>

//                 {/* Table */}
//                 {filteredServices.length > 0 ? (
//                     <table className={styles.serviceTable}>
//                         <thead>
//                             <tr>
//                                 <th>Service Name</th>
//                                 <th>Duration (months)</th>
//                                 <th>Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {filteredServices.map((service) => (
//                                 <tr key={service.id}>
//                                     <td>
//                                         {editId === service.id ? (
//                                             <input
//                                                 type="text"
//                                                 value={editData.serviceName}
//                                                 onChange={(e) =>
//                                                     setEditData((prev) => ({ ...prev, serviceName: e.target.value }))
//                                                 }
//                                             />
//                                         ) : (
//                                             service.serviceName
//                                         )}
//                                     </td>
//                                     <td>
//                                         {editId === service.id ? (
//                                             <input
//                                                 type="number"
//                                                 value={editData.serviceDuration}
//                                                 onChange={(e) =>
//                                                     setEditData((prev) => ({ ...prev, serviceDuration: e.target.value }))
//                                                 }
//                                             />
//                                         ) : (
//                                             service.serviceDuration
//                                         )}
//                                     </td>
//                                     <td className={styles.actions}>
//                                         {editId === service.id ? (
//                                             <>
//                                                 <button
//                                                     className={styles.saveBtn}
//                                                     onClick={() => handleSaveEdit(service.id)}
//                                                 >
//                                                     <FontAwesomeIcon icon={faSave} /> Save
//                                                 </button>
//                                                 <button
//                                                     className={styles.cancelBtn}
//                                                     onClick={handleCancelEdit}
//                                                 >
//                                                     <FontAwesomeIcon icon={faTimes} /> Cancel
//                                                 </button>
//                                             </>
//                                         ) : (
//                                             <>
//                                                 <button
//                                                     className={styles.editBtn}
//                                                     onClick={() => handleEdit(service)}
//                                                 >
//                                                     <FontAwesomeIcon icon={faEdit} />
//                                                 </button>
//                                                 <button
//                                                     className={styles.deleteBtn}
//                                                     onClick={() => handleDelete(service.id)}
//                                                 >
//                                                     <FontAwesomeIcon icon={faTrash} />
//                                                 </button>
//                                             </>
//                                         )}
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 ) : (
//                     <p className={styles.noData}>No services found</p>
//                 )}

//                 {/* Add Service Modal */}
//                 {showModal && (
//                     <div className={styles.modalOverlay}>
//                         <div className={styles.modalContent}>
//                             <h2 className={styles.modalTitle}>Add Service</h2>
//                             <form onSubmit={handleSubmit}>
//                                 <div className={styles.formGroup}>
//                                     <label>Service Name:</label>
//                                     <input
//                                         type="text"
//                                         name="serviceName"
//                                         value={formData.serviceName}
//                                         onChange={handleChange}
//                                         required
//                                     />
//                                 </div>
//                                 <div className={styles.formGroup}>
//                                     <label>Service Duration:</label>
//                                     <input
//                                         type="number"
//                                         name="serviceDuration"
//                                         value={formData.serviceDuration}
//                                         onChange={handleChange}
//                                         placeholder="e.g., 6 months"
//                                         required
//                                     />
//                                 </div>

//                                 <div className={styles.modalButtons}>
//                                     <button
//                                         type="button"
//                                         className={styles.cancelBtn}
//                                         onClick={() => setShowModal(false)}
//                                     >
//                                         Cancel
//                                     </button>
//                                     <button type="submit" className={styles.submitBtn}>
//                                         Add
//                                     </button>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ADMIN_END_POINT } from "../../../utils/constants";
import styles from "../../../styles/serviceManagement.module.css";
import loaderStyles from "../../../styles/loader.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTools,
    faEdit,
    faTrash,
    faPlus,
    faSave,
    faTimes,
    faUserPlus,
    faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import Sidebar from "../../Sidebar";

export default function ServiceManagement() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        serviceName: "",
        serviceDuration: "",
    });

    const [clients, setClients] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedClient, setSelectedClient] = useState("");
    const [showAssignModal, setShowAssignModal] = useState(false);

    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({
        serviceName: "",
        serviceDuration: "",
    });

    useEffect(() => {
        fetchServices();
        fetchClients();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);

            const res = await fetch(`${ADMIN_END_POINT}/service-management`, {
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Failed to fetch services");
            }
            setServices(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load services");
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            setLoading(true);

            const res = await fetch(`${ADMIN_END_POINT}/fetch-clients`, {
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) toast.error(data.error || "Failed to fetch clients");
            console.log("data 1", data);
            setClients(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load clients");
        } finally {
            setLoading(false);
        }
    };

    const filteredServices = services.filter((s) =>
        s.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${ADMIN_END_POINT}/add-service`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) toast.error(data.error || "Failed to add service");

            toast.success("Service added successfully!");
            setShowModal(false);
            setFormData({ serviceName: "", serviceDuration: "" });
            fetchServices();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleAssign = (service) => {
        setSelectedService(service);
        setSelectedClient(""); // reset dropdown
        setShowAssignModal(true);
        console.log(service);
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();

        if (!selectedClient) {
            toast.error("Please select a client");
            return;
        }

        try {
            const res = await fetch(
                `${ADMIN_END_POINT}/assign-service/${selectedService._id}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        serviceId: selectedService._id,
                        clientEmail: selectedClient,
                    }),
                }
            );

            const data = await res.json();
            if (!res.ok){
                console.log("here if");
                toast.info(data.error || "Failed to assign service");
            }
            else {
                console.log("here else");
                toast.success("Service assigned successfully!");
                setShowAssignModal(false);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleEdit = (service) => {
        setEditId(service._id);
        setEditData({
            serviceName: service.serviceName,
            serviceDuration: service.serviceDuration,
        });
    };

    const handleCancelEdit = () => {
        setEditId(null);
        setEditData({ serviceName: "", serviceDuration: "" });
    };

    const handleSaveEdit = async (id) => {
        const original = services.find((s) => s._id === id);
        const updatedFields = {};

        if (editData.serviceName !== original.serviceName) {
            updatedFields.serviceName = editData.serviceName;
        }
        if (editData.serviceDuration !== original.serviceDuration) {
            updatedFields.serviceDuration = editData.serviceDuration;
        }

        if (Object.keys(updatedFields).length === 0) {
            toast.info("No changes detected");
            setEditId(null);
            return;
        }

        try {
            const res = await fetch(`${ADMIN_END_POINT}/edit-service/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(updatedFields),
            });

            const data = await res.json();
            if (!res.ok) toast.error(data.error || "Failed to update service");

            toast.success("Service updated successfully!");

            // Optimistically update UI
            setServices((prev) =>
                prev.map((s) => (s._id === id ? { ...s, ...updatedFields } : s))
            );

            setEditId(null);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this service?"))
            return;
        try {
            const res = await fetch(`${ADMIN_END_POINT}/delete-service/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) toast.error(data.error || "Failed to delete service");

            toast.success("Service deleted successfully!");
            setServices((prev) => prev.filter((s) => s._id !== id));
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.content}>
                <div className={styles.title}>
                    <h1>
                        <FontAwesomeIcon icon={faTools} /> Service Management
                    </h1>
                </div>

                {/* Search + Add Button */}
                <div className={styles.topBar}>
                    <input
                        type="text"
                        placeholder="Search services..."
                        className={styles.searchBar}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                        <FontAwesomeIcon icon={faPlus} /> Add Service
                    </button>
                </div>

                {/* Table */}
                <section className={styles.tableSection}>
                    {loading ? (
                        <div className={loaderStyles.dotLoaderWrapper}>
                            <div className={loaderStyles.dotLoader}></div>
                        </div>
                    ) : filteredServices.length > 0 ? (
                        <table className={styles.serviceTable}>
                            <thead>
                                <tr>
                                    <th>Service Name</th>
                                    <th>Duration (In Days)</th>
                                    <th style={{ textAlign: "center" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredServices.map((service) => (
                                    <tr
                                        key={service._id}
                                        className={styles.tableRow}
                                        onClick={() => navigate(`/admin/service/${service._id}`)}
                                    >
                                        <td>
                                            {editId === service._id ? (
                                                <input
                                                    type="text"
                                                    value={editData.serviceName}
                                                    onClick={(e) => e.stopPropagation()} // prevent navigation
                                                    onChange={(e) =>
                                                        setEditData((prev) => ({
                                                            ...prev,
                                                            serviceName: e.target.value,
                                                        }))
                                                    }
                                                />
                                            ) : (
                                                service.serviceName
                                            )}
                                        </td>
                                        <td>
                                            {editId === service._id ? (
                                                <input
                                                    type="number"
                                                    value={editData.serviceDuration}
                                                    onClick={(e) => e.stopPropagation()} // prevent navigation
                                                    onChange={(e) =>
                                                        setEditData((prev) => ({
                                                            ...prev,
                                                            serviceDuration: e.target.value,
                                                        }))
                                                    }
                                                />
                                            ) : (
                                                service.serviceDuration
                                            )}
                                        </td>
                                        <td
                                            className={styles.actions}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {editId === service._id ? (
                                                <>
                                                    <button
                                                        className={styles.saveBtn}
                                                        onClick={() => handleSaveEdit(service._id)}
                                                    >
                                                        <FontAwesomeIcon icon={faSave} /> Save
                                                    </button>
                                                    <button
                                                        className={styles.cancelBtn}
                                                        onClick={handleCancelEdit}
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} /> Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        className={styles.assignBtn}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAssign(service);
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faUserPlus} /> Assign
                                                    </button>
                                                    <button
                                                        className={styles.editBtn}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(service);
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <button
                                                        className={styles.deleteBtn}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(service._id);
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className={styles.noData}>No services found</p>
                    )}
                </section>

                {/* Assign Service Modal */}
                {showAssignModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h2 className={styles.modalTitle}>
                                Assign Service: {selectedService?.serviceName}
                            </h2>
                            <form onSubmit={handleAssignSubmit}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="clientSelect">Select Client:</label>
                                    <select
                                        id="clientSelect"
                                        value={selectedClient}
                                        onChange={(e) => setSelectedClient(e.target.value)}
                                        required
                                        className={styles.dropdown}
                                    >
                                        <option value="">-- Select Client Email --</option>
                                        {clients.records?.map((client) => (
                                            <option key={client._id} value={client.email}>
                                                {client.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.modalButtons}>
                                    <button
                                        type="button"
                                        className={styles.cancelBtn}
                                        onClick={() => setShowAssignModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className={styles.submitBtn}>
                                        Assign
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Service Modal */}
                {showModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h2 className={styles.modalTitle}>Add Service</h2>
                            <form onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label>Service Name:</label>
                                    <input
                                        type="text"
                                        name="serviceName"
                                        value={formData.serviceName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Service Duration:</label>
                                    <input
                                        type="number"
                                        name="serviceDuration"
                                        value={formData.serviceDuration}
                                        onChange={handleChange}
                                        placeholder="e.g., 15 Days"
                                        required
                                    />
                                </div>

                                <div className={styles.modalButtons}>
                                    <button
                                        type="button"
                                        className={styles.cancelBtn}
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className={styles.submitBtn}>
                                        Add
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
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

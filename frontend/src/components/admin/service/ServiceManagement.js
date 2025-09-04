import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ADMIN_END_POINT } from "../../../utils/constants";
import styles from "../../../styles/serviceManagement.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTools, faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import Sidebar from "../../Sidebar";

export default function ServiceManagement() {
    const navigate = useNavigate();
    const [services, setServices] = useState([]); // fetched services
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        serviceName: "",
        serviceDuration: "",
    });

    // Fetch services from backend
    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch(`${ADMIN_END_POINT}/service-management`, { credentials: "include" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch services");
            setServices(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load services");
        }
    };

    // Handle search filter
    const filteredServices = services.filter((s) =>
        s.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle form input change
    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Handle Add Service form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${ADMIN_END_POINT}/add-service`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    serviceName: formData.serviceName,
                    serviceDuration: formData.serviceDuration
                })
            });

            console.log(res);
            console.log("formData", formData);

            const data = await res.json();
            console.log(data);
            if (!res.ok) throw new Error(data.message || "Failed to add service");

            toast.success("Service added successfully!");
            setShowModal(false);
            setFormData({ serviceName: "", serviceDuration: "" });
            fetchServices();
        } catch (err) {
            toast.error(err.message);
        }
    };

    // Handle Edit
    const handleEdit = (id) => {
        navigate(`/admin/service/edit/${id}`);
    };

    // Handle Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return;
        try {
            const res = await fetch(`${ADMIN_END_POINT}/services/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to delete service");

            toast.success("Service deleted successfully!");
            fetchServices();
        } catch (err) {
            toast.error(err.message);
        }
    };

    // Handle Row Click → navigate to service details
    const handleRowClick = (id) => {
        navigate(`/admin/service/${id}`);
    };

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.content}>
                <h1 className={styles.title}>
                    <FontAwesomeIcon icon={faTools} /> Service Management
                </h1>

                {/* Top Bar with Search + Add Button */}
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

                {/* Service Table */}
                {filteredServices.length > 0 ? (
                    <table className={styles.serviceTable}>
                        <thead>
                            <tr>
                                <th>Service Name</th>
                                <th>Duration(in months)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServices.map((service) => (
                                <tr key={service.id} onClick={() => handleRowClick(service.id)}>
                                    <td>{service.serviceName}</td>
                                    <td>{service.serviceDuration}</td>
                                    <td className={styles.actions}>
                                        <button
                                            className={styles.editBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(service.id);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(service.id);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className={styles.noData}>No services found</p>
                )}

                {/* Modal for Add Service */}
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
                                        placeholder="e.g., 6 months"
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
            </div>
        </div>
    );
}

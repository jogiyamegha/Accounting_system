import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Sidebar";
import { ADMIN_END_POINT } from "../../../utils/constants";
import styles from "../../../styles/serviceManagement.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTools } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

// Display names for service cards
const SERVICE_TYPES = ["VAT Filing", "Corporate Tax", "Payroll", "Audit"];

// Mapping string → number for backend
const SERVICE_TYPE_MAP = {
    "VAT Filing": 1,
    "Corporate Tax": 2,
    "Payroll": 3,
    "Audit": 4,
};

// Reverse mapping number → string for displaying
const SERVICE_TYPE_LABELS = {
    1: "VAT Filing",
    2: "Corporate Tax",
    3: "Payroll",
    4: "Audit",
};

export default function ServiceManagement() {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [selectedServiceType, setSelectedServiceType] = useState(null);
    const [formData, setFormData] = useState({
        clientEmail: "",
        serviceType: "",
        startDate: "",
        endDate: "",
    });

  // When clicking "Assign Service"
    const handleAssignClick = (type) => {
        const typeId = SERVICE_TYPE_MAP[type];
        setSelectedServiceType(typeId);
        setFormData({
            clientEmail: "",
            serviceType: typeId, // send number to backend
            startDate: "",
            endDate: "",
        });
        setShowForm(true);
    };

    // When clicking "View"
    const handleViewClick = (type) => {
        const typeId = SERVICE_TYPE_MAP[type];
        setSelectedServiceType(typeId);
        navigate(`/admin/service/${typeId}`); // navigate with numeric ID
    };

    // Handle form input change
    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Submit assign form
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${ADMIN_END_POINT}/assign-service`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: "include",
            });

            let data = {};
            try {
                const text = await res.text();
                data = text ? JSON.parse(text) : {};
            } catch (parseErr) {
                toast.warn("Response is not valid JSON:", parseErr);
            }

            if (!res.ok) {
                toast.error("Failed to assign service");
                throw new Error(data.message || "Failed to assign service");
            }

            toast.success(data.message || "Service assigned successfully!");
            setShowForm(false);

            // Navigate dynamically using serviceType id
            navigate(`/admin/service/${formData.serviceType}`);
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    };

    return (
        <div className={styles.container}>
        <Sidebar />

        <div className={styles.content}>
            <h1 className={styles.title}>
            <FontAwesomeIcon icon={faTools} /> Service Management
            </h1>

            <div className={styles.serviceCards}>
                {SERVICE_TYPES.map((type) => (
                    <div key={type} className={styles.serviceCard}>
                    <h3>{type}</h3>
                    <p>Track and assign this service to clients</p>
                    <button
                        className={styles.assignBtn}
                        onClick={() => handleAssignClick(type)}
                    >
                        Assign Service
                    </button>
                    <button
                        className={styles.viewBtn}
                        onClick={() => handleViewClick(type)}
                    >
                        View
                    </button>
                    </div>
                ))}
            </div>

            {showForm && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                    <h2 className={styles.modalTitle}>
                        Assign Service - {SERVICE_TYPE_LABELS[selectedServiceType]}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                        <label>Client Email:</label>
                        <input
                            type="email"
                            name="clientEmail"
                            value={formData.clientEmail}
                            onChange={handleChange}
                            required
                        />
                        </div>
                        <div className={styles.formGroup}>
                        <label>Service Type:</label>
                        <input
                            type="text"
                            value={SERVICE_TYPE_LABELS[formData.serviceType]}
                            readOnly
                        />
                        </div>
                        {/* <div className={styles.formGroup}>
                        <label>End Date:</label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            min={
                            formData.startDate
                                ? formData.startDate
                                : new Date().toISOString().split("T")[0]
                            }
                            required
                        />
                        </div> */}

                        <div className={styles.modalButtons}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={() => setShowForm(false)}
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
            </div>
        </div>
    );
}

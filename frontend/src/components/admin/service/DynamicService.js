import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ADMIN_END_POINT } from "../../../utils/constants";
import Sidebar from "../../Sidebar";
import styles from "../../../styles/dynamicService.module.css";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressCard, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB");
};

export default function DynamicService() {
    const { id } = useParams(); // ✅ serviceId from URL
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [selectedClient, setSelectedClient] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [requiredDocs, setRequiredDocs] = useState([]);

    const fetchClients = async () => {
        try {
            const res = await fetch(`${ADMIN_END_POINT}/service/${id}`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                let errorData = await res.json();
                toast.error(errorData.error || "Failed to fetch clients");
                return;
            }

            const data = await res.json();
            setClients(data);
        } catch (err) {
            console.error("Error fetching clients:", err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (id) fetchClients();
    }, [id]);

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

            const result = await res.json();
            if (!res.ok) {
                let errorData = result.error;
                toast.error(errorData || "Failed to de-assign service");
                return;
            }

            toast.success("Service De-assigned Successfully");
            // Refresh the data instead of manually updating state
            await fetchClients();
        } catch (err) {
            console.error("Error de-assigning service:", err);
            toast.error("Error occurred while de-assigning service");
        }
    };


    const renewService = async (serviceId, clientId) => {
        try {
            if (!serviceId) return console.error("Service ID not found!");

            const res = await fetch(
                `${ADMIN_END_POINT}/renew-service/${serviceId}/${clientId}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (!res.ok) {
                let errorData = await res.json();
                toast.error(errorData.error || "Failed to renew service");
                return;
            }

            toast.success("Service renewed successfully");
            // Refresh the data
            await fetchClients();
        } catch (error) {
            console.error("Error renew service:", error);
            toast.error("Error occurred while renewing service");
        }
    };

    const goToClientDetails = (clientId) => {
        navigate(`/admin/client-detail/${clientId}`);
    };

    return (
        <div className={styles.pageWrapper}>
            <Sidebar />
            <div className={styles.mainContent}>
                <div className={styles.pageTitle}>
                    <h1>
                        <FontAwesomeIcon icon={faAddressCard} />
                        Clients Applied
                    </h1>
                </div>

                <section className={styles.tableSection}>
                    {loading ? (
                        <p className={styles.loading}>Loading clients...</p>
                    ) : clients.length === 0 ? (
                        <p className={styles.noData}>No clients found for this service.</p>
                    ) : (
                        <table className={styles.card}>
                            <thead>
                                <tr>
                                    <th>Client Name</th>
                                    <th>Email</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: "center" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) =>
                                    client.services
                                        .filter(
                                            (s) => s.serviceId === id || s.serviceId?._id === id
                                        )
                                        .map((service, idx) => (
                                            <tr
                                                key={`${client._id}-${idx}`}
                                                className={styles.tableRow}
                                                onClick={() => goToClientDetails(client._id)} // ✅ row click
                                                style={{ cursor: "pointer" }}
                                            >
                                                <td>{client.name}</td>
                                                <td>{client.email}</td>
                                                <td>{formatDate(service.serviceStartDate)}</td>
                                                <td>{formatDate(service.endDate)}</td>
                                                <td>{service.serviceStatus}</td>
                                                <td
                                                    className={styles.actions}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {service.serviceStatus === 3 && (
                                                        <button
                                                            className={styles.uploadBtn4}
                                                            onClick={() =>
                                                                renewService(
                                                                    service.serviceId?._id || service.serviceId,
                                                                    client._id
                                                                )
                                                            }
                                                        >
                                                            Renew Service
                                                        </button>
                                                    )}

                                                    {service.serviceStatus === 2 && (
                                                        <button
                                                            className={styles.uploadBtn4}
                                                            onClick={() =>
                                                                deAssignService(
                                                                    service.serviceId?._id || service.serviceId,
                                                                    client._id
                                                                )
                                                            }
                                                        >
                                                            De-Assign
                                                        </button>
                                                    )}

                                                </td>
                                            </tr>
                                        ))
                                )}
                            </tbody>
                        </table>
                    )}
                </section>

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

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ADMIN_END_POINT, ServiceStatus } from "../../../utils/constants";
import Sidebar from "../../Sidebar";
import styles from "../../../styles/dynamicService.module.css";
import loaderStyles from "../../../styles/loader.module.css";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAddressCard,
    faArrowLeft,
    faEllipsisH,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";

const serviceStatusNumberToString = {
    1: "not Started",
    2: "in Progress",
    3: "completed",
};

const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB");
};

export default function DynamicService() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [clients, setClients] = useState([]); // clients linked to service
    const [allClients, setAllClients] = useState([]); // all clients for assignment
    const [serviceName, setServiceName] = useState("");
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");

    const [statusUpdates, setStatusUpdates] = useState({});
    const [totalClients, setTotalClients] = useState(0);

    // Assign service modal
    const [selectedService, setSelectedService] = useState(null);
    const [selectedClient, setSelectedClient] = useState("");
    const [showAssignModal, setShowAssignModal] = useState(false);

    // Assign staff modal
    const [showAssignStaffModal, setShowAssignStaffModal] = useState(false);
    const [staffName, setStaffName] = useState("");
    const [staffEmail, setStaffEmail] = useState("");
    const [currentServiceClient, setCurrentServiceClient] = useState(null);

    const [page, setPage] = useState(1);
    const limit = 10;

    const [openMenuId, setOpenMenuId] = useState(null);

    const toggleMenu = (serviceId) => {
        setOpenMenuId(openMenuId === serviceId ? null : serviceId);
    };

    // ✅ Fetch service + linked clients
    const fetchServiceAndClients = async () => {
        try {
            const res = await fetch(`${ADMIN_END_POINT}/service/${id}`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const errorData = await res.json();
                toast.error(errorData.error || "Failed to fetch clients");
                return;
            }

            const data = await res.json();
            if (data.records.service?.name) setServiceName(data.records.service.name);
            if (Array.isArray(data.records.clients)) setClients(data.records.clients);
            else setClients(data.records);
            setTotalClients(data.total || 0);
        } catch (err) {
            console.error("Error fetching clients:", err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchServiceAndClients();
    }, [page, id]);

    // ✅ De-assign service
    const deAssignService = async (serviceId, clientId) => {
        try {
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
                toast.error(result.error || "Failed to de-assign service");
                return;
            }

            toast.success("Service De-assigned Successfully");
            await fetchServiceAndClients();
        } catch (err) {
            console.error("Error de-assigning service:", err);
            toast.error("Error occurred while de-assigning service");
        }
    };

    // ✅ Renew service
    const renewService = async (serviceId, clientId) => {
        try {
            const res = await fetch(
                `${ADMIN_END_POINT}/renew-service/${serviceId}/${clientId}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (!res.ok) {
                const errorData = await res.json();
                toast.error(errorData.error || "Failed to renew service");
                return;
            }

            toast.success("Service renewed successfully");
            await fetchServiceAndClients();
        } catch (error) {
            console.error("Error renew service:", error);
            toast.error("Error occurred while renewing service");
        }
    };

    // ✅ Update status
    const handleStatusChangeUpdate = async (serviceId, clientId, newStatus) => {
        try {
            const res = await fetch(
                `${ADMIN_END_POINT}/update-service-status/${serviceId}/${clientId}`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ serviceStatus: newStatus }),
                }
            );

            const result = await res.json();
            if (!res.ok) {
                toast.error(result.error || "Failed to update status");
                return;
            }

            toast.success("Service status updated successfully");
            await fetchServiceAndClients();
        } catch (err) {
            console.error("Error updating service status:", err);
            toast.error("Error occurred while updating status");
        }
    };

    // ✅ Open Assign Modal (fetch all clients)
    const handleAssign = async (serviceId) => {
        try {
            setSelectedService({ _id: serviceId });
            setSelectedClient("");

            const res = await fetch(`${ADMIN_END_POINT}/fetch-clients`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Failed to fetch clients");
                return;
            }

            setAllClients(data.records || []);
            setShowAssignModal(true);
        } catch (err) {
            console.error(err);
            toast.error("Error fetching clients for assignment");
        }
    };

    // ✅ Assign service
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
            if (!res.ok) {
                toast.error(data.error || "Failed to assign service");
                return;
            }

            toast.success("Service assigned successfully!");
            setShowAssignModal(false);
            await fetchServiceAndClients();
        } catch (err) {
            toast.error(err.message || "Error assigning service");
        }
    };

    const assignStaff = () => {
        alert("Assign staff logic here");
    };

    const manageDocument = () => {
        alert("Manage document logic here");
    };

    const goToClientDetails = (clientId) => {
        navigate(`/admin/client-service-detail/${clientId}`);
    };

    // Sorting by end date
    const sortByEndDate = (services) => {
        return [...services].sort((a, b) => {
            const dateA = a.endDate ? new Date(a.endDate) : new Date(0);
            const dateB = b.endDate ? new Date(b.endDate) : new Date(0);
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });
    };

    const totalPages = Math.ceil(totalClients / limit);
    const goToPage = (p) => {
        if (p >= 1 && p <= totalPages) setPage(p);
    };

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <div className={styles.pageWrapper}>
            <Sidebar />
            <div className={styles.mainContent}>
                <div className={styles.pageTitle}>
                    <h1>
                        <FontAwesomeIcon icon={faAddressCard} />
                        Associated Clients with{" "}
                        {serviceName && (
                            <span className={styles.serviceName}>– {serviceName}</span>
                        )}
                    </h1>
                </div>

                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className={styles.searchBar}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <button
                        className={styles.addBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAssign(id);
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} /> Assign Service
                    </button>
                </div>

                {/* Filters */}
                <div className={styles.filterContainer}>
                    <div className={styles.filterGroup}>
                        <label>Filter By End Date</label>
                        <input
                            type="date"
                            className={styles.dateFilter}
                            value={endDateFilter}
                            onChange={(e) => setEndDateFilter(e.target.value)}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Filter By Status</label>
                        <select
                            className={styles.statusFilter}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            {Object.entries(serviceStatusNumberToString).map(
                                ([key, value]) => (
                                    <option key={key} value={key}>
                                        {value}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Sort By End Date</label>
                        <select
                            className={styles.sortSelect}
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="asc">Sort by End Date (ASC)</option>
                            <option value="desc">Sort by End Date (DESC)</option>
                        </select>
                    </div>
                </div>

                <section className={styles.tableSection}>
                    {loading ? (
                        <div className={loaderStyles.dotLoaderWrapper}>
                            <div className={loaderStyles.dotLoader}></div>
                        </div>
                    ) : clients.length === 0 ? (
                        <p className={styles.noData}>No clients found for this service.</p>
                    ) : (
                        <table className={styles.card}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Status</th>
                                    <th>Staff Assigned</th>
                                    <th style={{ textAlign: "center" }}>Actions</th>
                                    <th style={{ textAlign: "center" }}>More Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients
                                    .filter((client) => {
                                        const term = searchTerm.toLowerCase();
                                        return (
                                            client.name.toLowerCase().includes(term) ||
                                            client.email.toLowerCase().includes(term)
                                        );
                                    })
                                    .map((client) =>
                                        sortByEndDate(
                                            client.services.filter(
                                                (s) => s.serviceId === id || s.serviceId?._id === id
                                            )
                                        )
                                            .filter((service) => {
                                                let matchesStatus =
                                                    !statusFilter ||
                                                    String(service.serviceStatus) === statusFilter;

                                                let matchesEndDate = true;
                                                if (endDateFilter) {
                                                    const formattedEnd = new Date(service.endDate)
                                                        .toISOString()
                                                        .split("T")[0];
                                                    matchesEndDate =
                                                        formattedEnd === endDateFilter;
                                                }

                                                return matchesStatus && matchesEndDate;
                                            })
                                            .map((service, idx) => {
                                                const currentStatus = Number(
                                                    statusUpdates[service._id] ??
                                                        service.serviceStatus
                                                );

                                                return (
                                                    <tr
                                                        key={`${client._id}-${idx}`}
                                                        className={styles.tableRow}
                                                        onClick={() => goToClientDetails(client._id)}
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        <td>{client.name}</td>
                                                        <td>{client.email}</td>
                                                        <td>{formatDate(service.serviceStartDate)}</td>
                                                        <td>{formatDate(service.endDate)}</td>
                                                        <td>
                                                            <select
                                                                className={`${styles.statusButton} ${
                                                                    currentStatus ===
                                                                    ServiceStatus.inProgress
                                                                        ? styles.statusPending
                                                                        : currentStatus ===
                                                                          ServiceStatus.completed
                                                                        ? styles.statusApproved
                                                                        : styles.statusRejected
                                                                }`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                value={
                                                                    statusUpdates[service._id] ??
                                                                    service.serviceStatus ??
                                                                    ""
                                                                }
                                                                onChange={(e) => {
                                                                    const selectedValue =
                                                                        Number(e.target.value);
                                                                    setStatusUpdates((prev) => ({
                                                                        ...prev,
                                                                        [service._id]: selectedValue,
                                                                    }));
                                                                    handleStatusChangeUpdate(
                                                                        service._id,
                                                                        client._id,
                                                                        selectedValue
                                                                    );
                                                                }}
                                                            >
                                                                {currentStatus === 1 ? (
                                                                    <>
                                                                        <option
                                                                            value={ServiceStatus.notStarted}
                                                                        >
                                                                            notStarted
                                                                        </option>
                                                                        <option
                                                                            value={ServiceStatus.inProgress}
                                                                        >
                                                                            inProgress
                                                                        </option>
                                                                    </>
                                                                ) : currentStatus === 2 ? (
                                                                    <>
                                                                        <option
                                                                            value={ServiceStatus.inProgress}
                                                                        >
                                                                            inProgress
                                                                        </option>
                                                                        <option
                                                                            value={ServiceStatus.completed}
                                                                        >
                                                                            completed
                                                                        </option>
                                                                    </>
                                                                ) : (
                                                                    <option
                                                                        value={ServiceStatus.completed}
                                                                    >
                                                                        completed
                                                                    </option>
                                                                )}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <p style={{ textAlign: "left" }}>NA</p>
                                                        </td>
                                                        <td
                                                            className={styles.actions}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {service.serviceStatus === 3 && (
                                                                <button
                                                                    className={styles.uploadBtn4}
                                                                    onClick={() =>
                                                                        renewService(
                                                                            service.serviceId,
                                                                            client._id
                                                                        )
                                                                    }
                                                                >
                                                                    Renew
                                                                </button>
                                                            )}
                                                            {service.serviceStatus === 2 && (
                                                                <button
                                                                    className={styles.uploadBtn5}
                                                                    onClick={() =>
                                                                        deAssignService(
                                                                            service._id,
                                                                            client._id
                                                                        )
                                                                    }
                                                                >
                                                                    De-Assign
                                                                </button>
                                                            )}
                                                        </td>
                                                        <td
                                                            className={styles.actionsCell}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <div className={styles.menuWrapper}>
                                                                <button
                                                                    type="button"
                                                                    className={styles.dotsButton}
                                                                    onClick={() => toggleMenu(service._id)}
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={faEllipsisH}
                                                                    />
                                                                </button>

                                                                <div
                                                                    className={`${styles.dropdownMenu} ${
                                                                        openMenuId === service._id
                                                                            ? styles.open
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    <button
                                                                        className={styles.dropdownItem}
                                                                        onClick={() => {
                                                                            manageDocument();
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                    >
                                                                        Manage Document
                                                                    </button>

                                                                    <button
                                                                        className={styles.dropdownItem}
                                                                        onClick={() => {
                                                                            setCurrentServiceClient({
                                                                                serviceId:
                                                                                    service.serviceId?._id ||
                                                                                    service.serviceId,
                                                                                clientId: client._id,
                                                                            });
                                                                            setShowAssignStaffModal(true);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                    >
                                                                        Assign Staff
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                    )}
                            </tbody>
                        </table>
                    )}

                    {/* Assign Service Modal */}
                    {showAssignModal && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modalContent}>
                                <h2 className={styles.modalTitle}>
                                    Assign Service: {serviceName}
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
                                            {allClients.map((client) => (
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

                    {/* Pagination */}
                    <div className={styles.pagination}>
                        <button onClick={() => goToPage(page - 1)} disabled={page === 1}>
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                className={page === i + 1 ? styles.activePage : ""}
                                onClick={() => goToPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => goToPage(page + 1)}
                            disabled={page === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

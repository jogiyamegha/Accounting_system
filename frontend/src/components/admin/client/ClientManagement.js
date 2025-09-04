import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../Sidebar";
import styles from "../../../styles/clientManagement.module.css"; // ✅ using CSS module
import { ADMIN_END_POINT } from "../../../utils/constants";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUsers,
    faEye,
    faTrash,
    faPen,
    faPlusCircle,
    faFileInvoice,
    faPlus,
    faCheckCircle,
    faBan,
} from "@fortawesome/free-solid-svg-icons";

export default function ClientManagement() {
    const navigate = useNavigate();

    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [totalClients, setTotalClients] = useState(0);

    // Pagination
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchClients = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                searchTerm: search,
                limit,
                skip: (page - 1) * limit,
                needCount: true,
            });

            const response = await fetch(
                `${ADMIN_END_POINT}/client-management?${queryParams.toString()}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                }
            );

            const data = await response.json();
            setClients(data.records || []);
            setTotalClients(data.total || 0);
        } catch (error) {
            toast.error("Error fetching clients");
            console.error("Error fetching clients:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [page, search]);

    const handleAddClient = () => navigate("/admin/add-client");
    const handleView = (id) => navigate(`/admin/client-detail/${id}`);
    // const handleEdit = (id) => navigate(`/admin/edit-client/${id}`);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this client?")) {
            try {
                await fetch(`${ADMIN_END_POINT}/delete-client/${id}`, {
                    method: "DELETE",
                });
                toast.success("client deleted suceesfully!");
                fetchClients();
            } catch (error) {
                toast.error("Failed to delete client");
                console.error("Failed to delete client:", error);
            }
        }
    };

    const handleGenerateInvoice = (id) =>
        navigate(`/admin/generate-invoice/${id}`);

    const handleAppyService = (id) => navigate(`/admin/service-management`);

    const handleClientStatus = async (id) => {
        try {
            let res = await fetch(`${ADMIN_END_POINT}/change-status/${id}`, {
                method: "PATCH",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error(`Server responded with ${res.status}`);
            }

            const data = await res.json();
            console.log("data in try", data);

            if (data?.client?.isActive === undefined && data?.isActive === undefined) {
                throw new Error("Invalid response format, missing isActive field");
            }

            const isActive = data?.client?.isActive ?? data.isActive;

            console.log(isActive);

            if (isActive === false || isActive === "false") {
                toast.success("Client is Deactivated Successfully!");
            } else {
                toast.success("Client is Activated Successfully!");
            }
            fetchClients();
        } catch (error) {
            console.error("Failed to change client status:", error);
            toast.error("Failed to change client status");
        }
    };


    // Pagination helpers
    const totalPages = Math.ceil(totalClients / limit);
    const goToPage = (p) => {
        if (p >= 1 && p <= totalPages) setPage(p);
    };

    return (
        <div className={styles.layout}>
            <Sidebar />

            <main className={styles.content}>
                <header className={styles.header}>
                    <h1>
                        <FontAwesomeIcon icon={faUsers} /> Client Management
                    </h1>
                    <button className={styles.addClientBtn} onClick={handleAddClient}>
                        <FontAwesomeIcon icon={faPlus} /> Add Client
                    </button>
                </header>

                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="Search by client name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <section className={styles.tableSection}>
                    {loading ? (
                        <p>Loading clients...</p>
                    ) : clients.length === 0 ? (
                        <p className={styles.noData}>No clients found.</p>
                    ) : (
                        <>
                            <p className={styles.total}>Total Clients: {totalClients}</p>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th className={styles.actionsCol}>Actions</th>
                                    </tr>
                                </thead>
                                {/* <tbody>
                                    {clients.map((client) => (
                                        <tr key={client._id}>
                                            <td>{client.name}</td>
                                            <td>{client.email}</td>
                                            <td>{client.contact.phone}</td>
                                            <td className={styles.actions}>
                                                <button onClick={() => handleView(client._id)}>
                                                    <FontAwesomeIcon icon={faEye} /> View
                                                </button>
                                                <button onClick={() => handleEdit(client._id)}>
                                                    <FontAwesomeIcon icon={faPen} /> Edit
                                                </button>
                                                <button onClick={() => handleDelete(client._id)}>
                                                    <FontAwesomeIcon icon={faTrash} /> Delete
                                                </button>
                                                <button
                                                    onClick={() => handleGenerateInvoice(client._id)}
                                                >
                                                    <FontAwesomeIcon icon={faFileInvoice} /> Invoice
                                                </button>
                                                <button onClick={() => handleAppyService(client._id)}>
                                                    <FontAwesomeIcon icon={faPlusCircle} /> Service
                                                </button>
                                                <button
                                                    onClick={() => handleClientStatus(client._id)}
                                                    className={`${styles.statusButton} ${client.isActive
                                                            ? styles.deactivate
                                                            : styles.activate
                                                        }`}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={client.isActive ? faBan : faCheckCircle}
                                                    />{" "}
                                                    {client.isActive ? "Deactivate" : "Activate"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody> */}

                                <tbody>
                                    {clients.map((client) => (
                                        <tr
                                            key={client._id}
                                            onClick={() => handleView(client._id)} // navigate when row is clicked
                                            className={styles.clickableRow} // optional styling for hover effect
                                        >
                                            <td>{client.name}</td>
                                            <td>{client.email}</td>
                                            <td>{client.contact.phone}</td>
                                            <td
                                                className={styles.actions}
                                                onClick={(e) => e.stopPropagation()} // prevent row click on buttons
                                            >
                                                {/* <button onClick={() => handleView(client._id)}>
                                                    <FontAwesomeIcon icon={faEye} /> View
                                                </button>
                                                <button onClick={() => handleEdit(client._id)}>
                                                    <FontAwesomeIcon icon={faPen} /> Edit
                                                </button> */}
                                                <button onClick={() => handleGenerateInvoice(client._id)}>
                                                    <FontAwesomeIcon icon={faFileInvoice} /> New Invoice
                                                </button>
                                                <button onClick={() => handleAppyService(client._id)}>
                                                    <FontAwesomeIcon icon={faPlusCircle} /> Assign Service
                                                </button>
                                                <button onClick={() => handleDelete(client._id)}>
                                                    <FontAwesomeIcon icon={faTrash} /> Delete
                                                </button>
                                                
                                                {/* <button
                                                    onClick={() => handleClientStatus(client._id)}
                                                    className={`${styles.statusButton} ${client.isActive ? styles.deactivate : styles.activate
                                                        }`}
                                                >
                                                    <FontAwesomeIcon icon={client.isActive ? faBan : faCheckCircle} />{" "}
                                                    {client.isActive ? "Deactivate" : "Activate"}
                                                </button> */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>

                            {/* Pagination */}
                            <div className={styles.pagination}>
                                <button
                                    onClick={() => goToPage(page - 1)}
                                    disabled={page === 1}
                                >
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
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}

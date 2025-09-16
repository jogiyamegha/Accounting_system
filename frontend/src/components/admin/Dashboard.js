import Sidebar from "../Sidebar";
import { useState, useEffect } from "react";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBell,
    faFile,
    faChartLine,
    faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

import styles from "../../styles/adminDashboard.module.css";
import loaderStyles from "../../styles/loader.module.css";
import {
    ADMIN_END_POINT,
    notificationIcons,
    notificationTypeLabels,
} from "../../utils/constants";
import { toast } from "react-toastify";

export default function Dashboard() {
    const [activeClients, setActiveClients] = useState(0);
    const [loading, setLoading] = useState(true);
    const [totalClients, setTotalClients] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [uploadData, setUploadData] = useState([]);

    // For dynamic deadlines
    const [services, setServices] = useState([]); // list of all services
    const [selectedService, setSelectedService] = useState("");
    const [deadlines, setDeadlines] = useState([]); // clients with deadlines

    useEffect(() => {
        fetch(`${ADMIN_END_POINT}/documents/upload-stats`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => setUploadData(data));
    }, []);

    const fetchClients = async () => {
        let data;
        try {
            setLoading(true);
            const response = await fetch(`${ADMIN_END_POINT}/admin-dashboard`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            data = await response.json();

            setTotalClients(data.allClients || 0);
            setActiveClients(data.allActiveClients || 0);
        } catch (error) {
            const errorMsg = data?.error || "Error fetching clients:";
            toast.error(errorMsg);
            console.error("Error fetching clients:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            let data;
            try {
                const res = await fetch(`${ADMIN_END_POINT}/notification-management`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });
                data = await res.json();
                setNotifications(data);
            } catch (err) {
                const errorMsg = data?.error || "Failed to fetch notifications:";
                toast.error(errorMsg);
                console.error("Failed to fetch notifications:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    // Fetch all services
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch(`${ADMIN_END_POINT}/service-management`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                console.log('kan', data);
                setServices(data || []);
            } catch (err) {
                console.error("Failed to fetch services:", err);
            }
        };
        fetchServices();
    }, []);

    // Fetch deadlines when service is selected
    useEffect(() => {
        if (!selectedService) return;
        const fetchDeadlines = async () => {
            try {
                const res = await fetch(`${ADMIN_END_POINT}/get-client-service-deadline/${selectedService}`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                console.log("njndjedej", data);
                setDeadlines(data || []);
            } catch (err) {
                console.error("Failed to fetch deadlines:", err);
            }
        };
        fetchDeadlines();
    }, [selectedService]);

    const previewNotifications = notifications.slice(0, 3);

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar />

            <main className={styles.dashboardContent}>
                <header className={styles.dashboardHeader}>
                    <h1>
                        <FontAwesomeIcon icon={faChartLine} /> Dashboard
                    </h1>
                </header>

                <section className={styles.dashboardCards}>
                    <div className={styles.card}>
                        <h3>Total Registered Clients</h3>
                        <p>{totalClients}</p>
                    </div>
                    <div className={styles.card}>
                        <h3>Active Clients</h3>
                        <p>{activeClients}</p>
                    </div>
                </section>

                <div className={styles.dashboardGrid}>
                    {/* Document Upload Chart */}
                    <div className={`${styles.dashboardChart} ${styles.card}`}>
                        <h2>Document Upload Status (Last 7 Days)</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={uploadData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Approved" fill="#033670ff" />
                                <Bar dataKey="Pending" fill="#1c599fff" />
                                <Bar dataKey="Rejected" fill="#5296e4ff" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* VAT Return Deadlines */}
                    <div className={`${styles.dashboardTable} ${styles.card}`}>
                        <h2>Service Deadlines</h2>

                        <select
                            value={selectedService}
                            onChange={(e) => setSelectedService(e.target.value)}
                            className={styles.dropdown}
                        >
                            <option value="">-- Select Service --</option>
                            {services.map((s) => (
                                <option key={s._id} value={s._id}>
                                    {s.serviceName}
                                </option>
                            ))}
                        </select>

                        <table>
                            <thead>
                                <tr>
                                    <th>Client</th>
                                    <th>Deadline</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deadlines.length === 0 ? (
                                    <tr>
                                        <td colSpan="2">No deadlines available</td>
                                    </tr>
                                ) : (
                                    deadlines.map((d) => (
                                        <tr key={d._id}>
                                            <td>{d.name}</td>
                                            <td>
                                                {(() => {
                                                    const service = d.services.find(
                                                        (s) => String(s.serviceId) === String(selectedService)
                                                    );
                                                    return service?.endDate
                                                        ? new Date(service.endDate).toLocaleDateString('en-GB')
                                                        : "No deadline";
                                                })()}
                                            </td>

                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Notifications */}
                <section className={`${styles.dashboardNotifications} ${styles.card}`}>
                    <h2>Notifications and Alerts</h2>

                    {loading ? (
                        <div className={loaderStyles.dotLoaderWrapper}>
                            <div className={loaderStyles.dotLoader}></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <p>No new notifications</p>
                    ) : (
                        <>
                            <ul>
                                {previewNotifications.map((n) => (
                                    <li key={n._id}>
                                        <FontAwesomeIcon
                                            icon={notificationIcons[n.type] || faBell}
                                        />{" "}
                                        <strong>
                                            {notificationTypeLabels[n.notificationType]}
                                        </strong>
                                    </li>
                                ))}
                            </ul>

                            {notifications.length >= 2 && (
                                <a
                                    href="/admin/notification-management"
                                    className={styles.moreLink}
                                >
                                    View All Notifications →
                                </a>
                            )}
                        </>
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
            </main>
        </div>
    );
}

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
import { faBell, faFile, faChartLine, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import styles from "../../styles/adminDashboard.module.css";
import {
  ADMIN_END_POINT,
  notificationIcons,
  notificationTypeLabels,
} from "../../utils/constants";
import { toast } from "react-toastify";
import { format } from "date-fns";

// const uploadData = [
//   { day: "Mon", Approved: 25, Pending: 10, Rejected: 5 },
//   { day: "Tue", Approved: 28, Pending: 8, Rejected: 4 },
//   { day: "Wed", Approved: 35, Pending: 5, Rejected: 6 },
//   { day: "Thu", Approved: 30, Pending: 12, Rejected: 7 },
//   { day: "Fri", Approved: 20, Pending: 20, Rejected: 10 },
//   { day: "Sat", Approved: 15, Pending: 10, Rejected: 8 },
//   { day: "Sun", Approved: 18, Pending: 12, Rejected: 9 },
// ];

export default function Dashboard() {
  const [activeClients, setActiveClients] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalClients, setTotalClients] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [uploadData, setUploadData] = useState([]);

  useEffect(() => {
    fetch(`${ADMIN_END_POINT}/documents/upload-stats`, {
      method: "GET",
      // headers: { "Content-Type": "application/json" },
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
      const errorMsg = data.error || "Error fetching clients:";

      toast.error(errorMsg);
      //   toast.error("Error fetching clients:");
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [totalClients, activeClients]);

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
        const errorMsg = data.error || "Failed to fetch notifications:";
        toast.error(errorMsg);
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

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

        {/* Charts and Tables */}
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
            <h2>VAT Return Deadlines</h2>
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Client A</td>
                  <td>31 May 2024</td>
                </tr>
                <tr>
                  <td>Client B</td>
                  <td>30 Jun 2024</td>
                </tr>
                <tr>
                  <td>Client C</td>
                  <td>31 Jul 2024</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications */}
        <section className={`${styles.dashboardNotifications} ${styles.card}`}>
          <h2>Notifications and Alerts</h2>

          {loading ? (
            <p>Loading notifications...</p>
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
                    </strong>{" "}
                    {/* {n.message} */}
                    {/* <small style={{ marginLeft: "8px", color: "#666" }}>
                      {format(new Date(n.expiresAt), "dd-MM-yyyy HH:mm")}
                    </small> */}
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

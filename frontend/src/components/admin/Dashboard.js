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
import { faBell, faFile, faChartLine } from "@fortawesome/free-solid-svg-icons";

import styles from "../../styles/adminDashboard.module.css";
import { ADMIN_END_POINT } from "../../utils/constants";
import { toast } from "react-toastify";

const uploadData = [
  { day: "Mon", Successful: 25, Pending: 10, Failed: 5 },
  { day: "Tue", Successful: 28, Pending: 8, Failed: 4 },
  { day: "Wed", Successful: 35, Pending: 5, Failed: 6 },
  { day: "Thu", Successful: 30, Pending: 12, Failed: 7 },
  { day: "Fri", Successful: 20, Pending: 20, Failed: 10 },
  { day: "Sat", Successful: 15, Pending: 10, Failed: 8 },
  { day: "Sun", Successful: 18, Pending: 12, Failed: 9 },
];

export default function Dashboard() {
  const [activeClients, setActiveClients] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalClients, setTotalClients] = useState(0);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${ADMIN_END_POINT}/admin-dashboard`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      setTotalClients(data.allClients || 0);
      setActiveClients(data.allActiveClients || 0);
    } catch (error) {
      toast.error("Error fetching clients:")
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [totalClients, activeClients]);

  return (
    <div className={styles.dashboardLayout}>
      <Sidebar />

      <main className={styles.dashboardContent}>
        <header className={styles.dashboardHeader}>
          <h1><FontAwesomeIcon icon={faChartLine} /> Dashboard</h1>
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
                <Bar dataKey="Successful" fill="#033670ff" />
                <Bar dataKey="Pending" fill="#1c599fff" />
                <Bar dataKey="Failed" fill="#5296e4ff" />
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
          <ul>
            <li>
              <FontAwesomeIcon icon={faFile} />
              New document uploaded by Client A
            </li>
            <li>
              <FontAwesomeIcon icon={faBell} />
              VAT return deadline approaching for Client B
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

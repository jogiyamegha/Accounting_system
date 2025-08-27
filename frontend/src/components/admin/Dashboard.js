import Sidebar from "../Sidebar";
import { useNavigate } from "react-router-dom";
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

import styles from "../../styles/adminDashboard.module.css";  // ✅ Import module CSS
import { ADMIN_END_POINT } from "../../utils/constants";

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
  const navigate = useNavigate();
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
          <h1>Dashboard</h1>
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
                <Bar dataKey="Successful" fill="#4caf50" />
                <Bar dataKey="Pending" fill="#ff9800" />
                <Bar dataKey="Failed" fill="#f44336" />
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
            <li>📄 New document uploaded by Client A</li>
            <li>⚠️ VAT return deadline approaching for Client B</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

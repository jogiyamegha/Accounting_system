import Sidebar from "../Sidebar";

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

import "../../styles/adminDashboard.css";

// Sample data for chart

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
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
        </header>

        {/* Stats Cards */}
        <section className="dashboard-cards">
          <div className="card">
            <h3>Total Registered Clients</h3>
            <p>1,245</p>
          </div>
          <div className="card">
            <h3>Active Clients</h3>
            <p>980</p>
          </div>
        </section>

        {/* Charts and Tables */}
        <div className="dashboard-grid">
          {/* Document Upload Chart */}
          <div className="dashboard-chart card">
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
          <div className="dashboard-table card">
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
        <section className="dashboard-notifications card">
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

// src/pages/admin/Dashboard.jsx
import Sidebar from "../../components/Sidebar";
import "../../styles/adminDashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Manage your system efficiently</p>
        </header>

        <section className="dashboard-cards">
          <div className="card">
            <h3>Total Clients</h3>
            <p>120</p>
          </div>
          <div className="card">
            <h3>Documents Pending</h3>
            <p>45</p>
          </div>
          <div className="card">
            <h3>Approved Documents</h3>
            <p>300</p>
          </div>
          <div className="card">
            <h3>Revenue</h3>
            <p>$50,000</p>
          </div>
        </section>

        <section className="dashboard-table">
          <h2>Recent Activities</h2>
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Document</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Amit Sharma</td>
                <td>GST Filing</td>
                <td>Pending</td>
                <td>18 Aug 2025</td>
              </tr>
              <tr>
                <td>Neha Patel</td>
                <td>Income Tax</td>
                <td>Approved</td>
                <td>17 Aug 2025</td>
              </tr>
              <tr>
                <td>Rahul Verma</td>
                <td>Balance Sheet</td>
                <td>Rejected</td>
                <td>15 Aug 2025</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

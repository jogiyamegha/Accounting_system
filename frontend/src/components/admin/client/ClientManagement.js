import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import Sidebar from "../../Sidebar";

import "../../../styles/clientManagement.css";

import { ADMIN_END_POINT } from "../../../utils/constants";

export default function ClientManagement() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [totalClients, setTotalClients] = useState(0);

  // Pagination

  const [page, setPage] = useState(1);

  const limit = 10; // clients per page

  const fetchClients = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        searchTerm: search,

        limit,

        skip: (page - 1) * limit,

        needCount: true, // get total clients from backend
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
      console.log("2",data)

      setClients(data.records || []);

      setTotalClients(data.total || 0);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [page, search]);

  const handleAddClient = () => {
    navigate("/admin/add-client");
  };

   const handleView = (clientId) => {
    navigate(`/admin/client-detail/${clientId}`);
  };
 

  const handleEdit = (id) => {
    navigate(`/admin/edit-client/${id}`);
  };

  const handleDelete = async (clientId) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await fetch(`${ADMIN_END_POINT}/delete-client/${clientId}`, { method: "DELETE" });

        navigate('/admin/client-management')
        fetchClients(); // refresh list
      } catch (error) {
        console.error("Failed to delete client:", error);
      }
    }
  };

  const handleGenerateInvoice = async (clientId) => {
    navigate(`/admin/generate-invoice/${clientId}`);
  }

  // Pagination helpers

  const totalPages = Math.ceil(totalClients / limit);

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;

    setPage(p);
  };

  return (
    <div className="client-management-layout">
      <Sidebar />

      <main className="client-management-content">
        <header className="client-management-header">
          <h1>Client Management</h1>
          <button className="add-client-btn" onClick={handleAddClient}>
            + Add Client
          </button>
        </header>

        <div className="client-search">
          <input
            type="text"
            placeholder="Search by client name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <section className="client-table-section">
          {loading ? (
            <p>Loading clients...</p>
          ) : clients.length === 0 ? (
            <p className="no-data">No clients found.</p>
          ) : (
            <>
              <p>Total Clients: {totalClients}</p>
              <table className="client-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client._id}>
                      <td>{client.name}</td>
                      <td>{client.email}</td>
                      <td>{client.contact.phone}</td>
                      <td className="client-actions">
                        <button onClick={() => handleView(client._id)}>
                          View
                        </button>
                        <button onClick={() => handleEdit(client._id)}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(client._id)}>
                          Delete
                        </button>
                        <button onClick={() => handleGenerateInvoice(client._id)}>
                          Generate Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="pagination">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={page === i + 1 ? "active-page" : ""}
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

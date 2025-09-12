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
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";

const serviceStatusNumberToString = {
  1: "not Started",
  2: "in Progress",
  3: "completed",
};

// convert number status → string
// const getStatusKey = (statusValue) => {
//   if (statusValue === 1) return "not Started";
//   if (statusValue === 2) return "in Progress";
//   if (statusValue === 3) return "completed";
//   return "";
// };

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB");
};

export default function DynamicService() {
  const { id } = useParams();
  const [clients, setClients] = useState([]);
  const [serviceName, setServiceName] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // NEW: sort state
  const navigate = useNavigate();
  const [statusUpdates, setStatusUpdates] = useState({});
  const [totalClients, setTotalClients] = useState(0);

  // At the top of your component
  const [showAssignStaffModal, setShowAssignStaffModal] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [currentServiceClient, setCurrentServiceClient] = useState(null); // store service+client info

  const [page, setPage] = useState(1);
  const limit = 10;

  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleMenu = (serviceId) => {
    setOpenMenuId(openMenuId === serviceId ? null : serviceId);
  };

  const getServiceName = async () => {
    try {
      const res = await fetch(`${ADMIN_END_POINT}/service-name/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        let errorData = await res.json();
        toast.error(errorData.error || "Failed to fetch service name");
        return;
      }

      const data = await res.json();
      return data.name;
    } catch (error) {
      console.log(error);
    }
  };

  const getServiceNameAndSet = async () => {
    const name = await getServiceName();
    if (name) setServiceName(name);
  };

  const fetchServiceAndClients = async () => {
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
    if (id) {
      fetchServiceAndClients();
      getServiceNameAndSet();
    }
  }, [page, id]);

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
      await fetchServiceAndClients();
    } catch (error) {
      console.error("Error renew service:", error);
      toast.error("Error occurred while renewing service");
    }
  };

  const handleStatusChangeUpdate = async (serviceId, clientId, newStatus) => {
    try {
      console.log("newStatus", newStatus);
      if (!newStatus) {
        toast.warning("Please select a status before updating.");
        return;
      }

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

  const assignStaff = () => {
    alert("Heyy");
  };

  const manageDocument = () => {
    alert("Heyy");
  };

  const goToClientDetails = (clientId) => {
    navigate(`/admin/client-service-detail/${clientId}`);
  };

  // NEW: Helper to sort services by end date
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
        </div>

        {/* 🔎 Filters + Sort */}
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
            {/* NEW: Sort by End Date */}
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
                          const formattedServiceEndDate = new Date(
                            service.endDate
                          )
                            .toISOString()
                            .split("T")[0];
                          matchesEndDate =
                            formattedServiceEndDate === endDateFilter;
                        }

                        return matchesStatus && matchesEndDate;
                      })
                      .map((service, idx) => {
                        const currentStatus = Number(
                          statusUpdates[service._id] ?? service.serviceStatus
                        );

                        // console.log("first", currentStatus);

                        return (
                          <tr
                            key={`${client._id}-${idx}`}
                            className={styles.tableRow}
                            onClick={() => goToClientDetails(client._id)}
                            style={{
                              cursor: "pointer",
                            }}
                          >
                            <td>{client.name}</td>
                            <td>{client.email}</td>
                            <td>{formatDate(service.serviceStartDate)}</td>
                            <td>{formatDate(service.endDate)}</td>
                            <td>
                              <select
                                className={`${styles.statusButton} ${
                                  currentStatus === ServiceStatus.inProgress
                                    ? styles.statusPending
                                    : currentStatus === ServiceStatus.completed
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
                                  const selectedValue = Number(e.target.value);

                                  setStatusUpdates((prev) => ({
                                    ...prev,
                                    [service._id]: selectedValue,
                                  }));

                                  // your existing handler
                                  handleStatusChangeUpdate(
                                    service._id,
                                    client._id,
                                    selectedValue
                                  );
                                }}
                              >
                                {Object.keys(ServiceStatus).map((key) => (
                                  <option key={key} value={ServiceStatus[key]}>
                                    {key}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td  ><p style={{textAlign: "center"}}>NA</p></td>

                            <td
                              className={styles.actions}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {service.serviceStatus === 3 && (
                                <button
                                  className={styles.uploadBtn4}
                                  onClick={() =>
                                    renewService(
                                      service.serviceId?._id ||
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
                                      service.serviceId?._id ||
                                        service.serviceId,
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
                                  <FontAwesomeIcon icon={faEllipsisH} />
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
                                      manageDocument(
                                        service.serviceId?._id ||
                                          service.serviceId,
                                        client._id
                                      );
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

        {showAssignStaffModal && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <h2>Assign Staff</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // call your assignStaff here
          assignStaff(
            currentServiceClient.serviceId,
            currentServiceClient.clientId,
            { name: staffName, email: staffEmail }
          );
          // close modal
          setShowAssignStaffModal(false);
          setStaffName("");
          setStaffEmail("");
        }}
      >
        <label>
          Staff Name:
          <input
            type="text"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            required
          />
        </label>

        <label>
          Staff Email:
          <input
            type="email"
            value={staffEmail}
            onChange={(e) => setStaffEmail(e.target.value)}
            required
          />
        </label>

        <div className={styles.modalActions}>
          <button type="submit" className={styles.submitBtn}>
            Assign
          </button>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => setShowAssignStaffModal(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}


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

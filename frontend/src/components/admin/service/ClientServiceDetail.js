import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ADMIN_END_POINT } from "../../../utils/constants";
import { toast } from "react-toastify";
import styles from "../../../styles/clientServiceDetail.module.css";
import loaderStyles from "../../../styles/loader.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faClipboardList,
  faUserCircle,
  faArrowLeft,
  faXmark
} from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../../Sidebar";

export default function ClientServiceDetail() {
  const { clientId } = useParams();
  const [error, setError] = useState("");
  const [clientInfomation, setClientInformation] = useState("");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const recordsPerPage = 5;

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    serviceStartDate: "",
    endDate: "",
    serviceStatusChangeDate: "",
  });

  const fetchClientServiceDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${ADMIN_END_POINT}/client-service-detail/${clientId}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        let errorData = await res.json();
        toast.error(errorData.error || "Failed to fetch client service detail");
        setClientInformation("");
        setServices([]);
        return;
      }

      const result = await res.json();
      console.log("first", result);
      setClientInformation(result.clientInfo);
      setServices(result.serviceArray);
    } catch (err) {
      setError(err.message);
      setClientInformation("");
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingId(service._id);
    setEditData({
      serviceStartDate: service.serviceStartDate || "",
      endDate: service.endDate || "",
      serviceStatusChangeDate: service.serviceStatusChangeDate || "",
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIsEditing(false);
    setEditData({
      serviceStartDate: "",
      endDate: "",
      serviceStatusChangeDate: "",
    });
  };

  const handleSaveEdit = async () => {
    const original = services.find((s) => s._id === editingId);
    const updatedFields = {};

    if (
      editData.serviceStartDate &&
      editData.serviceStartDate !== original.serviceStartDate
    ) {
      updatedFields.serviceStartDate = editData.serviceStartDate;
    }
    if (editData.endDate && editData.endDate !== original.endDate) {
      updatedFields.endDate = editData.endDate;
    }
    if (
      editData.serviceStatusChangeDate &&
      editData.serviceStatusChangeDate !== original.serviceStatusChangeDate
    ) {
      updatedFields.serviceStatusChangeDate = editData.serviceStatusChangeDate;
    }

    if (Object.keys(updatedFields).length === 0) {
      toast.info("No changes detected");
      handleCancelEdit();
      return;
    }

    try {
      const res = await fetch(
        `${ADMIN_END_POINT}/edit-client-service-detail/${clientId}/${editingId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updatedFields),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to edit service details");
        return;
      }

      toast.success("Service updated successfully");
      setServices((prev) =>
        prev.map((s) => (s._id === editingId ? { ...s, ...updatedFields } : s))
      );
      handleCancelEdit();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm("Are you sure you want to de-assign this service?"))
      return;

    try {
      const res = await fetch(
        `${ADMIN_END_POINT}/client-service-de-assign/${serviceId}/${clientId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete service");
        return;
      }

      toast.success("Service deleted successfully!");
      setServices((prev) =>
        prev.map((s) =>
          s._id === serviceId
            ? { ...s, deleted: true, deassignDate: new Date().toISOString() }
            : s
        )
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchClientServiceDetails();
  }, [clientId]);

  if (loading)
    return (
      <div className={loaderStyles.dotLoaderWrapper}>
        <div className={loaderStyles.dotLoader}></div>
      </div>
    );
  if (error) return toast.error(error);

  const totalPages = Math.ceil(services.length / recordsPerPage);

  // Function to navigate to a specific page
  const goToPage = (pageNumber) => {
    if (pageNumber < 1) return; // prevent going before first page
    if (pageNumber > totalPages) return; // prevent going beyond last page
    setPage(pageNumber);
  };
  return (
    <div className={styles.mainContainer}>
      <Sidebar />

      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>
            <FontAwesomeIcon icon={faClipboardList} />
            Client Service Details
          </h1>

          <div className={styles.clientInfoRight}>
            <FontAwesomeIcon
              icon={faUserCircle}
              className={styles.profileIcon}
            />
            <a
              href={`/admin/client-detail/${clientId}`}
              className={styles.profileName}
            >
              {clientInfomation.name}
            </a>
            <a
              href={`/admin/client-detail/${clientId}`}
              className={styles.profileEmail}
            >
              {clientInfomation.email}
            </a>
          </div>
        </div>

        {/* <div className={styles.tagSection}>
          <ul>
            <li className={`${styles.tags} ${styles.deleted}`}>
              <span className={styles.dot}></span> Deleted
            </li>
            <li className={`${styles.tags} ${styles.notStarted}`}>
              <span className={styles.dot}></span> Not Started
            </li>
            <li className={`${styles.tags} ${styles.inProgress}`}>
              <span className={styles.dot}></span> In Progress
            </li>
            <li className={`${styles.tags} ${styles.completed}`}>
              <span className={styles.dot}></span> Completed
            </li>
          </ul>
        </div> */}

        {/* SERVICES LIST */}
        <div className={styles.servicesList}>
          {services.length > 0 ? (
            <>
              <table className={styles.servicesTable}>
                <thead>
                  <tr>
                    <th></th> {/* color tag column */}
                    <th>Service</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Start → End</th>
                    <th>Status Changed Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services
                    .slice((page - 1) * recordsPerPage, page * recordsPerPage)
                    .map((service) => {
                      const isCurrentEditing =
                        isEditing && editingId === service._id;

                      const rowStatusClass = service.deleted
                        ? styles.deletedRow
                        : service.serviceStatus === 1
                        ? styles.notStartedRow
                        : service.serviceStatus === 2
                        ? styles.inProgressRow
                        : styles.completedRow;

                      const colorTagClass = service.deleted
                        ? styles.deletedTag
                        : service.serviceStatus === 1
                        ? styles.notStartedTag
                        : service.serviceStatus === 2
                        ? styles.inProgressTag
                        : styles.completedTag;

                      return (
                        <tr
                          key={service._id}
                          className={`${styles.serviceRow} ${rowStatusClass}`}
                        >
                          {/* Color Tag */}
                          <td className={styles.colorTagCell}>
                            <span
                              className={`${styles.colorTag} ${colorTagClass}`}
                            />
                          </td>

                          {/* SERVICE NAME */}
                          <td className={styles.serviceNameCell}>
                            <div className={styles.serviceName}>
                              {service.serviceName}
                            </div>
                          </td>

                          {/* STATUS BADGE */}
                          <td>
                            <span
                              className={`${styles.statusBadge} ${
                                service.deleted
                                  ? styles.deleted
                                  : service.serviceStatus === 1
                                  ? styles.notStarted
                                  : service.serviceStatus === 2
                                  ? styles.inProgress
                                  : service.serviceStatus === 3
                                  ? styles.completed
                                  : ""
                              }`}
                            >
                              {service.deleted
                                ? "Deleted"
                                : service.serviceStatus === 1
                                ? "Not Started"
                                : service.serviceStatus === 2
                                ? "In Progress"
                                : service.serviceStatus === 3
                                ? "Completed"
                                : ""}
                            </span>
                          </td>

                          {/* DURATION */}
                          <td>
                            {service.serviceDuration} days
                            {service.updatedServiceDuration &&
                              !service.deleted && (
                                <div className={styles.infoText}>
                                  + {service.updatedServiceDuration} days
                                  extended
                                </div>
                              )}
                          </td>

                          {/* START & END DATES */}
                          <td>
                            {isCurrentEditing ? (
                              <div className={styles.editDates}>
                                <input
                                  type="date"
                                  min={new Date().toISOString().split("T")[0]}
                                  value={editData.serviceStartDate}
                                  onChange={(e) =>
                                    setEditData((prev) => ({
                                      ...prev,
                                      serviceStartDate: e.target.value,
                                    }))
                                  }
                                  className={styles.dateInput}
                                />
                                <span className={styles.arrow}>→</span>
                                <input
                                  type="date"
                                  value={editData.endDate}
                                  onChange={(e) =>
                                    setEditData((prev) => ({
                                      ...prev,
                                      endDate: e.target.value,
                                    }))
                                  }
                                  className={styles.dateInput}
                                />
                              </div>
                            ) : (
                              <div>
                                {service.serviceStartDate
                                  ? new Date(
                                      service.serviceStartDate
                                    ).toLocaleDateString("en-GB")
                                  : "-"}
                                <span className={styles.arrow}> → </span>
                                {service.endDate
                                  ? new Date(
                                      service.endDate
                                    ).toLocaleDateString("en-GB")
                                  : "-"}
                              </div>
                            )}
                          </td>

                          <td>
                            <div className={styles.infoText}>
                              {service.serviceStatusChangeDate ? (
                                new Date(
                                  service.serviceStatusChangeDate
                                ).toLocaleDateString("en-GB")
                              ) : (
                                <p>NA</p>
                              )}
                            </div>
                          </td>

                          {/* ACTION BUTTONS */}
                          <td>
                            {service.deleted ? (
                              <p className={styles.infoText}>NA</p>
                            ) : isCurrentEditing ? (
                              <div className={styles.actionRow}>
                                <button
                                  className={styles.saveBtn}
                                  onClick={handleSaveEdit}
                                >
                                  <FontAwesomeIcon icon={faSave} /> Save
                                </button>
                                <button
                                  className={styles.cancelBtn}
                                  onClick={handleCancelEdit}
                                >
                                  <FontAwesomeIcon icon={faTimes} /> Cancel
                                </button>
                              </div>
                            ) : (
                              <div className={styles.actions}>
                                <button
                                  className={styles.editBtn}
                                  onClick={() => handleEdit(service)}
                                >
                                  <FontAwesomeIcon icon={faEdit} /> Edit
                                </button>
                                {service.serviceStatus !== 3 && (
                                  <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDelete(service._id)}
                                  >
                                    <FontAwesomeIcon icon={faXmark}/>{" "}
                                    Deassign
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
          ) : (
            <p>No services found.</p>
          )}
        </div>
      </div>
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
  );
}

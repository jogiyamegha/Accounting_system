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
} from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../../Sidebar";

export default function ClientServiceDetail() {
  const { clientId } = useParams();
  const [error, setError] = useState("");
  const [clientInfomation, setClientInformation] = useState("");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className={styles.mainContainer}>
      <Sidebar />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>
            {" "}
            <FontAwesomeIcon icon={faClipboardList} />
            Client Service Details
          </h1>
          <div className={styles.clientInfoRight}>
            <p className={styles.profileName}>{clientInfomation.name}</p>
            <p className={styles.profileEmail}>{clientInfomation.email}</p>
          </div>
        </div>

        {/* <div className={styles.clientInfo}>
          <div className={styles.profileLeft}>
            <FontAwesomeIcon
              icon={faUserCircle}
              className={styles.profileIcon}
            />
            <div>
              <h2 className={styles.profileName}>{clientInfomation.name}</h2>
              <div className={styles.infoRow}>
                <span className={styles.infoValue}>{clientInfomation.email}</span>
              </div>
            </div>
          </div>
        </div> */}

        <div className={styles.servicesList}>
          {services.length > 0 ? (
            services.map((service) => {
              const isCurrentEditing = isEditing && editingId === service._id;
              const statusClass =
                service.serviceStatus === 1
                  ? styles.cardNotStarted
                  : service.serviceStatus === 2
                  ? styles.cardInProgress
                  : styles.cardCompleted;

              return (
                <div
                  key={service._id}
                  className={`${styles.serviceCard} ${statusClass} ${
                    service.deleted ? styles.deletedCard : ""
                  }`}
                >
                  <div className={styles.topRow}>
                    <div className={styles.leftSide}>
                      <span className={styles.serviceName}>
                        {service.serviceName} [Duration:{" "}
                        {service.serviceDuration} days]
                      </span>
                      {!service.deleted && (
                        <span
                          className={`${styles.statusBadge} ${
                            service.serviceStatus === 1
                              ? styles.notStarted
                              : service.serviceStatus === 2
                              ? styles.inProgress
                              : styles.completed
                          }`}
                        >
                          {service.serviceStatus === 1
                            ? "not started"
                            : service.serviceStatus === 2
                            ? "in progress"
                            : "completed"}
                        </span>
                      )}
                    </div>

                    {/* Show edit/delete buttons only when not deleted & not editing */}
                    {!isCurrentEditing && !service.deleted && (
                      <>
                        <button
                          className={styles.editBtn}
                          onClick={() => handleEdit(service)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(service._id)}
                        >
                          <i class="fa-solid fa-circle-xmark"></i> deAssign
                        </button>
                      </>
                    )}
                  </div>

                  <div className={styles.dateRow}>
                    {!service.deleted && service.updatedServiceDuration ? (
                      <span>
                        Please note that your service duration is extended{" "}
                        {service.updatedServiceDuration} days by admin.
                      </span>
                    ) : (
                      ""
                    )}
                  </div>

                  {/* Replace static text with inputs when editing */}
                  <div className={styles.dateRow}>
                    {isCurrentEditing ? (
                      <>
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
                        />
                      </>
                    ) : (
                      <>
                        <span>
                          {service.serviceStartDate
                            ? new Date(
                                service.serviceStartDate
                              ).toLocaleDateString("en-GB")
                            : "-"}
                        </span>
                        <span className={styles.arrow}>→</span>
                        <span>
                          {service.endDate
                            ? new Date(service.endDate).toLocaleDateString(
                                "en-GB"
                              )
                            : "-"}
                        </span>
                      </>
                    )}
                  </div>

                  {isCurrentEditing && service.serviceStatusChangeDate && (
                    <input
                      type="date"
                      value={editData.serviceStatusChangeDate}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          serviceStatusChangeDate: e.target.value,
                        }))
                      }
                    />
                  )}

                  {isCurrentEditing && (
                    <div className={styles.actionRow}>
                      <button
                        className={styles.saveBtn}
                        onClick={handleSaveEdit}
                      >
                        <FontAwesomeIcon icon={faSave} /> Save
                      </button>
                      <button
                        className={styles.cancleBtn}
                        onClick={handleCancelEdit}
                      >
                        <FontAwesomeIcon icon={faTimes} /> Cancel
                      </button>
                    </div>
                  )}

                  {!isCurrentEditing && service.serviceStatusChangeDate && (
                    <div className={styles.bottomRow}>
                      <span className={styles.statusText}>
                        Status changed on:{" "}
                        {new Date(
                          service.serviceStatusChangeDate
                        ).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  )}

                  {!isCurrentEditing && service.deassignDate && (
                    <div className={styles.bottomRow}>
                      <span className={styles.statusText}>
                        Service de-assigned on:{" "}
                        {new Date(service.deassignDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p>No services found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

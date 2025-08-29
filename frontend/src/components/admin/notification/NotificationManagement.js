import { useEffect, useState } from "react";
import classes from "../../../styles/notificationManagement.module.css";
import {
  ADMIN_END_POINT,
  notificationTypeLabels,
} from "../../../utils/constants";
import Sidebar from "../../Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faClock } from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    email: "",
    type: "",
    message: "",
    expiresAt: "",
  });

  // Fetch all client notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${ADMIN_END_POINT}/notification-management`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        // console.log("first", data)
        setNotifications(data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();
  }, []);

  const handleChange = (e) => {
    setNewNotification({
      ...newNotification,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${ADMIN_END_POINT}/notification-management`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNotification),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to send notification");
      const saved = await res.json();

      setNotifications([saved, ...notifications]); // prepend latest
      setNewNotification({ email: "", type: "", message: "", expiresAt: "" });
      setShowForm(false);
    } catch (err) {
      console.error("Error sending notification:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      // optimistic update in UI
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );

      console.log("1", id);
      const res = await fetch(
        `${ADMIN_END_POINT}/notification-mark-as-read/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      console.log(res);

      if (!res.ok) {
        throw new Error("Failed to mark notification as read");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={classes.pageWrapper}>
      <Sidebar />
      <div className={classes.mainContent}>
        <h1 className={classes.pageTitle}>
          <FontAwesomeIcon icon={faBell} /> Notification Management
        </h1>

        {/* General Notifications Section */}
        <div className={classes.card}>
          <h2 className={classes.cardTitle}>General Notifications</h2>
          <ul className={classes.notificationList}>
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <li
                  key={n._id}
                  className={`${classes.notificationItem} ${
                    n.read ? classes.read : ""
                  }`}
                >
                  <div>
                    <p className={classes.notifMessage}>{n.message}</p>
                    <small className={classes.notifMeta}>
                      {notificationTypeLabels[n.notificationType]}{" "}
                      <FontAwesomeIcon icon={faClock} />{" "}
                      {format(new Date(n.expiresAt), "dd-MM-yyyy ,  HH:mm:ss")}
                    </small>
                  </div>
                  {!n.read && (
                    <button
                      className={classes.markReadBtn}
                      onClick={() => markAsRead(n._id)}
                    >
                      Mark as Read
                    </button>
                  )}
                </li>
              ))
            ) : (
              <p className={classes.noNotif}>No notifications found</p>
            )}
          </ul>
        </div>

        {/* Send Notification Section */}
        <div className={classes.card}>
          <h2 className={classes.cardTitle}>Send Notification</h2>
          <form onSubmit={handleSubmit} className={classes.notificationForm}>
            <input
              type="email"
              name="email"
              placeholder="Client Email"
              value={newNotification.email}
              onChange={handleChange}
              required
            />
            <select
              name="type"
              value={newNotification.type}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              <option value="UpComing Deadline">UpComing Deadline</option>
              <option value="Payroll Alert">Payroll Alert</option>
              <option value="Missing Document">Missing Document</option>
              <option value="Feedback">Feedback</option>
              <option value="Document Status">Document Status</option>
              <option value="Client Active Status">Client Active Status</option>
              <option value="System Update">System Update</option>
            </select>
            <textarea
              name="message"
              placeholder="Notification Message"
              value={newNotification.message}
              onChange={handleChange}
              required
            />
            <label>Expires At: </label>
            <input
              type="date"
              name="expiresAt"
              value={newNotification.expiresAt}
              onChange={handleChange}
              required
            />
            <button type="submit" className={classes.notifyBtn}>
              Notify
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

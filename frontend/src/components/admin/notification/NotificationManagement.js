import { useEffect, useState } from "react";
import classes from "../../../styles/notificationManagement.module.css";
import { ADMIN_END_POINT } from "../../../utils/constants";

export default function NotificationManagement() {
    const [notifications, setNotifications] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newNotification, setNewNotification] = useState({
        email: "",
        type: "",
        message: "",
        expiresAt: "",
    });

//   Fetch all client notifications
    useEffect(() => {
        const fetchNotifications = async () => {
        try {
            const res = await fetch(`${ADMIN_END_POINT}/notification-management`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials : "include"
                }
            );
            const data = await res.json();
            console.log(data);
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
        console.log("object",newNotification);
        e.preventDefault();
        try {
        const res = await fetch(`${ADMIN_END_POINT}/notification-management`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newNotification),
        });

        if (!res.ok) throw new Error("Failed to send notification");
        const saved = await res.json();

        setNotifications([...notifications, saved]); // update list immediately
        setNewNotification({ email: "", type: "", message: "", expiresAt: "" });
        setShowForm(false);
        } catch (err) {
        console.error("Error sending notification:", err);
        }
    };

    return (
        <div className={classes.addClientContainer}>

        <div className={classes.addClientForm}>
            <h2>General Notifications</h2>
            <ul className={classes.notificationList}>
            {notifications.length > 0 ? (
                notifications.map((n) => (
                <li key={n._id} className={classes.notificationItem}>
                    <strong>{n.type}</strong> - {n.message} <br />
                    <small>
                    From: {n.email} | Expires:{" "}
                    {new Date(n.expiresAt).toLocaleDateString()}
                    </small>
                </li>
                ))
            ) : (
                <p>No notifications found</p>
            )}
            </ul>

            <button
            type="button"
            className={classes.addBtn}
            onClick={() => setShowForm(!showForm)}
            >
            {showForm ? "Cancel" : "Send Notification"}
            </button>

            {showForm && (
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
                <option value="General">General</option>
                <option value="VAT Filing">VAT Filing</option>
                <option value="Payroll Reminder">Payroll Reminder</option>
                <option value="System Update">System Update</option>
                </select>
                <textarea
                name="message"
                placeholder="Notification Message"
                value={newNotification.message}
                onChange={handleChange}
                required
                />
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
            )}
        </div>
        </div>
    );
}

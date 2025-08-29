
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ADMIN_END_POINT } from "../../../utils/constants";
import classes from "../../../styles/dynamicService.module.css";

export default function DynamicService() {
    const { serviceType } = useParams();   // 🔹 dynamic param from URL
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
        try {
            const res = await fetch(
            `${ADMIN_END_POINT}/service/${serviceType}`, // 🔹 dynamic API call
            {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            }
            );
            if (!res.ok) {
            throw new Error("Failed to fetch clients");
            }
            const data = await res.json();
            setClients(data);
        } catch (err) {
            console.error("Error fetching clients:", err);
        } finally {
            setLoading(false);
        }
    };

    fetchClients();
  }, [serviceType]);

  if (loading) return <p>Loading...</p>;
  if (clients.length === 0) return <p>No clients have applied for this service.</p>;

  return (
    <div className={classes.pageWrapper}>
      <div className={classes.mainContent}>
        <h1 className={classes.pageTitle}>
          {`Service Management - Type ${serviceType}`}
        </h1>

        <div className={classes.card}>
          <h2 className={classes.cardTitle}>Clients Applied</h2>
          <ul className={classes.clientList}>
            {clients.map((client) =>
              client.services
                .filter((s) => s.serviceType === Number(serviceType)) // 🔹 dynamic filtering
                .map((service, idx) => (
                  <li key={`${client._id}-${idx}`} className={classes.clientItem}>
                    <div>
                      <p className={classes.clientName}>
                        {client.clientDetail.clientName}
                      </p>
                      <p className={classes.clientEmail}>
                        {client.clientDetail.clientEmail}
                      </p>
                      <small className={classes.clientMeta}>
                        Start:{" "}
                        {service.serviceStartDate
                          ? new Date(service.serviceStartDate).toLocaleDateString()
                          : "-"}
                        {" | "}
                        End:{" "}
                        {service.serviceEndDate
                          ? new Date(service.serviceEndDate).toLocaleDateString()
                          : "-"}
                      </small>
                    </div>
                  </li>
                ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );

  
}

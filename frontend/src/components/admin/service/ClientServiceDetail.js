import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ADMIN_END_POINT } from "../../../utils/constants";
import { toast } from "react-toastify";
import styles from "../../../styles/clientServiceDetail.module.css";
import Sidebar from "../../Sidebar";

export default function ClientServiceDetail() {
    const { clientId } = useParams();
    const [error, setError] = useState("");
    const [clientInfomation, setClientInformation] = useState("")
    const [services, setServices] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchClientServiceDetails = async () => {
        try {
            const res = await fetch(`${ADMIN_END_POINT}/client-service-detail/${clientId}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                let errorData = await res.json();
                toast.error(errorData.error || "Failed to fetch client service detail");
                return;
            }

            const result = await res.json();
            setClientInformation(result.clientInfo);
            setServices(result.serviceArray);

            console.log(result.serviceArray);
            console.log("client info", clientInfomation);
            console.log("serviceInfo", services);
            console.log(services.serviceStatus);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientServiceDetails();
    }, [clientId]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className={styles.error}>{error}</p>;

    // const clientInfo = services.length > 0 ? services[0].client : null;

    return (
        <div className={styles.container}>
            {/* <Sidebar /> */}
            <div className={styles.content}>
                {/* Client Info */}
                { (
                    <div className={styles.clientCard}>
                        <h2 className={styles.clientTitle}>Client Info</h2>
                        <p><strong>Name:</strong> {clientInfomation.name}</p>
                        <p><strong>Email:</strong> {clientInfomation.email}</p>
                    </div>
                )}

                {/* Services */}
                <h3 className={styles.sectionTitle}>Services</h3>
                <div className={styles.servicesGrid}>
                    {services.length > 0 ? (
                        services.map((service) => (
                            <div key={service._id} className={styles.serviceCard}>
                                <h4 className={styles.serviceName}>{service.name}</h4>
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
                                        ? "Not Started"
                                        : service.serviceStatus === 2
                                        ? "In Progress"
                                        : "Completed"}
                                </span>


                                <p><strong>Start Date:</strong>{" "}
                                    {service.serviceStartDate
                                        ? new Date(service.serviceStartDate).toLocaleDateString()
                                        : "-"}
                                </p>
                                <p><strong>End Date:</strong>{" "}
                                    {service.endDate
                                        ? new Date(service.endDate).toLocaleDateString()
                                        : "-"}
                                </p>
                                <p><strong>Service Status:</strong> {service.serviceStatus}</p>
                                {service.serviceStatusChangeDate ?
                                    <p>service status change date : {service.serviceStatusChangeDate
                                            ?
                                            new Date(service.serviceStatusChangeDate).toLocaleDateString()
                                            : "-"
                                        }
                                    </p>
                                    :
                                    ""
                                }
                            </div>
                        ))
                    ) : (
                        <p>No services found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// import { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { ADMIN_END_POINT } from "../../../utils/constants";
// import { toast } from "react-toastify";
// import styles from "../../../styles/clientServiceDetail.module.css";

// export default function ClientServiceDetail() {
//     const { clientId } = useParams();
//     const [error, setError] = useState("");
//     const [clientInfomation, setClientInformation] = useState("");
//     const [services, setServices] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const fetchClientServiceDetails = async () => {
//         try {
//             const res = await fetch(`${ADMIN_END_POINT}/client-service-detail/${clientId}`, {
//                 method: "GET",
//                 credentials: "include",
//                 headers: { "Content-Type": "application/json" },
//             });

//             if (!res.ok) {
//                 let errorData = await res.json();
//                 toast.error(errorData.error || "Failed to fetch client service detail");
//                 return;
//             }

//             const result = await res.json();
//             console.log(result);
//             setClientInformation(result.clientInfo);
//             setServices(result.serviceArray);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchClientServiceDetails();
//     }, [clientId]);

//     if (loading) return <p className={styles.loading}>Loading...</p>;
//     if (error) return <p className={styles.error}>{error}</p>;

//     return (
//         <div className={styles.container}>
//             <div className={styles.header}>
//                 <h2>Client Service Details</h2>
//                 <div className={styles.clientInfo}>
//                     <p><strong>Name:</strong> {clientInfomation.name}</p>
//                     <p><strong>Email:</strong> {clientInfomation.email}</p>
//                 </div>
//             </div>
//             <div className={styles.servicesList}>
//                 {services.length > 0 ? (
//                     services.map((service) => (
//                         <div key={service._id} className={styles.serviceCard}>
//                             {/* Top Row: Service Name + Status */}
//                             <div className={styles.topRow}>
//                                 <span className={styles.serviceName}>{service.serviceName}</span>
//                                 <span
//                                     className={`${styles.statusBadge} ${
//                                         service.serviceStatus === 1
//                                             ? styles.notStarted
//                                             : service.serviceStatus === 2
//                                             ? styles.inProgress
//                                             : styles.completed
//                                     }`}
//                                 >
//                                     {service.serviceStatus === 1
//                                         ? "not started"
//                                         : service.serviceStatus === 2
//                                         ? "in progress"
//                                         : "completed"}
//                                 </span>
//                             </div>
//                             <div><h1>{service.deleted}</h1></div>

//                             {/* Date row */}
//                             <div className={styles.dateRow}>
//                                 <span>{service.serviceStartDate ? new Date(service.serviceStartDate).toLocaleDateString() : "-"}</span>
//                                 <span className={styles.arrow}>→</span>
//                                 <span>{service.endDate ? new Date(service.endDate).toLocaleDateString() : "-"}</span>
//                             </div>

//                             {/* Bottom Row: Status + Buttons */}
//                             <div className={styles.bottomRow}>
//                                 <span className={styles.statusText}>
//                                     Status changed on: {service.serviceStatusChangeDate ? new Date(service.serviceStatusChangeDate).toLocaleDateString() : "-"}
//                                 </span>
//                                 <div className={styles.actions}>
//                                     <button className={styles.editBtn}>Edit</button>
//                                     <button className={styles.deleteBtn}>Delete</button>
//                                 </div>
//                             </div>
//                         </div>
//                     ))
//                 ) : (
//                     <p>No services found.</p>
//                 )}
//             </div>
//         </div>
//     );
// }


// import { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { ADMIN_END_POINT } from "../../../utils/constants";
// import { toast } from "react-toastify";
// import styles from "../../../styles/clientServiceDetail.module.css";

// export default function ClientServiceDetail() {
//     const { clientId } = useParams();
//     const [error, setError] = useState("");
//     const [clientInfomation, setClientInformation] = useState("");
//     const [services, setServices] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const fetchClientServiceDetails = async () => {
//         try {
//             const res = await fetch(`${ADMIN_END_POINT}/client-service-detail/${clientId}`, {
//                 method: "GET",
//                 credentials: "include",
//                 headers: { "Content-Type": "application/json" },
//             });

//             if (!res.ok) {
//                 let errorData = await res.json();
//                 toast.error(errorData.error || "Failed to fetch client service detail");
//                 return;
//             }

//             const result = await res.json();
//             console.log(result);
//             setClientInformation(result.clientInfo);
//             setServices(result.serviceArray);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchClientServiceDetails();
//     }, [clientId]);

//     if (loading) return <p className={styles.loading}>Loading...</p>;
//     if (error) return <p className={styles.error}>{error}</p>;

//     return (
//         <div className={styles.container}>
//             <div className={styles.header}>
//                 <h2>Client Service Details</h2>
//                 <div className={styles.clientInfo}>
//                     <p><strong>Name:</strong> {clientInfomation.name}</p>
//                     <p><strong>Email:</strong> {clientInfomation.email}</p>
//                 </div>
//             </div>

//             <div className={styles.servicesList}>
//                 {services.length > 0 ? (
//                     services.map((service) => (
//                         <div
//                             key={service._id}
//                             className={`${styles.serviceCard} ${service.deleted ? styles.deletedCard : ""}`}
//                         >
//                             {/* Top Row: Name + Status + Actions */}
//                             <div className={styles.topRow}>
//                                     <div className={styles.leftSide}>
//                                         <span className={styles.serviceName}>{service.serviceName}</span>
//                                         {!service.deleted && (
//                                         <span
//                                             className={`${styles.statusBadge} ${
//                                                 service.serviceStatus === 1
//                                                     ? styles.notStarted
//                                                     : service.serviceStatus === 2
//                                                     ? styles.inProgress
//                                                     : styles.completed
//                                             }`}
//                                         >
//                                             {service.serviceStatus === 1
//                                                 ? "not started"
//                                                 : service.serviceStatus === 2
//                                                 ? "in progress"
//                                                 : "completed"}
//                                         </span>
//                                     )}
//                                     </div>

//                                 {!service.deleted && (
//                                     <div className={styles.actions}>
//                                         <button className={styles.editBtn}>Edit</button>
//                                         <button className={styles.deleteBtn}>Delete</button>
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Date row */}
//                             <div className={styles.dateRow}>
//                                 <span>
//                                     {service.serviceStartDate
//                                         ? new Date(service.serviceStartDate).toLocaleDateString()
//                                         : "-"}
//                                 </span>
//                                 <span className={styles.arrow}>→</span>
//                                 <span>
//                                     {service.endDate
//                                         ? new Date(service.endDate).toLocaleDateString()
//                                         : "-"}
//                                 </span>
//                             </div>

//                             {/* Bottom Row: Status Change Info */}
//                             <div className={styles.bottomRow}>
//                                 <span className={styles.statusText}>
//                                     Status changed on:{" "}
//                                     {service.serviceStatusChangeDate
//                                         ? new Date(service.serviceStatusChangeDate).toLocaleDateString()
//                                         : "-"}
//                                 </span>
//                             </div>
//                         </div>
//                     ))
//                 ) : (
//                     <p>No services found.</p>
//                 )}
//             </div>
//         </div>
//     );
// }


import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ADMIN_END_POINT } from "../../../utils/constants";
import { toast } from "react-toastify";
import styles from "../../../styles/clientServiceDetail.module.css";

export default function ClientServiceDetail() {
    const { clientId } = useParams();
    const [error, setError] = useState("");
    const [clientInfomation, setClientInformation] = useState("");
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchClientServiceDetails = async () => {
        try {
            const res = await fetch(`${ADMIN_END_POINT}/client-service-detail/${clientId}`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                let errorData = await res.json();
                toast.error(errorData.error || "Failed to fetch client service detail");
                return;
            }

            const result = await res.json();
            console.log(result);
            setClientInformation(result.clientInfo);
            setServices(result.serviceArray);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientServiceDetails();
    }, [clientId]);

    if (loading) return <p className={styles.loading}>Loading...</p>;
    if (error) return <p className={styles.error}>{error}</p>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Client Service Details</h2>
                <div className={styles.clientInfo}>
                    <p><strong>Name:</strong> {clientInfomation.name}</p>
                    <p><strong>Email:</strong> {clientInfomation.email}</p>
                </div>
            </div>

            <div className={styles.servicesList}>
                {services.length > 0 ? (
                    services.map((service) => {
                        const statusClass =
                            service.serviceStatus === 1
                                ? styles.cardNotStarted
                                : service.serviceStatus === 2
                                ? styles.cardInProgress
                                : styles.cardCompleted;

                        return (
                            <div
                                key={service._id}
                                className={`${styles.serviceCard} ${statusClass} ${service.deleted ? styles.deletedCard : ""}`}
                            >
                                {/* Top Row: Name + Status + Actions */}
                                <div className={styles.topRow}>
                                    <div className={styles.leftSide}>
                                        <span className={styles.serviceName}>{service.serviceName} [Duration : {service.serviceDuration} days] </span>
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

                                    {!service.deleted && (
                                        <div className={styles.actions}>
                                            <button className={styles.editBtn}>Edit</button>
                                            <button className={styles.deleteBtn}>Delete</button>
                                        </div>
                                    )}
                                </div>

                                {/* Date row */}
                                service start → end date
                                <div className={styles.dateRow}>
                                    <span>
                                        {service.serviceStartDate
                                            ? new Date(service.serviceStartDate).toLocaleDateString()
                                            : "-"}
                                    </span>
                                    <span className={styles.arrow}>→</span>
                                    <span>
                                        {service.endDate
                                            ? new Date(service.endDate).toLocaleDateString()
                                            : "-"}
                                    </span>
                                </div>

                                {/* Bottom Row: Status Change Info */}
                                {
                                    service.serviceStatusChangeDate ? 
                                        (<div className={styles.bottomRow}>
                                            <span className={styles.statusText}>
                                                Status changed on:{" "}
                                                {service.serviceStatusChangeDate
                                                    ? new Date(service.serviceStatusChangeDate).toLocaleDateString()
                                                    : "-"
                                                }
                                            </span>
                                        </div>) 
                                        : ''
                                }
                                {
                                    service.deassignDate ? 
                                        (<div className={styles.bottomRow}>
                                            <span className={styles.statusText}>
                                                Service de-assign on:{" "}
                                                {service.deassignDate
                                                    ? new Date(service.deassignDate).toLocaleDateString()
                                                    : "-"
                                                }
                                            </span>
                                        </div>) 
                                        : ''
                                }
                            </div>
                        );
                    })
                ) : (
                    <p>No services found.</p>
                )}
            </div>
        </div>
    );
}

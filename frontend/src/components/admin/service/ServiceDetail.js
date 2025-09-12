import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../Sidebar";
import {
  ADMIN_END_POINT,
  serviceStatusMap,
  serviceTypeMap,
  docTypeMap,
  statusMap,
} from "../../../utils/constants";
import styles from "../../../styles/serviceDetail.module.css";
import loaderStyles from "../../../styles/loader.module.css";
import { toast } from "react-toastify";

function formatDateToDDMMYYYY(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = ("0" + date.getDate()).slice(-2);
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function ServiceDetail() {
  const { clientId } = useParams();
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const res = await fetch(
          `${ADMIN_END_POINT}/service-details/${clientId}`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!res.ok) {
          let errorData = await res.json();
          toast.error(errorData.error || "Failed to fetch service details");
          // throw new Error("Failed to fetch service details");
        }

        const result = await res.json();

        // console.log(result)
        setServiceData(result);
      } catch (err) {
        console.error(err);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [clientId]);

  if (loading)
    return (
      <div className={loaderStyles.dotLoaderWrapper}>
        <div className={loaderStyles.dotLoader}></div>
      </div>
    );
  if (!serviceData)
    return <p className={styles.error}>No service details found</p>;

  const { clientDetails, allServices, docs } = serviceData;

  return (
    <div className={styles.serviceDetailPage}>
      <Sidebar />

      <div className={styles.serviceDetailConatiner}>
        <h2 className={styles.pageTitle}>Service Details</h2>

        {/* Client Card */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>👤 Client Information</h3>
          <div className={styles.infoGrid}>
            <div>
              <strong>Name:</strong> {clientDetails.name}
            </div>
            <div>
              <strong>Email:</strong> {clientDetails.email}
            </div>
            <div>
              <strong>Position:</strong> {clientDetails.position}
            </div>
            <div>
              <strong>Contact:</strong> {clientDetails.contact.phoneCountry}{" "}
              {clientDetails.contact.phone}
            </div>
          </div>
        </div>

        {/* Services Card */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>🛠️ Services</h3>
          {allServices && allServices.length > 0 ? (
            allServices.map((serviceGroup, idx) => (
              <div key={idx} className={styles.serviceGroup}>
                <h4 className={styles.groupTitle}>
                  Service Group #{idx + 1} -{" "}
                  {serviceGroup.clientDetail.clientName}
                </h4>
                <ul className={styles.serviceList}>
                  {serviceGroup.services.map((srv) => (
                    <li key={srv._id} className={styles.serviceItem}>
                      <p>
                        <strong>Type:</strong> {serviceTypeMap[srv.serviceType]}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        {serviceStatusMap[srv.serviceStatus]}
                      </p>
                      <p>
                        <strong>Start:</strong>{" "}
                        {formatDateToDDMMYYYY(srv.serviceStartDate)}
                      </p>
                      <p>
                        <strong>End:</strong>{" "}
                        {formatDateToDDMMYYYY(srv.serviceEndDate)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className={styles.empty}>No services available</p>
          )}
        </div>

        {/* Documents Card */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>📃 Documents</h3>
          {docs?.documents && docs.documents.length > 0 ? (
            <ul className={styles.documentList}>
              {docs.documents.map((doc) => (
                <li key={doc._id} className={styles.documentItem}>
                  <p>
                    <strong>Type:</strong>{" "}
                    {docTypeMap[doc.documentDetails.documentType]}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {statusMap[doc.documentDetails.docStatus]}
                  </p>
                  <p>
                    <strong>Uploaded:</strong>{" "}
                    {formatDateToDDMMYYYY(doc.documentDetails.uploadedAt)}
                  </p>
                  <a
                    href={`${ADMIN_END_POINT}/files/${doc.documentDetails.document.replace(
                      "uploads/document/",
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewLink}
                  >
                    View Document
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>No documents uploaded</p>
          )}
        </div>
      </div>
    </div>
  );
}

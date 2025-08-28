import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Sidebar";
import { ADMIN_END_POINT } from "../../../utils/constants";
import styles from "../../../styles/serviceManagement.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTools } from "@fortawesome/free-solid-svg-icons";

const SERVICE_TYPES = ["VAT Filing", "Corporate Tax", "Payroll", "Audit"];

export default function ServiceManagement() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [formData, setFormData] = useState({
    clientEmail: "",
    serviceType: "",
    startDate: "",
    endDate: "",
  });

  const handleAssignClick = (type) => {
    setSelectedServiceType(type);
    setFormData({
      clientEmail: "",
      serviceType: type,
      startDate: "",
      endDate: "",
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${ADMIN_END_POINT}/assign-service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      let data = {};
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        console.warn("Response is not valid JSON:", parseErr);
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to assign service");
      }

      alert(data.message || "Service assigned successfully!");
      setShowForm(false);

      const serviceRouteMap = {
        "VAT Filing": "/admin/VAT-service",
        "Corporate Tax": "/admin/corporate-tax-service",
        Payroll: "/admin/payroll-service",
        Audit: "/admin/audit-service",
      };

      navigate(serviceRouteMap[selectedServiceType] || "/admin/services");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.content}>
        <h1 className={styles.title}> <FontAwesomeIcon icon={faTools} /> Service Management</h1>

        <div className={styles.serviceCards}>
          {SERVICE_TYPES.map((type) => (
            <div key={type} className={styles.serviceCard}>
              <h3>{type}</h3>
              <p>Track and assign this service to clients</p>
              <button
                className={styles.assignBtn}
                onClick={() => handleAssignClick(type)}
              >
                Assign Service
              </button>
            </div>
          ))}
        </div>

        {showForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>
                Assign Service - {selectedServiceType}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label>Client Email:</label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Service Type:</label>
                  <input
                    type="text"
                    name="serviceType"
                    value={formData.serviceType}
                    readOnly
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Start Date:</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      const startDate = new Date(value);
                      const endDate = new Date(startDate);
                      endDate.setMonth(endDate.getMonth() + 1);

                      setFormData((prev) => ({
                        ...prev,
                        startDate: value,
                        endDate: endDate.toISOString().split("T")[0],
                      }));
                    }}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>End Date:</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={
                      formData.startDate
                        ? formData.startDate
                        : new Date().toISOString().split("T")[0]
                    }
                    required
                  />
                </div>

                <div className={styles.modalButtons}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    Assign
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

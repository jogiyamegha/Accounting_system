// src/pages/ServiceManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Sidebar";
import { ADMIN_END_POINT } from "../../../utils/constants";

const SERVICE_TYPES = ["VAT Filing", "Corporate Tax", "Payroll", "Audit"];

export default function ServiceManagement() {
  const navigate = useNavigate();
  //   const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [formData, setFormData] = useState({
    clientEmail: "",
    serviceType: "",
    startDate: "",
    endDate: "",
  });

  // Fetch existing services
  //   useEffect(() => {
  //     fetch(`${ADMIN_END_POINT}/service-management`)
  //       .then((res) => res.json())
  //       .then((data) => setServices(data))
  //       .catch((err) => console.error(err));
  //   }, []);

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

      //   console.log("res",res)

      if (!res.ok) throw new Error("Failed to assign service");

      //   const newService = await res.json();
      alert("Service assigned successfully!");
      setShowForm(false);
      //   setServices((prev) => [...prev, newService]);

      const serviceRouteMap = {
        "VAT Filing": "/admin/VAT-service",
        "Corporate Tax": "/admin/corporate-tax-service",
        Payroll: "/admin/payroll-service",
        Audit: "/admin/audit-service",
      };

      const route = serviceRouteMap[selectedServiceType] || "/admin/services";
      navigate(route);
    } catch (err) {
      console.error(err);
      alert("Error assigning service");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5 " }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div style={{ flex: 1, padding: "20px", marginLeft: "240px" }}>
        <h1>Service Management</h1>

        {/* Cards for each service type */}
        <div
          style={{
            display: "flex",
            gap: "30px",
            flexWrap: "wrap",
            marginTop: "20px",
            justifyContent: "flex-start",
          }}
        >
          {SERVICE_TYPES.map((type) => (
            <div
              key={type}
              style={{
                background: "#fff",
                border: "1px solid #a5a5a5ff",
                borderRadius: "8px",
                padding: "30px",
                width: "280px", // bigger cards
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>{type}</h3>
              <p style={{ marginBottom: "20px" }}>
                Track and assign this service to clients
              </p>
              <button
                onClick={() => handleAssignClick(type)}
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#1e293b",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              >
                Assign Service
              </button>
            </div>
          ))}
        </div>

        {/* Assign Service Form Modal */}
        {showForm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.3)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "25px",
                borderRadius: "8px",
                minWidth: "350px",
              }}
            >
              <h2 style={{ marginBottom: "15px" }}>
                Assign Service - {selectedServiceType}
              </h2>
              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <label>Client Email:</label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                  />
                </div>
                <div>
                  <label>Service Type:</label>
                  <input
                    type="text"
                    name="serviceType"
                    value={formData.serviceType}
                    readOnly
                    style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                  />
                </div>
                <div>
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
                    style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                  />
                </div>

                <div>
                  <label>End Date:</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    min={
                      formData.startDate
                        ? formData.startDate
                        : new Date().toISOString().split("T")[0]
                    }
                    style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "15px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#1e293b",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
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

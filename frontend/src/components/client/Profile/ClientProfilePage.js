import { useEffect, useState } from "react";
import { CLIENT_END_POINT, docTypeMap, statusMap } from "../../../utils/constants";
import '../../../styles/clientProfile.css';

export default function ClientProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${CLIENT_END_POINT}/profile`, {
          method: "GET",
          credentials: "include", // this sends cookies with the request
        });

        // console.log("res", res);

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        console.log("data", data);
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>No profile found.</p>;

  return (
    <div className="profile-container">
      <h2 className="profile-title">Client Profile</h2>

      {/* --- Client Info --- */}
      <section className="profile-section">
        <h3 className="section-title">Personal Information</h3>
        <div className="info-grid">
          <p><strong>Name:</strong> {profile.client?.name || "N/A"}</p>
          <p><strong>Email:</strong> {profile.client?.email || "N/A"}</p>
          <p><strong>Phone:</strong> {profile.client?.contact?.phone || "N/A"}</p>
        </div>
      </section>

      {/* --- Company Info --- */}
      <section className="profile-section">
        <h3 className="section-title">Company Information</h3>
        <div className="info-grid">
          <p><strong>Company Name:</strong> {profile.company?.name || "N/A"}</p>
          <p><strong>Company Email:</strong> {profile.company?.email || "N/A"}</p>
          <p><strong>Company Business Type:</strong> {profile.company?.businessType || "N/A"}</p>
          <p>
            <strong>Address:</strong>{" "}
            {profile.company?.address
              ? `${profile.company.address.addressLine1 || ""}, ${
                  profile.company.address.addressLine2 || ""
                }, ${profile.company.address.street || ""}, ${
                  profile.company.address.landmark || ""
                }, ${profile.company.address.city || ""}, ${
                  profile.company.address.state || ""
                }, ${profile.company.address.zipcode || ""}, ${
                  profile.company.address.country || ""
                }`
              : "N/A"}
          </p>
        </div>
      </section>

      <section className="profile-section">
        <h3 className="section-title">Credentials</h3>
        <div className="info-grid">
            <p><strong>Tax Reg Number</strong> {profile.company?.taxRegistrationNumber || "N/A"}</p>
            
        </div>


      </section>

      {/* --- Documents --- */}
      <section className="profile-section">
        <h3 className="section-title">Uploaded Documents</h3>
        {Array.isArray(profile.documents) && profile.documents.length > 0 ? (
          <ul className="document-list">
            {profile.documents.map((doc, index) => {
              const { documentType, docStatus } = doc.documentDetails;
              return (
                <li key={doc._id || index} className="document-item">
                  <span className="doc-type">{docTypeMap[documentType]}</span>
                  <span className={`doc-status status-${docStatus}`}>
                    {statusMap[docStatus] || "Unknown"}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="no-docs">No documents uploaded.</p>
        )}
      </section>
    </div>
  );
}

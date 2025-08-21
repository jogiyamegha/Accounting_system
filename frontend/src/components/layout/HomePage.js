import "../../styles/homePage.css";

import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <h1>Welcome to MyAccounting System</h1>
        <p>
          Manage your accounts, track documents, and stay on top of your
          finances with ease.
        </p>
        <div className="hero-buttons">
          <Link to="/admin/login" className="btn primary">
            Get Started
          </Link>
          <a href="#features" className="btn secondary">
            Learn More
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="feature-card">
          <h3>Document Management</h3>
          <p>
            Upload, track, and organize all your accounting documents easily.
          </p>
        </div>
        <div className="feature-card">
          <h3>Company Profile Management</h3>
          <p>Maintain your company and contact information securely.</p>
        </div>
        <div className="feature-card">
          <h3>Real-time Insights</h3>
          <p>Get instant updates on your pending and approved documents.</p>
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <h2>About MyAccounting System</h2>
        <p>
          Our system is designed for businesses of all sizes to simplify
          accounting tasks, manage documents efficiently, and ensure compliance
          with minimal effort.
        </p>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <h2>Ready to Simplify Your Accounting?</h2>
        <Link to="/client/signup" className="btn primary">
          Sign Up Now
        </Link>
      </section>
    </div>
  );
}

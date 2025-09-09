import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../../assets/logo.svg";
import styles from "../../styles/homePage.module.css";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const HomePage = () => {
    return (
        <div className={styles.homepageContainer}>
            {/* 1. Header & Navigation */}
            <header className={styles.header}>
                <div className={styles.headerContentLeft}>
                    <a href="/" className={styles.logoLink}>
                        <img src={logo} alt="e-Services Logo" className={styles.logo} />
                    </a>
                    <nav className={styles.mainNav}>
                        <ul className={styles.navLinks}>
                            <li><a href="/" className={styles.navItem}>Home</a></li>
                            <li><a href="/about" className={styles.navItem}>About Us</a></li>
                            <li><a href="/services" className={styles.navItem}>Services</a></li>
                            <li><a href="/faq" className={styles.navItem}>FAQs</a></li>
                            <li><a href="/contact" className={styles.navItem}>Contact</a></li>
                        </ul>
                    </nav>
                </div>
                <div className={styles.headerContentRight}>
                    <div className={styles.languageSelector}>
                        <select aria-label="Select language">
                            <option value="en">English</option>
                            <option value="hi">हिन्दी</option>
                        </select>
                    </div>
                    <a href="/client/login" className={`${styles.authLink} ${styles.login}`}>Client Login</a>
                    <a href="/admin/login" className={`${styles.authLink} ${styles.login}`}>Admin Login</a>
                    <a href="/client/signup" className={`${styles.authLink} ${styles.register}`}>Register</a>
                </div>
            </header>

            {/* 2. Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h2 className={styles.heroHeadline}>Essential Online Services for Your Business</h2>
                    <p className={styles.heroSubheadline}>Streamline document management, automate reminders, and track your financial compliance with our secure online platform.</p>
                    <a href="/client/signup" className={styles.heroCta}>Get Started</a>
                </div>
            </section>

            {/* 3. Key Services Overview */}
            <section className={styles.servicesOverview}>
                <h3 className={styles.sectionTitle}>Our Core Services</h3>
                <div className={styles.servicesGrid}>
                    <div className={styles.serviceCard}>
                        <span className={styles.iconPlaceholder}>📈</span>
                        <h4>VAT</h4>
                        <p>Registration, return filing, and audit support.</p>
                    </div>
                    <div className={styles.serviceCard}>
                        <span className={styles.iconPlaceholder}>📊</span>
                        <h4>Corporate Tax</h4>
                        <p>Tax residency, return filing, and planning.</p>
                    </div>
                    <div className={styles.serviceCard}>
                        <span className={styles.iconPlaceholder}>🧮</span>
                        <h4>Accounting</h4>
                        <p>Bookkeeping, payroll, and financial statements.</p>
                    </div>
                </div>
            </section>

            {/* 4. Features & Benefits */}
            <section className={styles.featuresSection}>
                <h3 className={styles.sectionTitle}>Key Features</h3>
                <div className={styles.featuresGrid}>
                    <div className={styles.featureItem}>
                        <span className={styles.iconPlaceholder}>🔒</span>
                        <h4>Secure Document Management</h4>
                        <p>A central, secure repository for all your business documents.</p>
                    </div>
                    <div className={styles.featureItem}>
                        <span className={styles.iconPlaceholder}>🔔</span>
                        <h4>Automated Reminders</h4>
                        <p>Never miss a deadline with automated notifications and alerts.</p>
                    </div>
                    <div className={styles.featureItem}>
                        <span className={styles.iconPlaceholder}>⏱️</span>
                        <h4>Real-time Tracking</h4>
                        <p>Monitor the status of your services and document approvals.</p>
                    </div>
                </div>
            </section>

            {/* 5. Call to Action */}
            <section className={styles.ctaSection}>
                <h3 className={styles.ctaHeadline}>Ready to Simplify Your Accounting?</h3>
                <p className={styles.ctaSubheadline}>Join hundreds of businesses benefiting from our streamlined platform.</p>
                <a href="/client/signup" className={styles.ctaButton}>Sign Up Today</a>
            </section>

            {/* 6. Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerColumns}>
                    <div className={styles.footerCol}>
                        <a href="/" className={styles.footerLogo}>E-Services</a>
                        <p className={styles.footerTagline}>Your trusted partner in accounting and compliance.</p>
                    </div>
                    <div className={styles.footerCol}>
                        <h5>Company</h5>
                        <ul className={styles.footerLinks}>
                            <li><a href="/about">About Us</a></li>
                            <li><a href="/services">Services</a></li>
                            <li><a href="/contact">Contact</a></li>
                        </ul>
                    </div>
                    <div className={styles.footerCol}>
                        <h5>Legal</h5>
                        <ul className={styles.footerLinks}>
                            <li><a href="/terms">Terms & Conditions</a></li>
                            <li><a href="/privacy">Privacy Policy</a></li>
                        </ul>
                    </div>
                    <div className={styles.footerCol}>
                        <h5>Contact</h5>
                        <p>123 Business Lane, City, Country</p>
                        <p>contact@eservices.com</p>
                        <p>+1 (123) 456-7890</p>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    <p className={styles.copyright}>&copy; 2025 E-Services. All Rights Reserved.</p>
                </div>
            </footer>
            <button
          className={styles.backButton}
          onClick={() => window.history.back()}
        >
          Back
          <div className={styles.icon}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </div>
        </button>
        </div>
    );
};

export default HomePage;

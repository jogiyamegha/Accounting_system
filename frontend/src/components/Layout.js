import Notification from "../components/Notification";

export default function Layout({ children }) {
  return (
    <div className="layout">
      <main className="content">{children}</main>
      <Notification /> {/* Keep ToastContainer globally here */}
    </div>
  );
}

import "./App.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Routes, Route } from "react-router-dom";
import AddClient from "./components/admin/client/AddClient";
import HomePage from "./components/layout/HomePage";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminForgotPassword from "./components/admin/auth/AdminForgotPassword";
import AdminChangePassword from "./components/admin/auth/AdminChangePassword";
import AdminVerifyOtp from "./components/admin/auth/AdminVerifyOtp";
import ClientChangePassword from "./components/client/Auth/ClientChangePassword";
import ClientForgotPassword from "./components/client/Auth/ClientForgotPassword";
import ClientVerifyOtp from "./components/client/Auth/ClientVerifyOtp";
import ProfileUpdate from "./components/client/Profile/ProfileUpdate";
import CompanyProfile from "./components/client/Profile/CompanyProfile";
import DocumentPage from "./components/client/Profile/Document";
import ClientProfilePage from "./components/client/Profile/ClientProfilePage";
import Layout from "./components/Layout";
import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";
import DocStatusChange from "./components/admin/client/DocStatusChange";
import Dashboard from "./components/admin/Dashboard";
import ClientManagement from "./components/admin/client/ClientManagement";

function App() {
  return (
    <>
      <Routes>
        {/* -------- Public Routes ---------- */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Layout>
                <HomePage />
              </Layout>
            </PublicRoute>
          }
        />

        {/* -------- Auth (Common for Admin & Client) ---------- */}
        {/* <Route
          path="/:role/signup"
          element={
            <Layout>
              <AdminSignup />
            </Layout>
          }
        />

        <Route
          path="/:role/login"
          element={
            <Layout>
              <CheckUser />
            </Layout>
          }
        /> */}
        <Route
          path="/:role/signup"
          element={
            <Layout>
              <Signup />
            </Layout>
          }
        />

        <Route
          path="/:role/login"
          element={
            <Layout>
              <Login />
            </Layout>
          }
        />

        {/* -------- Admin Routes ---------- */}
        <Route
          path="/admin/dashboard"
          element={
              <Layout>
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
              </Layout>
          }
        />

        <Route
          path="/admin/add-client"
          element={
              <Layout>
                <ProtectedRoute>
                    <AddClient />
                </ProtectedRoute>
              </Layout>
          }
        />

        <Route
          path="/admin/client-management"
          element={
              <Layout>
                <ProtectedRoute>
                    <ClientManagement />
                </ProtectedRoute>
              </Layout>
          }
        />

        <Route
          path="/admin/document"
          element={
              <Layout>
                <ProtectedRoute>
                    <DocStatusChange />
                </ProtectedRoute>
              </Layout>
          }
        />


        <Route
          path="/admin/forgot-password"
          element={
            <Layout>
              <AdminForgotPassword />
            </Layout>
          }
        />
        <Route
          path="/admin/change-password"
          element={
            <Layout>
              <AdminChangePassword />
            </Layout>
          }
        />
        <Route
          path="/admin/verify-otp"
          element={
            <Layout>
              <AdminVerifyOtp />
            </Layout>
          }
        />

        {/* -------- Client Routes ---------- */}
        {/* <Route
          path="/client/signup"
          element={
            <Layout>
              <ClientSignup />
            </Layout>
          }
        /> */}
        <Route
          path="/client/forgot-password"
          element={
            <Layout>
              <ClientForgotPassword />
            </Layout>
          }
        />
        <Route
          path="/client/change-password"
          element={
            <Layout>
              <ClientChangePassword />
            </Layout>
          }
        />
        <Route
          path="/client/verify-otp"
          element={
            <Layout>
              <ClientVerifyOtp />
            </Layout>
          }
        />
        <Route
          path="/client/profile"
          element={
            <Layout>
              <ProtectedRoute >
                <ClientProfilePage />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/client/client-profile"
          element={
            <Layout>
              <ProtectedRoute>
                <ProfileUpdate />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/client/company-profile"
          element={
            <Layout>
              <ProtectedRoute>

                <CompanyProfile />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/client/document"
          element={
            <Layout>

              <ProtectedRoute>

              <DocumentPage />
              </ProtectedRoute>
            </Layout>
          }
        />
      </Routes>
    </>
  );
}

export default App;

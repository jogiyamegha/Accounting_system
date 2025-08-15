import './App.css';
import { Routes, Route } from 'react-router-dom';
import CheckUser from './components/admin/auth/CheckUser';
import AdminSignup from './components/admin/auth/AdminSignup';
import AddClient from './components/admin/client/AddClient';
import HomePage from './components/layout/HomePage';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';
import AdminForgotPassword from './components/admin/auth/AdminForgotPassword';
import AdminChangePassword from './components/admin/auth/AdminChangePassword';
import AdminVerifyOtp from './components/admin/auth/AdminVerifyOtp';
import ClientSignup from './components/client/Auth/ClientSignup';
import ClientChangePassword from './components/client/Auth/ClientChangePassword';
import ClientForgotPassword from './components/client/Auth/ClientForgotPassword';
import ClientVerifyOtp from './components/client/Auth/ClientVerifyOtp';
import ProfileUpdate from './components/client/Profile/ProfileUpdate';
import CompanyProfile from './components/client/Profile/CompanyProfile';
import DocumentPage from './components/client/Profile/Document';
import ClientProfilePage from './components/client/Profile/ClientProfilePage';

function App() {
    return (
        <>
            <Routes>
            
                {/** --------Public Routes ---------- */}
                <Route 
                    path='/'
                    element={
                        <PublicRoute>
                            <HomePage />
                        </PublicRoute>
                    }
                    />

                {/* -------- Admin Routes ------------ */}
                
                <Route 
                    path='/:role/signup'
                    element={
                        <AdminSignup />
                    }
                />

                <Route 
                    path='/:role/login'
                    element={
                        <CheckUser />
                    }
                />

                <Route 
                    path='/admin/add-client'
                    element={
                        <ProtectedRoute>
                            <AddClient />
                        </ProtectedRoute>
                    }
                />

                <Route 
                    path='/admin/forgot-password'
                    element={
                        <AdminForgotPassword />
                    }
                />

                <Route 
                    path='/admin/change-password'
                    element={
                        <AdminChangePassword />
                    }
                />

                <Route 
                    path='/admin/verify-otp'
                    element={
                        <AdminVerifyOtp />
                    }
                />

                 {/* -------- Client Routes ------------ */}
                
                <Route 
                    path='/client/signup'
                    element={
                        <ClientSignup />
                    }
                />

                <Route 
                    path='/:role/login'
                    element={
                        <CheckUser />
                    }
                />

                  <Route 
                    path='/client/forgot-password'
                    element={
                        <ClientForgotPassword />
                    }
                />

                <Route 
                    path='/client/change-password'
                    element={
                        <ClientChangePassword />
                    }
                />

                <Route 
                    path='/client/verify-otp'
                    element={
                        <ClientVerifyOtp />
                    }
                />

                <Route 
                    path='/client/profile'
                    element={
                        <ClientProfilePage />
                    }
                />

                <Route 
                    path='/client/client-profile'
                    element={
                        <ProfileUpdate />
                    }
                />

                <Route 
                    path='/client/company-profile'
                    element={
                        <CompanyProfile />
                    }
                />

                <Route 
                    path='/client/document'
                    element={
                        <DocumentPage />
                    }
                />

            </Routes>
        </>
    )
}

export default App;
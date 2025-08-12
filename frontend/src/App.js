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
                    path='/admin/forgotPassword'
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
            </Routes>
        </>
    )
}

export default App;
// // // import {useDispatch, useSelector} from 'react-redux';
// // // import { ADMIN_END_POINT} from '../utils/constants';
// // // import { setUser, clearUser } from '../redux/features/userSlice';
// // // import { Navigate } from 'react-router-dom';
// // // import { useEffect } from 'react';

// // // export default function ProtectedRoute({ children }) {
// // //     const dispatch = useDispatch();
// // //     const { user } = useSelector((state) => {
// // //         return state.user;
// // //     });

// // //     const getUser = async () => {
// // //         try {
// // //             const response = await fetch(`${ADMIN_END_POINT}/admin`, {
// // //                 method: "GET",
// // //                 headers: {
// // //                     Authorization: `Bearer ${localStorage.getItem("token")}`,
// // //                     "Content-Type": "application/json"
// // //                 },

// // //             });

// // //             const data = await response.json();
// // //             if (response.ok) {
// // //                 dispatch(setUser(data.user));
// // //             } else {
// // //                 localStorage.clear();
// // //                 // return <Navigate to="/admin/login" />;
// // //             }
// // //         } catch (error) {
// // //             localStorage.clear();
// // //             dispatch(clearUser());
// // //         }
// // //     }

// // //     useEffect(() => {
// // //         if(!user) {
// // //             getUser()
// // //         }
// // //     }, [user]);

// // //     if(localStorage.getItem('token')) {
// // //         return children;
// // //     } else {
// // //         return <Navigate to='/admin/login' />
// // //     }
// // // }

// // import { useDispatch, useSelector } from 'react-redux';
// // import { ADMIN_END_POINT, CLIENT_END_POINT, USER_END_POINT } from '../utils/constants';
// // import { setUser, clearUser } from '../redux/features/userSlice';
// // import { Navigate } from 'react-router-dom';
// // import { useEffect, useState } from 'react';

// // // Define endpoints and redirect routes for different user types
// // const USER_CONFIG = {
// //     admin: {
// //         endpoint: ADMIN_END_POINT,
// //         loginRoute: '/admin/login',
// //         tokenKey: 'adminToken',
// //         apiPath: '/admin'
// //     },
// //     client: {
// //         endpoint: CLIENT_END_POINT,
// //         loginRoute: '/client/login',
// //         tokenKey: 'clientToken',
// //         apiPath: '/client'
// //     }
// // };

// import { useDispatch, useSelector } from 'react-redux';
// import { ADMIN_END_POINT, CLIENT_END_POINT } from '../utils/constants';
// import { setUser, clearUser } from '../redux/features/userSlice';
// import { Navigate } from 'react-router-dom';
// import { useEffect, useState } from 'react';

// // Define endpoints and redirect routes for different user types
// const USER_CONFIG = {
//     admin: {
//         endpoint: ADMIN_END_POINT,
//         // loginRoute: '/admin/login',
//         tokenKey: localStorage.getItem('token'),
//         apiPath: '/admin'
//     },
//     client: {
//         endpoint: CLIENT_END_POINT,
//         // loginRoute: '/client/login',
//         tokenKey: 'clientToken',
//         apiPath: '/client'
//     }
// };

// export default function ProtectedRoute({
//     children,
//     userType = 'admin', // 'admin', 'client', 'user'
//     allowedRoles = [], // Additional role-based restrictions
//     fallbackRoute = null
// }) {

//     const dispatch = useDispatch();
//     const { user, loading } = useSelector((state) => state.user);
//     const [authChecked, setAuthChecked] = useState(false);

//     const config = USER_CONFIG[userType];
//     const [configError, setConfigError] = useState(false);

//     console.log("config",config);

//     // Check config validity
//     useEffect(() => {
//         if (!config) {
//             console.error(`Invalid user type: ${userType}`);
//             setConfigError(true);
//         }
//     }, [config, userType]);

//     const getUser = async () => {
//         const token =  config.tokenKey;
//         console.log("here", token);

//         if (!token) {
//             setAuthChecked(true);
//             return;
//         }

//         try {
//             // dispatch(setLoading(true));

//             const response = await fetch(`${config.endpoint}${config.apiPath}`, {
//                 method: "GET",
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json"
//                 },
//             });

//             console.log("response",response);
//             const data = await response.json();
//             console.log("data", data);

//             if (response.ok && data.user) {
//                 // Verify user type matches expected type
//                 if (data.user.userType === 1) {
//                     dispatch(setUser({
//                         ...data.user,
//                         userType,
//                         authType: data.user.authType || userType
//                     }));
//                 } else {
//                     // User type mismatch - clear token and redirect
//                     localStorage.removeItem(config.tokenKey);
//                     dispatch(clearUser());
//                 }
//             } else {
//                 // Token invalid or expired
//                 localStorage.removeItem(config.tokenKey);
//                 dispatch(clearUser());
//             }
//         } catch (error) {
//             console.error(`Auth error for ${userType}:`, error);
//             localStorage.removeItem(config.tokenKey);
//             dispatch(clearUser());
//         } finally {
//             // dispatch(setLoading(false));
//             setAuthChecked(true);
//         }
//     };

//     // Auth check effect - must be called before any conditional returns
//     useEffect(() => {
//         if (config && !user && !authChecked) {
//             getUser();
//         } else if (!authChecked) {
//             setAuthChecked(true);
//         }
//     }, [user, authChecked, config]);

//     // Handle config error
//     if (configError) {
//         return <Navigate to="/error" />;
//     }

//     // Show loading while checking authentication
//     if (loading || !authChecked) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <div className="loading-spinner">Loading...</div>
//             </div>
//         );
//     }

//     // Check if user is authenticated
//     const token = config.tokenKey;
//     const isAuthenticated = token && user && user.userType === userType;

//     if (!isAuthenticated) {
//         return <Navigate to={fallbackRoute || config.loginRoute} replace />;
//     }

//     // Additional role-based access control
//     if (allowedRoles.length > 0 && user.role && !allowedRoles.includes(user.role)) {
//         return <Navigate to="/unauthorized" replace />;
//     }

//     return children;
// }

import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "../redux/features/userSlice";
import { Navigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { ADMIN_END_POINT, CLIENT_END_POINT } from "../utils/constants";
import { useLocation } from "react-router-dom";

const USER_CONFIG = {
    admin: {
        endpoint: `${ADMIN_END_POINT}/admin`,
        loginRoute: "/admin/login",
    },

    client: {
        endpoint: `${CLIENT_END_POINT}/client`,
        loginRoute: "/client/login",
    },
};

export default function ProtectedRoute({
    children,
    userType = null,
    allowedRoles = [],
    fallbackRoute = null,
}) {
    const dispatch = useDispatch();
    const { user, loading } = useSelector((state) => state.user);
    const [authChecked, setAuthChecked] = useState(false);
    const location = useLocation();

    const detectedUserType =
        userType ||
        (location.pathname.startsWith("/admin")
        ? "admin"
        : location.pathname.startsWith("/client")
        ? "client"
        : "client"); 
    
    const config = USER_CONFIG[detectedUserType];

    const getUser = useCallback(async () => {
        try {
            const response = await fetch(config.endpoint, {
                method: "GET",
                credentials: "include", 
                headers: {
                    "Content-Type": "application/json",
                },
            });
            // console.log("object");
            console.log("response",response);

            const data = await response.json();

            if (response.ok && data.user) {
                dispatch(setUser({ user : {
                    ...data.user,
                    userType: detectedUserType,
                    role: data.role || null,
                }}));
            } else {
                dispatch(clearUser());
            }
        } catch (error) {
            console.error(`Auth error for ${userType}:`, error);
            dispatch(clearUser());
        } finally {
            setAuthChecked(true);
        }
    
    }, [config.endpoint, dispatch, detectedUserType, userType]);

    useEffect(() => {
        if (!authChecked) {
        getUser();
        }
    }, [authChecked, getUser]);

    if (loading || !authChecked) {
        return (
        <div className="flex items-center justify-center min-h-screen">
            Loading...
        </div>
        );
    }

    if (!user) {
        return <Navigate to={fallbackRoute || config.loginRoute} replace />;
    }

    if (
        allowedRoles.length > 0 &&
        user.role &&
        !allowedRoles.includes(user.role)
    ) {
        return <Navigate to="/client/login" replace />;
    }

    return children;
}

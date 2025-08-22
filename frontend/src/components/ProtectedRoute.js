import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "../redux/features/userSlice";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

import { ADMIN_END_POINT, CLIENT_END_POINT } from "../utils/constants";
 
const USER_CONFIG = {

  admin: {

    endpoint: `${ADMIN_END_POINT}/admin`,

    loginRoute: "/admin/login",

    role: "admin",

  },

  client: {

    endpoint: `${CLIENT_END_POINT}/client`,

    loginRoute: "/client/login",

    role: "client",

  },

};
 
export default function ProtectedRoute({

  children,

  userType = null,

  allowedRoles = [],

  fallbackRoute = null,

}) {

  const dispatch = useDispatch();

  const { user, role, loading } = useSelector((state) => state.user);

  const [authChecked, setAuthChecked] = useState(false);

  const location = useLocation();
 
  // auto-detect based on path

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

        headers: { "Content-Type": "application/json" },

      });

      const data = await response.json();
 
      if (response.ok && data.user) {

        // ✅ Always store role + userType consistently

        dispatch(

          setUser({

            user: data.user,

            userType: detectedUserType, // "admin" | "client"

            role: config.role, // "admin" | "client"

          })

        );

      } else {

        dispatch(clearUser());

      }

    } catch (error) {

      console.error(`Auth error for ${detectedUserType}:`, error);

      dispatch(clearUser());

    } finally {

      setAuthChecked(true);

    }

  }, [config.endpoint, config.role, detectedUserType, dispatch]);
 
  useEffect(() => {

    if (!authChecked) {

      getUser();

    }

  }, [authChecked, getUser]);
 
  // 🔹 Loading state

  if (loading || !authChecked) {

    return (
<div className="flex items-center justify-center min-h-screen">

        Loading...
</div>

    );

  }
 
  // 🔹 If not logged in → redirect to login

  if (!user) {

    return <Navigate to={fallbackRoute || config.loginRoute} replace />;

  }
 
  // 🔹 Role-based access check

  if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {

    return <Navigate to={config.loginRoute} replace />;

  }
 
  return children;

}

 
import { useSelector } from "react-redux";

import HomePage from "./layout/HomePage";
import { legacy_createStore } from "@reduxjs/toolkit";
 
export default function PublicRoute({ children }) {
    const { user, role } = useSelector((state) => state.user);
    // If user is already logged in, send them to HomePage (or dashboard)
    console.log("user, role",user, role);

    if (user && role) {
      console.log("condition true");
      return <HomePage />;
    }
    // Otherwise show the public page (login, signup, etc.)
    console.log("children ",children);
    return children;
}

 
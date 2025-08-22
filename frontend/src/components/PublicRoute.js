import { useSelector } from "react-redux";

import HomePage from "./layout/HomePage";
 
export default function PublicRoute({ children }) {
    const { user, role } = useSelector((state) => state.user);
    // If user is already logged in, send them to HomePage (or dashboard)

    if (user && role) {
      return <HomePage />;
    }
    // Otherwise show the public page (login, signup, etc.)
    return children;
}

 
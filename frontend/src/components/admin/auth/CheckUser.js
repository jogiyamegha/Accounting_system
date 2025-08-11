import { useParams } from "react-router-dom";
import AdminLogin from "./AdminLogin";

function CheckUser () {
    const { role } = useParams();


    return <div>
        {role === 'admin' ? (
            <AdminLogin />
        ) : (
            <p>Welcome, Client! Please login to your account.</p>
        )}
    </div>
}

export default CheckUser;
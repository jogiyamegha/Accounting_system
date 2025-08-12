import { useParams } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import ClientLogin from "../../client/Auth/ClientLogin";

function CheckUser () {
    const { role } = useParams();


    return <div>
        {role === 'admin' ? (
            <AdminLogin />
        ) : (
            <ClientLogin />
        )}
    </div>
}

export default CheckUser;
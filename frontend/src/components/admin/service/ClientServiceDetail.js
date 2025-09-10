import { useState } from "react";
import { useParams } from "react-router-dom";
import { ADMIN_END_POINT } from "../../../utils/constants";
import { toast } from "react-toastify";
import { useEffect } from "react";

export function ClientServiceDetail() {
    const { clientId } = useParams();
    const [error, setError] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const fetchClientServiceDetails = async () => {
        try {
            const res = await fetch(`${ADMIN_END_POINT}/client-service-detail/${clientId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type' : 'application/json'
                }
            })

            if(!res.ok) {
                let errorData = await res.json();
                toast.error(errorData.error || 'Failed to fetch client service detail');
            }

            const result = await res.json();
            console.log(result);
            setData(result);

        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchClientServiceDetails()
    }, [clientId]);

    return (
        <div>
            {clientId}
        </div>
    )
}
import { useEffect, useState } from "react";
import { ADMIN_END_POINT } from "../../../utils/constants";


export default function VATService() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVATClients = async () => {
        try {
            const res = await fetch(`${ADMIN_END_POINT}/VAT-service`); 
            if (!res.ok) {
                throw new Error("Failed to fetch clients");
            }
            const data = await res.json();
            console.log(data);
            setClients(data);
        } catch (err) {
            console.error("Error fetching VAT clients:", err);
        } finally {
            setLoading(false);
        }
        };

        fetchVATClients();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (clients.length === 0) {
        return <p>No clients have applied for VAT service.</p>;
    }

    return (
        <div>
        <h2 className="text-xl font-bold mb-4">Clients Applied for VAT Service</h2>
        <ul className="list-disc ml-6">
            {clients.map((client) => (
            <li key={client._id}>
                <span className="font-semibold">{client.clientDetail.clientName}</span> -{" "}
                {client.clientDetail.clientEmail}
            </li>
            ))}
        </ul>
        </div>
    );
}

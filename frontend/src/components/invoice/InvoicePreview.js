import { pdf, PDFViewer } from "@react-pdf/renderer";
import { ADMIN_END_POINT } from "../../utils/constants";
import InvoicePDF from "./InvoicePDF";
import { useNavigate } from "react-router-dom";

export default function InvoicePreview({ data }) {
  const navigate = useNavigate();
  const handleSaveToBackend = async () => {
    try {
      const blob = await pdf(<InvoicePDF data={data} />).toBlob();
      const formData = new FormData();

      formData.append("invoice", blob, `Invoice_${data.invoiceNumber}.pdf`);
      const res = await fetch(
        `${ADMIN_END_POINT}/generate-invoice/${data.clientId}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Failed to send invoice");
      }

      const result = await res.json();

      navigate(`/admin/client-detail/${data.clientId}`);
    } catch (error) {
      console.error("Error while saving invoice:", error);
    }
  };

  return (
    <div>
      {/* Show PDF preview in browser */}
      <PDFViewer width="100%" height="600">
        <InvoicePDF data={data} />
      </PDFViewer>

      {/* Button to send PDF to backend */}
      <button
        onClick={handleSaveToBackend}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Save Invoice
      </button>
    </div>
  );
}

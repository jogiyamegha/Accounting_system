import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "./InvoicePDF";
import styles from "./InvoicePreview.module.css";

const InvoicePreview = ({ data }) => {
  return (
    <div className={styles.previewContainer}>
      <div className={styles.viewerContainer}>
        <PDFDownloadLink
          document={<InvoicePDF data={data} />}
          fileName={`Invoice_${data.invoiceNumber || "Invoice"}.pdf`}
          className={styles.downloadLink}
        >
          {({ loading }) => (loading ? "Generating PDF..." : "📄 Download PDF")}
        </PDFDownloadLink>
        <PDFViewer width="100%" height="85%">
          <InvoicePDF data={data} />
        </PDFViewer>
      </div>
    </div>
  );
};

export default InvoicePreview;

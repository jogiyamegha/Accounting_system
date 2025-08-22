import { Image, StyleSheet } from "@react-pdf/renderer";
import { stampDataUrl } from "../ui/Stamp";

const styles = StyleSheet.create({
  stampImage: {
    width: 124,
    height: 132,
    marginTop: -9,
    transform: "rotate(-15deg)",
  },
});

const InvoiceStamp = () =>
  stampDataUrl ? <Image src={stampDataUrl} style={styles.stampImage} /> : null;

export default InvoiceStamp;

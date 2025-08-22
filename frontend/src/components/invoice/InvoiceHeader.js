import { Text, View, StyleSheet } from "@react-pdf/renderer";

import { Logo } from "../ui/Logo";

const styles = StyleSheet.create({
  invoiceHeader: {
    height: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: { width: 145, height: 39 },
  companyDetails: { width: 251, textAlign: "left" },
  headerParagraph: {
    fontFamily: "Poppins",
    fontWeight: "semibold",
    fontSize: 12,
    textTransform: "uppercase",
    textAlign: "left",
  },
  headerParagraphDetails: {
    textAlign: "left",
    fontSize: 10,
    fontFamily: "Poppins",
    fontWeight: "normal",
  },
});

const InvoiceHeader = () => (
  <View>
    <View style={styles.invoiceHeader}>
      <Logo style={styles.logo} />
      <View style={styles.companyDetails}>
        <Text style={styles.headerParagraph}>
          AL ASR MANAGEMENT AND CONSULTANCY
        </Text>
        <Text style={styles.headerParagraphDetails}>
          223 Client St, Dubai, UAE{"\n"}
          +971 505 456-7890 | alasrconsult@gmail.com
        </Text>
      </View>
    </View>
  </View>
);

export default InvoiceHeader;

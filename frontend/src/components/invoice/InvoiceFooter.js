import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  signatureContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureContent: {
    flexDirection: "column",
    alignItems: "center",
    wrap: false,
  },
  signatureLine: {
    borderTopWidth: 0.5,
    borderTopColor: "#7C7C7C",
    width: 156,
    marginBottom: 8,
  },
  signatureText: {
    fontSize: 14,
    fontFamily: "Montserrat",
    fontWeight: "semibold",
  },
});

const InvoiceFooter = () => (
  <View style={styles.signatureContainer}>
    <View style={styles.signatureContent}>
      <View style={styles.signatureLine} />
      <Text style={styles.signatureText}>Authorized Signature</Text>
    </View>
    <View style={styles.signatureContent}>
      <View style={styles.signatureLine} />
      <Text style={styles.signatureText}>Receiver Signature</Text>
    </View>
  </View>
);

export default InvoiceFooter;

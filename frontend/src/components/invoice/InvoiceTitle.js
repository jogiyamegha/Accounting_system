import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  invoiceTitle: {
    fontFamily: "Montserrat",
    fontWeight: "semibold",
    fontSize: 14,
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
  },
});

const InvoiceTitle = () => (
  <View style={styles.invoiceTitle}>
    <Text> </Text>
  </View>
);

export default InvoiceTitle;

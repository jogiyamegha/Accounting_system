import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  detailsContainer: {
    marginTop: 20,
    marginBottom: 20,
    minHeight: 56,
    maxHeight: 76,
  },
  billToLabel: {
    fontSize: 10,
    fontFamily: "Poppins",
    fontWeight: "normal",
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  billToColumn: {
    width: "45%",
  },
  metaDataColumn: {
    width: "45%",
    textAlign: "right",
  },
  valueText: {
    fontSize: 12,
    fontFamily: "Poppins",
    fontWeight: "semibold",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  labelText: {
    fontSize: 10,
    fontFamily: "Poppins",
    fontWeight: "normal",
  },
});

const InvoiceDetails = ({ data }) => (
  <View style={styles.detailsContainer}>
    <Text style={styles.billToLabel}>Invoice To :</Text>

    <View style={styles.detailsRow}>
      {/* Left Column */}
      <View style={styles.billToColumn}>
        <Text style={styles.valueText}>{data.userName}</Text>
        <Text style={styles.labelText}>{data.position}</Text>
      </View>

      {/* Right Column */}
      <View style={styles.metaDataColumn}>
        <Text style={styles.valueText}>{data.companyName}</Text>
        <Text style={styles.labelText}>{data.address}</Text>
      </View>
    </View>
  </View>
);

export default InvoiceDetails;

import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  invoiceSubHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: -1,
    minHeight: 48,
    marginTop: 20,
  },
  subHeader1: {
    width: 248,
    backgroundColor: "#30A9B4",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 29,
  },
  subHeaderDetails1: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexGrow: 1,
  },
  invoiceText: {
    fontSize: 20,
    fontFamily: "Poppins",
    fontWeight: "bold",
    color: "white",
  },
  invoiceNo: { color: "white", textAlign: "right" },
  invoiceNoText: { fontSize: 10, fontWeight: "normal" },
  invoiceNoNumber: { fontSize: 10, fontWeight: "semibold" },
  subHeaderDetails2: {
    width: 269,
    borderWidth: 1,
    borderColor: "#1D3557",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    textAlign: "right",
    paddingRight: 14,
  },

  dateContainer: {
    textAlign: "right",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  dateText: {
    color: "black",
    fontSize: 10,
    fontFamily: "Poppins",
    fontWeight: "normal",
    textAlign: "right",
  },
});

const InvoiceSubHeader = ({ invoiceNumber }) => (
  <View>
    <View style={styles.invoiceSubHeader}>
      <View style={styles.subHeader1}>
        <View style={styles.subHeaderDetails1}>
          <Text style={styles.invoiceText}>INVOICE</Text>
          <View style={styles.invoiceNo}>
            <Text style={styles.invoiceNoText}>Invoice No :</Text>
            <Text style={styles.invoiceNoNumber}>{invoiceNumber}</Text>
          </View>
        </View>
      </View>
      <View style={styles.subHeaderDetails2}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>Date :</Text>
          <Text style={styles.dateText}>
            {new Date()
              .toLocaleDateString("en-IN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
              .replace(/\//g, "-")}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

export default InvoiceSubHeader;

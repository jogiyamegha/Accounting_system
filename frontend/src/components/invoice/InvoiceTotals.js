import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  totals: {
    flexDirection: "row",
    justifyContent: "flex-end",
    fontSize: 10,
    fontWeight: "normal",
    fontFamily: "Poppins",
    marginTop: 20,
  },
  subTotal: { minWidth: 165, maxWidth: 215 },
  totalsDescription: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },
  total: { fontFamily: "Poppins", fontWeight: "semibold", fontSize: 12 },
  line: { borderBottomWidth: 1, borderBottomColor: "black", marginBottom: 9 },
});

// Number formatting function with commas
const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const InvoiceTotals = ({ subTotal, includeVAT }) => {
  const vat = (subTotal * 5) / 100;
  return (
    <View style={styles.totals}>
      <View style={styles.subTotal}>
        {includeVAT ? (
          <>
            <View style={styles.totalsDescription}>
              <Text>SUB TOTAL :</Text>
              <Text>AED {formatCurrency(subTotal)}</Text>
            </View>
            <View style={styles.totalsDescription}>
              <Text>VAT (5%) :</Text>
              <Text>AED {formatCurrency(vat)}</Text>
            </View>
            <View style={styles.line} />
            <View style={[styles.totalsDescription, styles.total]}>
              <Text>TOTAL :</Text>
              <Text>AED {formatCurrency(subTotal + vat)}</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.totalsDescription}>
              <Text>SUB TOTAL :</Text>
              <Text>AED {formatCurrency(subTotal)}</Text>
            </View>
            <View style={styles.line} />
            <View style={[styles.totalsDescription, styles.total]}>
              <Text>TOTAL :</Text>
              <Text>AED {formatCurrency(subTotal)}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default InvoiceTotals;

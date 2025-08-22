import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  invoiceTable: {
    display: "table",
    width: "auto",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#1D3557",
    borderTopWidth: 0.5,
    borderTopColor: "#1D3557",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    minHeight: 30,
    textAlign: "left",
    fontFamily: "Outfit",
    fontWeight: "semibold",
    fontSize: 12,
    color: "#ffffffff",
    backgroundColor: "#1D3557",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#1D3557",
    minHeight: 30,
    fontFamily: "Outfit",
    fontWeight: "normal",
    fontSize: 10,
    flexGrow: 0,
  },
  tableColDesc: { width: "240" },
  tableColQty: { width: "50" },
  tableColPrice: { width: "108" },
  tableColAmt: { width: "98" },
  tableCell: { padding: "5px 10px" },
  totalInWordsRow: {
    minHeight: 35,
  },
  totalInWordsCell: {
    padding: "10px 10px",
    fontWeight: "normal",
    fontSize: 12,
    color: "#7C7C7C",
    fontFamily: "Outfit",
    textAlign: "left",
  },
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

function numberToWords(amount) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  function convert_hundreds(num) {
    let str = "";
    if (num > 99) {
      str += ones[Math.floor(num / 100)] + " Hundred ";
      num = num % 100;
    }
    if (num > 19) {
      str += tens[Math.floor(num / 10)] + " ";
      num = num % 10;
    }
    if (num > 0) {
      str += ones[num] + " ";
    }
    return str.trim();
  }
  function convert_thousands(num) {
    if (num === 0) return "Zero";
    let str = "";
    let units = ["", "Thousand", "Million", "Billion", "Trillion"];
    let unitIndex = 0;
    while (num > 0) {
      let chunk = num % 1000;
      if (chunk) {
        str = convert_hundreds(chunk) + " " + units[unitIndex] + " " + str;
      }
      num = Math.floor(num / 1000);
      unitIndex++;
    }
    return str.trim();
  }
  if (typeof amount !== "number" || isNaN(amount)) return "";
  const [dollarsPart, filsPart] = amount.toFixed(2).split(".");
  let dollarsInWords = convert_thousands(parseInt(dollarsPart, 10));
  let filsInWords = convert_hundreds(parseInt(filsPart, 10));
  let result = `${dollarsInWords} AED`;
  if (parseInt(filsPart, 10) > 0) {
    result += ` and ${filsInWords} Fils`;
  }
  return result.trim();
}

const IntegerToWords = ({ total }) => {
  return numberToWords(total);
};

const InvoiceItemTable = ({ items, subTotal, includeVAT }) => {
  const vat = (subTotal * 5) / 100;

  return (
    <>
      <View style={styles.invoiceTable}>
        <View style={styles.tableHeader} break={false} fixed>
          <View style={styles.tableColDesc}>
            <Text style={styles.tableCell}>Description</Text>
          </View>
          <View style={styles.tableColQty}>
            <Text style={styles.tableCell}>Qty</Text>
          </View>
          <View style={styles.tableColPrice}>
            <Text style={styles.tableCell}>Unit Price (AED)</Text>
          </View>
          <View style={styles.tableColAmt}>
            <Text style={styles.tableCell}>Amount (AED)</Text>
          </View>
        </View>

        {items.map((item, index) => (
          <View style={styles.tableRow} key={index} wrap={false}>
            <View style={styles.tableColDesc}>
              <Text style={styles.tableCell}>{item.description}</Text>
            </View>
            <View style={styles.tableColQty}>
              <Text style={styles.tableCell}>{item.quantity}</Text>
            </View>
            <View style={styles.tableColPrice}>
              <Text style={styles.tableCell}>{formatCurrency(item.price)}</Text>
            </View>
            <View style={styles.tableColAmt}>
              <Text style={styles.tableCell}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.totalInWordsRow}>
        <View style={styles.totalInWordsCell}>
          <Text>
            <IntegerToWords total={includeVAT ? subTotal + vat : subTotal} />
          </Text>
        </View>
      </View>
    </>
  );
};

export default InvoiceItemTable;

import {
  Page,
  View,
  Document,
  StyleSheet,
  Font,
  Text,
} from "@react-pdf/renderer";

import InvoiceHeader from "./InvoiceHeader";
import InvoiceDetails from "./InvoiceDetails";
import InvoiceItemTable from "./InvoiceItemTable";
import InvoiceTotals from "./InvoiceTotals";
import InvoiceStamp from "./InvoiceStamp";
import InvoiceSubHeader from "./InvoiceSubHeader";
import InvoiceFooter from "./InvoiceFooter";

try {
  Font.register({
    family: "Poppins",
    fonts: [
      { src: "/fonts/Poppins-Regular.ttf", fontWeight: "normal" },
      { src: "/fonts/Poppins-SemiBold.ttf", fontWeight: "semibold" },
      { src: "/fonts/Poppins-Bold.ttf", fontWeight: "bold" },
    ],
  });
  Font.register({
    family: "Outfit",
    fonts: [
      { src: "/fonts/Outfit-Regular.ttf", fontWeight: "normal" },
      { src: "/fonts/Outfit-SemiBold.ttf", fontWeight: "semibold" },
    ],
  });
  Font.register({
    family: "Montserrat",
    fonts: [{ src: "/fonts/Montserrat-SemiBold.ttf", fontWeight: "semibold" }],
  });
} catch (error) {
  console.error(
    "Font registration failed. Make sure the font files are in /public/fonts/",
    error
  );
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Poppins",
    fontSize: 10,
    backgroundColor: "white",
    paddingTop: 30,
    paddingBottom: 48,
    paddingHorizontal: 40,
  },
  headerLine: {
    backgroundColor: "#2FA8B3",
    height: 8,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  bottomLine: {
    backgroundColor: "rgb(5, 36, 89)",
    height: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  contentWrapper: {
    flex: 1,
    flexDirection: "column",
  },
  firstPageHeaderContent: {
    height: 216,
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  spacer: {
    flexGrow: 1,
  },
  totalsContainer: {
    wrap: false,
    break: false,
    pageBreakInside: "avoid",
    flexDirection: "column",
    flexWrap: "nowrap",
    orphans: 1,
    widows: 1,
    position: "relative",
    zIndex: 1,
  },
  endOfPageBlock: {
    wrap: false,
    break: false,
    orphans: 1,
    widows: 1,
    flexDirection: "column",
    flexWrap: "nowrap",
    pageBreakInside: "avoid",
    position: "relative",
    zIndex: 1,
  },
  stampContainer: {
    height: 123,
    marginBottom: 20,
    pageBreakInside: "avoid",
  },
  footerContainer: {
    marginTop: 30,
    pageBreakInside: "avoid",
  },
});

const InvoicePDF = ({ data }) => {
  if (!data || !Array.isArray(data.items)) {
    return (
      <Document>
        <Page style={styles.page}>
          <View>
            <Text>Error: Invalid invoice data provided.</Text>
          </View>
        </Page>
      </Document>
    );
  }

  const subTotal = data.items.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const needsMultiplePages = data.items.length > 5;

  if (!needsMultiplePages) {
    // Original logic for 5 or fewer items
    return (
      <Document
        author="Al ASR Management and Consultancy"
        title={`Invoice_${data.invoiceNumber}`}
      >
        <Page size="A4" style={styles.page}>
          <View style={styles.headerLine} fixed />
          <View style={styles.bottomLine} fixed />

          <View style={styles.contentWrapper}>
            <View style={styles.firstPageHeaderContent}>
              <InvoiceHeader logoDataUrl={data.logoDataUrl} />
              <InvoiceSubHeader invoiceNumber={data.invoiceNumber} />
              <InvoiceDetails data={data} />
            </View>

            <InvoiceItemTable
              items={data.items}
              subTotal={subTotal}
              includeVAT={data.includeVAT}
            />

            <View style={styles.totalsContainer}>
              <InvoiceTotals subTotal={subTotal} includeVAT={data.includeVAT} />
            </View>

            <View style={styles.spacer} />

            <View style={styles.endOfPageBlock} break={false} wrap={false}>
              <View style={styles.stampContainer}>
                <InvoiceStamp stampDataUrl={data.stampDataUrl} />
              </View>
              <View style={styles.footerContainer}>
                <InvoiceFooter />
              </View>
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  // Logic for more than 5 items - let content flow naturally across pages
  return (
    <Document
      author="Al ASR Management and Consultancy"
      title={`Invoice_${data.invoiceNumber}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerLine} fixed />
        <View style={styles.bottomLine} fixed />

        <View style={styles.contentWrapper}>
          <View style={styles.firstPageHeaderContent}>
            <InvoiceHeader logoDataUrl={data.logoDataUrl} />
            <InvoiceSubHeader invoiceNumber={data.invoiceNumber} />
            <InvoiceDetails data={data} />
          </View>

          <InvoiceItemTable
            items={data.items}
            subTotal={subTotal}
            includeVAT={data.includeVAT}
          />

          <View style={styles.totalsContainer} break={false} wrap={false}>
            <InvoiceTotals subTotal={subTotal} includeVAT={data.includeVAT} />
          </View>

          <View style={styles.spacer} />

          <View style={styles.endOfPageBlock} break={false} wrap={false}>
            <View style={styles.stampContainer}>
              <InvoiceStamp stampDataUrl={data.stampDataUrl} />
            </View>
            <View style={styles.footerContainer}>
              <InvoiceFooter />
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;

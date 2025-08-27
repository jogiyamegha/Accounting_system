export const ADMIN_END_POINT = "http://localhost:8000/admin";
export const CLIENT_END_POINT = "http://localhost:8000/client";

export const DocumentType = (function () {
  function DocumentType() {}
  DocumentType.VATcertificate = 1;
  DocumentType.CorporateTaxDocument = 2;
  DocumentType.BankStatement = 3;
  DocumentType.Invoice = 4;
  DocumentType.auditFiles = 5;
  DocumentType.TradeLicense = 6;
  DocumentType.passport = 7;
  DocumentType.FinancialStatements = 8;
  DocumentType.BalanceSheet = 9;
  DocumentType.Payroll = 10;
  DocumentType.WPSReport = 11;
  DocumentType.ExpenseReciept = 12;
  DocumentType.Other = 13;
  return DocumentType;
})();

export const DocStatus = (function () {
  function DocStatus() {}
  DocStatus.pending = 1;
  DocStatus.approved = 2;
  DocStatus.rejected = 3;
  return DocStatus;
})();

export const BusinessType = (function (){
  function BusinessType() {};
  BusinessType.soleProprietorship = 1;
  BusinessType.Partnership = 2;
  BusinessType.LLC = 3;
  BusinessType.Corporation = 4;
  BusinessType.Cooperative = 5;
  return BusinessType;
})


export const statusMap = {
  1: "Pending",
  2: "Approved",
  3: "Rejected",
};


export const docTypeMap = {
  1: "VATcertificate",
  2: "CorporateTaxDocument",
  3: "BankStatement",
  4: "Invoice",
  5: "auditFiles",
  6: "TradeLicense",
  7: "passport",
  8: "FinancialStatements",
  9: "BalanceSheet",
  10: "Payroll",
  11: "WPSReport",
  12: "ExpenseReciept",
  13: "Other"
}

export function formDataToJSON(formData) {
  const obj = {};
  for (let [key, value] of formData.entries()) {
    obj[key] = value instanceof File ? value.name : value;
  }
  return obj;
}

export const documentType = {
  1: "VATcertificate",
  2: "CorporateTaxDocument",
  3: "BankStatement",
  4: "Invoice",
  5: "auditFiles",
  6: "TradeLicense",
  7: "passport",
  8: "Other"
}

export function generateInvoiceNumber(){
  var result = "";
        var characters = "0123456789";
        var charactersLength = characters.length;
        for (var i = 0; i < 5; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
  return result;
}
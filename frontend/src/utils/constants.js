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
  return DocumentType;
})();

export const DocStatus = (function () {
  function DocStatus() {}
  DocStatus.pending = 1;
  DocStatus.approved = 2;
  DocStatus.rejected = 3;
  return DocStatus;
})();

export const BusinessType = function () {
  function BusinessType() {}
  BusinessType.soleProprietorship = 1;
  BusinessType.Partnership = 2;
  BusinessType.LLC = 3;
  BusinessType.Corporation = 4;
  BusinessType.Cooperative = 5;
  return BusinessType;
};

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
};

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
  8: "Other",
};

export function generateInvoiceNumber() {
  var result = "";
  var characters = "0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const notificationTypeLabels = {
  1: "Upcoming Deadline",
  2: "Missing Documents",
  3: "Feedback",
  4: "Document Status",
  5: "Client Active Status",
  6: "System Update",
  7: "Payroll Reminder",
};

export const notificationIcons = {
  1: "faClock",
  2: "faFile",
  3: "faBell",
  4: "faFile",
  5: "faBell",
  6: "faBell",
  7: "faClock",
};

export const serviceTypeMap = {
  1: "VAT Services",
  2: "Corporate Tax Services",
  3: "Payroll Services",
  4: "Audit Services",
};

export const serviceStatusMap = {
  1: "Not Started",
  2: "In Progress", 
  3: "Completed", 
}

export function formatDateToDDMMYYYY(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = ("0" + date.getDate()).slice(-2);
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
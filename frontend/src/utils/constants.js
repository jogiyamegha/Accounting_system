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
  DocumentType.Other = 8;
  return DocumentType;
})();

export const DocStatus = (function () {
  function DocStatus() {}
  DocStatus.pending = 1;
  DocStatus.approved = 2;
  DocStatus.rejected = 3;
  return DocStatus;
})();


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
  8: "Other"
}

export function formDataToJSON(formData) {
  const obj = {};
  for (let [key, value] of formData.entries()) {
    obj[key] = value instanceof File ? value.name : value;
  }
  return obj;
}
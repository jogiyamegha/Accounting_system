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
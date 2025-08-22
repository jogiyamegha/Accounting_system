const ClientService = require("../../db/services/ClientService");
const {
  TableFields,
  ValidationMsg,
  DocStatus,
  DocumentType,
  docTypeMap,
} = require("../../utils/constants");
const InvoiceService = require('../../db/services/InvoiceService');
const ValidationError = require("../../utils/ValidationError");
const { sendClientInvitationEmail } = require("../../emails/email");
const Util = require("../../utils/util");
const CompanyService = require("../../db/services/CompanyService");
const DocumentService = require("../../db/services/DocumentService");
const {
  addPdfFile,
  removePdfFileById,
  Folders,
} = require("../../utils/storage");

exports.addClient = async (req) => {
  const reqBody = req.body;
  const reqUser = req.user;
  const files = req.files || [];
  const email = reqBody[TableFields.email];
  if (!email) {
    throw new ValidationError(ValidationMsg.EmailEmpty);
  }

  const clientExists = await ClientService.existsWithEmail(email);
  if (clientExists) {
    throw new ValidationError(ValidationMsg.ClientExists);
  }

  let records;
  let data = await parseAndValidateClient(reqBody, async (updatedFields) => {
    records = await ClientService.insertRecord(updatedFields);
    if (records[TableFields.email]) {
      sendClientInvitationEmail(
        records[TableFields.name_],
        records[TableFields.email],
        updatedFields[TableFields.password]
      );
    }
  });

  const clientId = records[TableFields.ID];
  let existingCompany = await CompanyService.getCompanyById(
    records[TableFields.companyId]
  )
    .withBasicInfo()
    .execute();

  let company = await parseAndValidateCompany(
    reqBody,
    undefined,
    async (updatedFields) => {
      let compamnyRecords;
      if (existingCompany) {
        compamnyRecords = await CompanyService.updateRecord(
          existingCompany[TableFields.ID],
          updatedFields
        );
      } else {
        compamnyRecords = await CompanyService.insertRecord(updatedFields);
        await ClientService.updateCompanyinProfile(
          clientId,
          compamnyRecords[TableFields.ID]
        );
      }
      return compamnyRecords;
    }
  );

  const existsWithClientId = await DocumentService.existsWithClient(clientId);

  const result = await parseAndValidateDocuments(
    reqBody,
    clientId,
    files,
    async function (payload) {
      // payload = { clientId, documents: [{ documentDetails }, ...] }
      if (!existsWithClientId) {
        return await DocumentService.insertRecord(payload);
      } else {
        return await DocumentService.upsertManyDocumentsForClient(
          clientId,
          payload.documents
        );
      }
    }
  );
};


exports.editClient = async (req) => {
    let reqBody = req.body;
    const clientId = req.params[TableFields.clientId];
 
    const client = await ClientService.getUserById(clientId).withBasicInfo().execute();
    if(!client){
        throw new ValidationError(ValidationMsg.RecordNotFound);
    }
 
 
}
 
exports.deleteClient = async (req) => {
    const clientId = req.params[TableFields.clientId];
    const client = await ClientService.getUserById(clientId).withBasicInfo().execute();
    if(!client) {
        throw new ValidationError(ValidationMsg.ClientNotExists);
    }
 
    const companyId = client[TableFields.companyId];
    const company = await CompanyService.companyExists(companyId);
    if(!company) {
        throw new ValidationError(ValidationMsg.CompanyNotExists)
    }
}
 

exports.getAllClients = async (req) => {
  // nalytics code here
  return await ClientService.listClients({
    ...req.query,
  })
    .withBasicInfo()
    .execute();
};

async function parseAndValidateClient(
  reqBody,
  onValidationCompleted = async (updatedFields) => {}
) {
  if (isFieldEmpty(reqBody[TableFields.name_])) {
    throw new ValidationError(ValidationMsg.NameEmpty);
  }
  if (isFieldEmpty(reqBody[TableFields.email])) {
    throw new ValidationError(ValidationMsg.EmailEmpty);
  }

  if (isFieldEmpty(reqBody[TableFields.phoneCountry])) {
    throw new ValidationError(ValidationMsg.PhoneCountryEmpty);
  }
  if (isFieldEmpty(reqBody[TableFields.phone])) {
    throw new ValidationError(ValidationMsg.ContactNumberEmpty);
  }

  const response = await onValidationCompleted({
    [TableFields.name_]: reqBody[TableFields.name_],
    [TableFields.email]: reqBody[TableFields.email],
    [TableFields.password]: Util.generateRandomPassword(8),
    [TableFields.position]: reqBody[TableFields.position],
    [TableFields.contact]: {
      [TableFields.phoneCountry]: reqBody[TableFields.phoneCountry],
      [TableFields.phone]: reqBody[TableFields.phone],
    },
    [TableFields.userType]: 2,
  });
  return response;
}

async function parseAndValidateCompany(
  reqBody,
  existingCompany = {},
  onValidationCompleted = async (updatedFields) => {}
) {
  if (isFieldEmpty(reqBody.companyName)) {
    throw new ValidationError(ValidationMsg.NameEmpty);
  }
  if (isFieldEmpty(reqBody.companyEmail)) {
    throw new ValidationError(ValidationMsg.EmailEmpty);
  }

  if (isFieldEmpty(reqBody[TableFields.zipcode])) {
    throw new ValidationError(ValidationMsg.ZipcodeEmpty);
  }
  if (isFieldEmpty(reqBody[TableFields.licenseType])) {
    throw new ValidationError(ValidationMsg.LicenseTypeEmpty);
  }
  if (isFieldEmpty(reqBody[TableFields.licenseNumber])) {
    throw new ValidationError(ValidationMsg.LicenseNumberEmpty);
  }
  if (isFieldEmpty(reqBody[TableFields.licenseIssueDate])) {
    throw new ValidationError(ValidationMsg.LicenseIssueDateEmpty);
  }
  if (isFieldEmpty(reqBody[TableFields.licenseExpiry])) {
    throw new ValidationError(ValidationMsg.LicenseExpiryEmpty);
  }

  if (isFieldEmpty(reqBody[TableFields.taxRegistrationNumber])) {
    throw new ValidationError(ValidationMsg.TaxRegistrationNumberEmpty);
  }
  if (isFieldEmpty(reqBody[TableFields.businessType])) {
    throw new ValidationError(ValidationMsg.BusinessTypeEmpty);
  }

  const response = await onValidationCompleted({
    [TableFields.name_]: reqBody[TableFields.name_],
    [TableFields.email]: reqBody[TableFields.email],
    [TableFields.address]: {
      [TableFields.addressLine1]: reqBody[TableFields.addressLine1],
      [TableFields.addressLine2]: reqBody[TableFields.addressLine2],
      [TableFields.street]: reqBody[TableFields.street],
      [TableFields.landmark]: reqBody[TableFields.landmark],
      [TableFields.zipcode]: reqBody[TableFields.zipcode],
      [TableFields.city]: reqBody[TableFields.city],
      [TableFields.state]: reqBody[TableFields.state],
      [TableFields.country]: reqBody[TableFields.country],
    },
    [TableFields.licenseDetails]: {
      [TableFields.licenseType]: reqBody[TableFields.licenseType],
      [TableFields.licenseNumber]: reqBody[TableFields.licenseNumber],
      [TableFields.licenseIssueDate]: reqBody[TableFields.licenseIssueDate],
      [TableFields.licenseExpiry]: reqBody[TableFields.licenseExpiry],
    },

    [TableFields.taxRegistrationNumber]:
      reqBody[TableFields.taxRegistrationNumber],
    [TableFields.businessType]: reqBody[TableFields.businessType],
  });

  return response;
}

async function parseAndValidateDocuments(
  reqBody,
  clientId,
  files,
  onValidationCompleted = async () => {}
) {
  if (!clientId) {
    throw new ValidationError(ValidationMsg.ClientIdEmpty);
  }

  let docs = [];

  for (const file of files) {
    // file.fieldname will be like: "documents[0][file]"
    const match = file.fieldname.match(/documents\[(\d+)\]\[file\]/);

    if (match) {
      const index = match[1];

      // ✅ Get documentType from reqBody, not files
      const documentType = reqBody.documents?.[index]?.documentType || null;

      let docType = null;
      if (typeof documentType === "string") {
        const docTypeMap = {
          VATcertificate: DocumentType.VATcertificate,
          CorporateTaxDocument: DocumentType.CorporateTaxDocument,
          BankStatement: DocumentType.BankStatement,
          Invoice: DocumentType.Invoice,
          auditFiles: DocumentType.auditFiles,
          TradeLicense: DocumentType.TradeLicense,
          passport: DocumentType.passport,
          Other: DocumentType.Other,
        };
        docType = docTypeMap[documentType];
      }

      // ✅ Upload file via addPdfFile instead of using file.path
      let persistedFileKey = null;
      try {
        const newFileKey = await addPdfFile(
          Folders.ClientDocument,
          file.originalname,
          file.buffer
        );
        persistedFileKey = newFileKey;
      } catch (err) {
        console.error("Error uploading file:", err);
        throw new ValidationError("File upload failed");
      }

      docs.push({
        [TableFields.documentDetails]: {
          [TableFields.docStatus]: DocStatus.pending, // default
          [TableFields.documentType]: docType,
          [TableFields.document]: persistedFileKey, // ✅ store uploaded file key
          [TableFields.uploadedAt]: Date.now(),
        },
      });
    }
  }

  const payload = {
    [TableFields.clientId]: clientId,
    [TableFields.documents]: docs,
  };

  return await onValidationCompleted(payload);
}

function isFieldEmpty(existingField) {
  if (existingField) {
    return false;
  }
  return true;
}

exports.getClientDetails = async (req, res) => {
  const clientId = req.params[TableFields.clientId];

  const client = await ClientService.getUserById(clientId)
    .withBasicInfo()
    .execute();
  const associatedCompanyId = client[TableFields.companyId];
  const associatedCompany = await CompanyService.getCompanyById(
    associatedCompanyId
  )
    .withBasicInfo()
    .execute();

  const document = await DocumentService.getDocsByClientId(clientId)
    .withBasicInfo()
    .execute();
  const invoice = await InvoiceService.getInvoiceByClientId(clientId)
    .withBasicInfo()
    .execute();
  console.log(invoice);
  
  return res.json({
    client,
    company: associatedCompany,
    document,
    invoice
  });


};




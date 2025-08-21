const ClientService = require('../../db/services/ClientService');
const { TableFields, ValidationMsg, DocStatus, DocumentType } = require('../../utils/constants');

const ValidationError = require('../../utils/ValidationError');
const { sendClientInvitationEmail} = require('../../emails/email');
const Util = require('../../utils/util');
const CompanyService = require('../../db/services/CompanyService');
const DocumentService = require('../../db/services/DocumentService');
const { addPdfFile, removePdfFileById, Folders } = require('../../utils/storage');



exports.addClient = async (req) => {
    const reqBody = req.body;
    console.log("reqBody",reqBody);
    const reqUser = req.user;
    // const files = req.files || [];
    const email = reqBody[TableFields.email];
    if(!email) {
        throw new ValidationError(ValidationMsg.EmailEmpty);
    }

    const clientExists = await ClientService.existsWithEmail(email);
    if(clientExists) {
        throw new ValidationError(ValidationMsg.ClientExists)
    }

    let records;
    let data = await parseAndValidateClient(
        reqBody,
        async (updatedFields) => {
            records = await ClientService.insertRecord(
                updatedFields
            );
            if(records[TableFields.email]) {
                sendClientInvitationEmail(
                    records[TableFields.name_],
                    records[TableFields.email],
                    updatedFields[TableFields.password]
                )
            }
        }
    )
    

    const clientId = records[TableFields.ID];
    let existingCompany = await CompanyService.getCompanyById(records[TableFields.companyId]).withBasicInfo().execute()

    // let company = await parseAndValidateCompany(
    //     reqBody,
    //     undefined,
    //     async(updatedFields) => {
    //         let compamnyRecords;
    //         if(existingCompany){
    //             compamnyRecords = await CompanyService.updateRecord(existingCompany[TableFields.ID], updatedFields)
    //         }else{

    //             compamnyRecords = await CompanyService.insertRecord(
    //                 updatedFields
    //             );
    //             await ClientService.updateCompanyinProfile(reqUser[TableFields.ID], compamnyRecords[TableFields.ID])
    //         }
    //         return compamnyRecords;
    //     }
    // )

    const existsWithClientId = await DocumentService.existsWithClient(clientId);

    console.log(company);


    // const result = await parseAndValidateDocument(
    //     reqBody,
    //     reqUser,
    //     document,
    //     async function (updatedFields) {
    //         if (!existsWithClientId) {
    //             return await DocumentService.insertRecord(updatedFields);
    //         } else {
    //             return await DocumentService.upsertDocumentForClient(clientId, updatedFields);
    //         }
    //     }
    // );
    // const result = await parseAndValidateDocuments(
    //   reqBody,
    //   clientId,
    //   files,
    //   async function (payload) {
    //     // payload = { clientId, documents: [{ documentDetails }, ...] }
    //     if (!existsWithClientId) {
    //       return await DocumentService.insertRecord(payload);
    //     } else {
    //       return await DocumentService.upsertManyDocumentsForClient(clientId, payload.documents);
    //     }
    //   }
    // )

}

exports.getAllClients = async (req) => {
    console.log("object");
  // nalytics code here
  return await ClientService.listClients({
    ...req.query,
  })
    .withBasicInfo()
    .execute();
};


function coerceDocType(raw) {
  // Accept "2" or "VATcertificate" etc., map to numeric if your enum is numeric.
  if (raw === undefined || raw === null || raw === '') return null;
  const n = Number(raw);
  if (Number.isInteger(n)) return n;
  // If your DocumentType = { VATcertificate: 1, CorporateTaxDocument: 2, ... }
  if (typeof raw === 'string' && DocumentType && raw in DocumentType) {
    return DocumentType[raw];
  }
  return null;
}



async function parseAndValidateClient(
    reqBody,
    onValidationCompleted = async (updatedFields) => {}
) {

    if(isFieldEmpty(reqBody[TableFields.name_])){
        throw new ValidationError(ValidationMsg.NameEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.email])){
        throw new ValidationError(ValidationMsg.EmailEmpty);
    }

    if(isFieldEmpty(reqBody[TableFields.phoneCountry])){
        throw new ValidationError(ValidationMsg.PhoneCountryEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.phone])){
        throw new ValidationError(ValidationMsg.ContactNumberEmpty);
    }

    const response = await onValidationCompleted({
        [TableFields.name_] : reqBody[TableFields.name_],
        [TableFields.email] : reqBody[TableFields.email],
        [TableFields.password] : Util.generateRandomPassword(8),
        [TableFields.position] : reqBody[TableFields.position],
        [TableFields.contact]: {
            [TableFields.phoneCountry] : reqBody[TableFields.phoneCountry],
            [TableFields.phone]: reqBody[TableFields.phone]
        },
        [TableFields.userType] : 2,
    })
    return response;
}

async function parseAndValidateCompany(
    reqBody,
    existingCompany = {},
    onValidationCompleted = async(updatedFields) => {}
){
    if(isFieldEmpty(reqBody.companyName)){
        throw new ValidationError(ValidationMsg.NameEmpty);
    }
    if(isFieldEmpty(reqBody.companyEmail)){
        throw new ValidationError(ValidationMsg.EmailEmpty);
    }
    
    if(isFieldEmpty(reqBody[TableFields.zipcode])){
        throw new ValidationError(ValidationMsg.ZipcodeEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.licenseType])){
        throw new ValidationError(ValidationMsg.LicenseTypeEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.licenseNumber])){
        throw new ValidationError(ValidationMsg.LicenseNumberEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.licenseIssueDate])){
        throw new ValidationError(ValidationMsg.LicenseIssueDateEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.licenseExpiry])){
        throw new ValidationError(ValidationMsg.LicenseExpiryEmpty);
    }
    
    if(isFieldEmpty(reqBody[TableFields.taxRegistrationNumber])){
        throw new ValidationError(ValidationMsg.TaxRegistrationNumberEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.businessType])){
        throw new ValidationError(ValidationMsg.BusinessTypeEmpty);
    }
 
   
    const response = await onValidationCompleted({
        [TableFields.name_] : reqBody[TableFields.name_],
        [TableFields.email] : reqBody[TableFields.email],
        [TableFields.address]:{
            [TableFields.addressLine1]: reqBody[TableFields.addressLine1],
            [TableFields.addressLine2]: reqBody[TableFields.addressLine2],
            [TableFields.street]: reqBody[TableFields.street],
            [TableFields.landmark]:reqBody[TableFields.landmark],
            [TableFields.zipcode]: reqBody[TableFields.zipcode],
            [TableFields.city]: reqBody[TableFields.city],
            [TableFields.state]:reqBody[TableFields.state],
            [TableFields.country]: reqBody[TableFields.country]
        },
        [TableFields.licenseDetails] : {
            [TableFields.licenseType] : reqBody[TableFields.licenseType],
            [TableFields.licenseNumber]: reqBody[TableFields.licenseNumber],
            [TableFields.licenseIssueDate]: reqBody[TableFields.licenseIssueDate] ,
            [TableFields.licenseExpiry]: reqBody[TableFields.licenseExpiry]
        },
        
        [TableFields.taxRegistrationNumber] : reqBody[TableFields.taxRegistrationNumber],
        [TableFields.businessType] : reqBody[TableFields.businessType],
        
 
    })
   
 
    return response;
 
}

// async function parseAndValidateDocument(reqBody, reqUser, providedFile, onValidationCompleted = async () => {}) {
//     if (!reqUser[TableFields.ID]) {
//         throw new ValidationError(ValidationMsg.ClientIdEmpty);
//     }

//     if (!providedFile) {
//         throw new ValidationError(ValidationMsg.FileRequired);
//     }

//     if (!reqBody[TableFields.documentType]) {
//         throw new ValidationError(ValidationMsg.DocumentTypeRequired);
//     }

//     // File validation
//     if (providedFile.mimetype !== 'application/pdf') {
//         throw new ValidationError(ValidationMsg.OnlyPdfAllowed || "Only PDF files are allowed");
//     }
//     const MAX_SIZE = 10 * 1024 * 1024; // 5MB
//     if (providedFile.size > MAX_SIZE) {
//         throw new ValidationError(ValidationMsg.FileTooLarge || "File exceeds maximum size limit");
//     }

//     let persistedFileKey = null;

//     try {
//         // -------- Upload File --------
//         const newFileKey = await addPdfFile(
//             Folders.ClientDocument,
//             providedFile.originalname,
//             providedFile.buffer
//         );
//         persistedFileKey = newFileKey;

//         // -------- Build Document Details --------
//         const documentDetails = {
//             [TableFields.docStatus]: reqBody[TableFields.docStatus] || DocStatus.pending,
//             [TableFields.documentType]: reqBody[TableFields.documentType],
//             [TableFields.document]: persistedFileKey,
//             // [TableFields.comments]: reqBody[TableFields.comments] || "",
//             [TableFields.uploadedAt]: new Date()
//         };

//         let docDetails = {
//             documentDetails
//         }

//         const record = {
//             [TableFields.clientId]: reqUser[TableFields.ID],
//             [TableFields.documents]: [docDetails] // always array of one
//         };


//         const dbResponse = await onValidationCompleted(record);
//         return dbResponse;

//     } catch (error) {
//         if (persistedFileKey) {
//             await removePdfFileById(Folders.ClientDocument, persistedFileKey);
//         }
//         throw error;
//     }
// }

// async function parseAndValidateDocuments(
//   reqBody,
//   clientId,
//   files,
//   onValidationCompleted = async () => {}
// ) {
//   if (!clientId) {
//     throw new ValidationError(ValidationMsg.ClientIdEmpty);
//   }

//   if (!Array.isArray(files) || files.length === 0) {
//     throw new ValidationError(ValidationMsg.FileRequired);
//   }

//   // Collect: index -> { file, documentType }
//   // Multer gives files with fieldname like "documents[3][file]"
//   const fileByIndex = new Map();
//   const typeByIndex = new Map();

//   // 1) Index all files
//   const fileIndexRegex = /^documents\[(\d+)\]\[file\]$/;
//   for (const f of files) {
//     const m = f.fieldname.match(fileIndexRegex);
//     if (m) fileByIndex.set(Number(m[1]), f);
//   }

//   // 2) Read matching documentType from reqBody
//   // reqBody keys look like "documents[3][documentType]"
//   for (const [k, v] of Object.entries(reqBody)) {
//     const mt = k.match(/^documents\[(\d+)\]\[documentType\]$/);
//     if (mt) typeByIndex.set(Number(mt[1]), v);
//   }

//   if (fileByIndex.size === 0) {
//     throw new ValidationError(ValidationMsg.FileRequired);
//   }

//   const MAX_SIZE = 10 * 1024 * 1024; // 10MB
//   const toCleanup = []; // uploaded file keys if later failure
//   const documents = [];

//   try {
//     for (const [idx, file] of fileByIndex.entries()) {
//       const rawType = typeByIndex.get(idx);
//       const docType = coerceDocType(rawType);

//       if (docType === null) {
//         throw new ValidationError(ValidationMsg.DocumentTypeRequired);
//       }
//       if (file.mimetype !== 'application/pdf') {
//         throw new ValidationError(ValidationMsg.OnlyPdfAllowed || 'Only PDF files are allowed');
//       }
//       if (file.size > MAX_SIZE) {
//         throw new ValidationError(ValidationMsg.FileTooLarge || 'File exceeds maximum size limit');
//       }

//       // Upload one-by-one; keep keys for rollback on error
//       const key = await addPdfFile(Folders.ClientDocument, file.originalname, file.buffer);
//       toCleanup.push(key);

//       documents.push({
//         [TableFields.documentDetails]: {
//           [TableFields.docStatus]: reqBody[TableFields.docStatus] || DocStatus.pending,
//           [TableFields.documentType]: docType,
//           [TableFields.document]: key,
//           [TableFields.uploadedAt]: new Date(),
//         },
//       });
//     }

//     const payload = {
//       [TableFields.clientId]: clientId,
//       [TableFields.documents]: documents,
//     };

//     const dbResp = await onValidationCompleted(payload);
//     return dbResp;
//   } catch (err) {
//     // rollback uploaded files
//     await Promise.allSettled(
//       toCleanup.map((k) => removePdfFileById(Folders.ClientDocument, k))
//     );
//     throw err;
//   }
// }

function isFieldEmpty(existingField) {
    if (existingField) {
        return false;
    }
    return true;
}
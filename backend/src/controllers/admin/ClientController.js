const ClientService = require('../../db/services/ClientService');
const { TableFields, ValidationMsg } = require('../../utils/constants');

const ValidationError = require('../../utils/ValidationError');
const { sendClientInvitationEmail} = require('../../emails/email');
const Util = require('../../utils/util');
const CompanyService = require('../../db/services/CompanyService');
const DocumentService = require('../../db/services/DocumentService');

exports.addClient = async (req) => {
    const reqBody = req.body;
    const reqUser = req.user;
    const email = reqBody[TableFields.email];
    if(!email) {
        throw new ValidationError(ValidationMsg.EmailEmpty);
    }

    const clientExists = await ClientService.existsWithEmail(email);
    if(clientExists) {
        throw new ValidationError(ValidationMsg.ClientExists)
    }

    let data = await parseAndValidateClient(
        reqBody,
        async (updatedFields) => {
            let records = await ClientService.insertRecord(
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

    const clientId = data[TableFields.ID];
    let existingCompany = await CompanyService.getCompanyById(user[TableFields.companyId]).withBasicInfo().execute()

    let company = await parseAndValidateCompany(
        reqBody,
        undefined,
        async(updatedFields) => {
            let records;
            if(existingCompany){
                records = await CompanyService.updateRecord(existingCompany[TableFields.ID], updatedFields)
            }else{

                records = await CompanyService.insertRecord(
                    updatedFields
                );
                await ClientService.updateCompanyinProfile(reqUser[TableFields.ID], records[TableFields.ID])
            }
            return records;
        }
    )

    const existsWithClientId = await DocumentService.existsWithClient(clientId);

    const result = await parseAndValidateDocument(
        reqBody,
        reqUser,
        document,
        async function (updatedFields) {
            if (!existsWithClientId) {
                return await DocumentService.insertRecord(updatedFields);
            } else {
                return await DocumentService.upsertDocumentForClient(clientId, updatedFields);
            }
        }
    );

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
    const response = await onValidationCompleted({
        [TableFields.name_] : reqBody[TableFields.name_],
        [TableFields.email] : reqBody[TableFields.email],
        [TableFields.password] : Util.generateRandomPassword(8),
        [TableFields.position] : reqBody[TableFields.position],
        // [TableFields.companyName] : reqBody[TableFields.companyName],
        [TableFields.userType] : 2
    })
    return response;
}

async function parseAndValidateCompany(
    reqBody,
    existingCompany = {},
    onValidationCompleted = async(updatedFields) => {}
){
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
    if(isFieldEmpty(reqBody[TableFields.startDate])){
        throw new ValidationError(ValidationMsg.StartDateEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.endDate])){
        throw new ValidationError(ValidationMsg.EndDateEmpty);
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
            [TableFields.licenseIssueDate]: Util.parseDateString(reqBody[TableFields.licenseIssueDate]) ,
            [TableFields.licenseExpiry]: Util.parseDateString(reqBody[TableFields.licenseExpiry])
        },
        [TableFields.financialYear]:{
            [TableFields.startDate]: Util.parseDateString(reqBody[TableFields.startDate]),
            [TableFields.endDate]: Util.parseDateString(reqBody[TableFields.endDate])
        },
        [TableFields.taxRegistrationNumber] : reqBody[TableFields.taxRegistrationNumber],
        [TableFields.businessType] : reqBody[TableFields.businessType],
        [TableFields.contactPerson]:{
            [TableFields.name_]: reqBody.contactPersonName,
            [TableFields.contact]: {
                [TableFields.phoneCountry] : reqBody[TableFields.phoneCountry],
                [TableFields.phone]: reqBody[TableFields.phone]
            }
        }
 
    })
   
 
    return response;
 
}

async function parseAndValidateDocument(reqBody, reqUser, providedFile, onValidationCompleted = async () => {}) {
    if (!reqUser[TableFields.ID]) {
        throw new ValidationError(ValidationMsg.ClientIdEmpty);
    }

    if (!providedFile) {
        throw new ValidationError(ValidationMsg.FileRequired);
    }

    if (!reqBody[TableFields.documentType]) {
        throw new ValidationError(ValidationMsg.DocumentTypeRequired);
    }

    // File validation
    if (providedFile.mimetype !== 'application/pdf') {
        throw new ValidationError(ValidationMsg.OnlyPdfAllowed || "Only PDF files are allowed");
    }
    const MAX_SIZE = 10 * 1024 * 1024; // 5MB
    if (providedFile.size > MAX_SIZE) {
        throw new ValidationError(ValidationMsg.FileTooLarge || "File exceeds maximum size limit");
    }

    let persistedFileKey = null;

    try {
        // -------- Upload File --------
        const newFileKey = await addPdfFile(
            Folders.ClientDocument,
            providedFile.originalname,
            providedFile.buffer
        );
        persistedFileKey = newFileKey;

        // -------- Build Document Details --------
        const documentDetails = {
            [TableFields.docStatus]: reqBody[TableFields.docStatus] || DocStatus.pending,
            [TableFields.documentType]: reqBody[TableFields.documentType],
            [TableFields.document]: persistedFileKey,
            // [TableFields.comments]: reqBody[TableFields.comments] || "",
            [TableFields.uploadedAt]: new Date()
        };

        let docDetails = {
            documentDetails
        }

        const record = {
            [TableFields.clientId]: reqUser[TableFields.ID],
            [TableFields.documents]: [docDetails] // always array of one
        };


        const dbResponse = await onValidationCompleted(record);
        return dbResponse;

    } catch (error) {
        if (persistedFileKey) {
            await removePdfFileById(Folders.ClientDocument, persistedFileKey);
        }
        throw error;
    }
}

function isFieldEmpty(existingField) {
    if (existingField) {
        return false;
    }
    return true;
}
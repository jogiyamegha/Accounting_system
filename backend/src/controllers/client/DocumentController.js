const { addPdfFile, removeFileById } = require('../../utils/storage');
const DocumentService = require('../../db/services/DocumentService');
const { Folders } = require('../../utils/metadata');
const { TableFields, ValidationMsg, DocStatus } = require('../../utils/constants');
const ValidationError = require('../../utils/ValidationError');

exports.addDocument = async (req) => {
    const reqBody = req.body;
    const reqUser = req.user;
    const document = req.file;
    const clientId = reqUser[TableFields.ID];

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
    return result;
};


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
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
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
            [TableFields.comments]: reqBody[TableFields.comments] || "",
            [TableFields.uploadedAt]: new Date()
        };

        let docDetails = {
            documentDetails
        }

        const record = {
            [TableFields.clientId]: reqUser[TableFields.ID],
            [TableFields.documents]: [docDetails] // always array of one
        };


        // -------- Call Callback (DB insert/update) --------
        const dbResponse = await onValidationCompleted(record);
        return dbResponse;

    } catch (error) {
        // -------- Rollback File on Failure --------
        if (persistedFileKey) {
            await removeFileById(Folders.ClientDocument, persistedFileKey);
        }
        throw error;
    }
}



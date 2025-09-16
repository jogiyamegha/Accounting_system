const ClientService = require("../../db/services/ClientService");
const DocumentService = require("../../db/services/DocumentService");
const {
    TableFields,
    ValidationMsg,
    TableNames,
    DocStatus,
    DocumentType,
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const Email = require("../../emails/email");
const ServiceManager = require("../../db/serviceManager");
const { addPdfFile, Folders } = require("../../utils/storage");

exports.getDocumentsForAdmin = async (req) => {
    const email = req.body.email;
    const user = await ClientService.findByEmail(email).withBasicInfo().execute();

    if (!user) throw new ValidationError(ValidationMsg.RecordNotFound);

    let clientId = user[TableFields.ID];

    const allDocs = await DocumentService.getDocsByClientId(clientId)
        .withBasicInfo()
        .execute();
    // let docs = allDocs[TableFields.documents];

    return allDocs;
};

exports.updateDocumentStatus = async (req) => {
    const clientId = req.params.clientId;
    const documentId = req.body.docId;
    const docStatus = req.body.status;
    const comment = req.body.comments;

    const updatedDoc = await DocumentService.updateDocStatus(
        clientId,
        documentId,
        docStatus,
        comment
    );

    const user = await ClientService.getUserById(clientId)
        .withBasicInfo()
        .execute();

    if (!user) throw new ValidationError(ValidationMsg.RecordNotFound);

    // Email.sendDocStatusMail(
    //     user[TableFields.name_],
    //     user[TableFields.email],
    //     docStatus,
    //     comment
    // );
    return updatedDoc;
};

exports.addClientDocument = async (req) => {
    const reqBody = req.body;
    const document = req.file;
    const { clientId } = req.params;

    // const existsWithClientId = await DocumentService.existsWithClient(clientId);

    const result = await parseAndValidateDocuments(
        reqBody,
        clientId,
        document,
        async function (updatedFields) {
            let record = await DocumentService.upsertDocumentForClient(
                clientId,
                updatedFields
            );
            return record;
        }
    );
    return result;
};

exports.getAllDocuments = async (req) => {
    // Fetch raw records
    const result = await DocumentService.listDocuments({
        ...req.query,
        [TableFields.deleted]: false, // exclude root-level deleted
    })
        .withBasicInfo()
        .execute();

    // Enrich each record with client info & filter out deleted docs
    const enrichedRecords = await Promise.all(
        result.records.map(async (record) => {
            let clientInfo = null;

            if (record[TableFields.clientId]) {
                clientInfo = await ClientService.getUserById(
                    record[TableFields.clientId]
                )
                    .withBasicInfo()
                    .execute();
            }

            // Convert mongoose doc -> plain object
            const plainRecord = record.toObject?.() || record;

            // Filter out documents where documentDetails.deleteDoc === true
            const filteredDocs = (plainRecord[TableFields.documents] || []).filter(
                (doc) =>
                    doc[TableFields.documentDetails]?.[TableFields.deleteDoc] === false
            );

            return {
                ...plainRecord,
                [TableFields.documents]: filteredDocs,
                client: clientInfo ? clientInfo.toObject?.() || clientInfo : null,
            };
        })
    );

    return {
        total: result.total,
        records: enrichedRecords,
    };
};

exports.getUploadStats = async (req) => {
    try {
        const stats = await DocumentService.getWeeklyUploadStats();
        return stats;
    } catch (error) {
        console.error("Error fetching upload stats:", error);
    }
};

exports.getClientDocuments = async (req) => {
    try {
        const { clientId, serviceType } = req.params;
        const data = await DocumentService.getClientDocumentsByService(
            clientId,
            serviceType
        );

        return data;
    } catch (err) {
        console.error("Error fetching documents:", err);
        throw new ValidationError(ValidationMsg.RecordNotFound);
    }
};

exports.deleteDocument = async (req) => {
    let clientId = req.body.clientId;
    let documentId = req.body.docId;
    const document = await DocumentService.getDocsByClientId(clientId)
        .withBasicInfo()
        .execute();

    if (document) {
        return await DocumentService.deleteDocFromArray(
            clientId,
            documentId,
            document[TableFields.documents]
        );
    }
};

async function parseAndValidateDocuments(
    reqBody,
    clientId,
    file,
    onValidationCompleted = async () => { }
) {
    if (!clientId) {
        throw new ValidationError(ValidationMsg.ClientIdEmpty);
    }

    let docs = [];

    // for (const file of files) {
    // file.fieldname will be like: "documents[0][file]"
    // const match = file.fieldname.match(/documents\[(\d+)\]\[file\]/);

    // if (match) {
    //   const index = match[1];

    // ✅ Get documentType from reqBody, not files
    const documentType = reqBody.documentType || null;



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
            [TableFields.documentType]: documentType,
            [TableFields.document]: persistedFileKey,
            [TableFields.uploadedAt]: Date.now(),
        },
    });
    // }
    // }

    const payload = {
        [TableFields.clientId]: clientId,
        [TableFields.documents]: docs,
    };


    return await onValidationCompleted(payload);
}

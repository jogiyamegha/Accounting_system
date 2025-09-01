const ClientService = require("../../db/services/ClientService");
const DocumentService = require("../../db/services/DocumentService");
const { TableFields, ValidationMsg, TableNames } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const Email = require("../../emails/email");
const ServiceManager = require('../../db/serviceManager')

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

  Email.sendDocStatusMail(
    user[TableFields.name_],
    user[TableFields.email],
    docStatus,
    comment
  );
  return updatedDoc;
};

exports.addClientDocument = async (req) => {
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
        return await DocumentService.upsertDocumentForClient(
          clientId,
          updatedFields
        );
      }
    }
  );
  return result;
};

exports.getAllDocuments = async (req) => {
  const result = await DocumentService.listDocuments({
    ...req.query,
  })
    .withBasicInfo()
    .execute();

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

      return {
        ...(record.toObject?.() || record), // in case record is mongoose doc
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
    // console.log("stats",stats)
    return stats;

  } catch (error) {
    console.error("Error fetching upload stats:", error);
  }
}

exports.deleteDocument = async (req) => {
    let clientId = req.body.clientId;
    let documentId =  req.body.docId;
  const document = await DocumentService.getDocsByClientId(clientId)
    .withBasicInfo()
    .execute();

  if (document) {
    
    await DocumentService.deleteDocFromArray(clientId, documentId, document[TableFields.documents])
  }
};

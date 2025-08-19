const ClientService = require('../../db/services/ClientService');
const DocumentService = require('../../db/services/DocumentService');
const {TableFields, ValidationMsg} = require('../../utils/constants');
const ValidationError = require('../../utils/ValidationError');
const Email = require('../../emails/email') 


exports.getDocumentsForAdmin = async (req) => {
    const email = req.body.email;
    const user = await ClientService.findByEmail(email).withBasicInfo().execute();

    if (!user) throw new ValidationError(ValidationMsg.RecordNotFound);

    let clientId = user[TableFields.ID];

    const allDocs = await DocumentService.getDocsByClientId(clientId).withBasicInfo().execute();
    // let docs = allDocs[TableFields.documents];

    return allDocs;

}


exports.updateDocumentStatus = async (req) => {
    const clientId = req.params.clientId;
    const documentId = req.params.documentId;
    const docStatus = req.body.status;
    const comment = req.body.comments;

    const updatedDoc = await DocumentService.updateDocStatus(clientId, documentId, docStatus, comment)

    const user = await ClientService.getUserById(clientId).withBasicInfo().execute();

    if (!user) throw new ValidationError(ValidationMsg.RecordNotFound);

    Email.sendDocStatusMail(user[TableFields.name_], user[TableFields.email], docStatus, comment )
    return updatedDoc;

    

}

const DocumentService = require('../../db/services/DocumentService');
const {TableFields} = require('../../utils/constants');

exports.updateDocumentStatus = async (req) => {
    const clientId = req.params.clientId;
    const documentId = req.params.documentId;
    const docStatus = req.body.status;

    const updatedDoc = await DocumentService.updateDocStatus(clientId, documentId, docStatus)

    return updatedDoc;

}
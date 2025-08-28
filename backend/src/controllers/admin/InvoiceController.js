const { MongoUtil } = require("../../db/mongoose");
const ClientService = require("../../db/services/ClientService");
const InvoiceService = require("../../db/services/InvoiceService");
const { TableFields, ValidationMsg } = require("../../utils/constants");
const {
    addPdfFile,
    removePdfFileById,
    Folders,
} = require("../../utils/storage");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");
const path = require('path');
 
exports.addInvoice = async (req) => {
    const reqBody = req.body;
    const reqUser = req.user;
    const clientId = req.params.clientId;
    const files = req.files;
    
    const client = await ClientService.getUserById(MongoUtil.toObjectId(clientId))
        .withBasicInfo()
        .execute();
    if (!client) throw new ValidationError(ValidationMsg.RecordNotFound);
    
    const existWithCliendId = await InvoiceService.existsWithClient(
        MongoUtil.toObjectId(clientId)
    );
    const result = await parseAndValidateInvoice(
        reqBody,
        client,
        files,
        async function (payload) {
        if (!existWithCliendId) {
            return await InvoiceService.insertRecord(payload);
        } else {
            return await InvoiceService.upsertInvoiceForClient(
                clientId,
                payload.invoiceList
            );
        }
        }
    );
    return result;
};
    
async function parseAndValidateInvoice(
    reqBody,
    client,
    files,
    onValidationCompleted = async () => {}
) {
    if (!client[TableFields.ID]) {
        throw new ValidationError(ValidationMsg.ClientIdEmpty);
    }
    
 
    let invsList = [];
    
    for (const file of files) {
        // const match = file.fieldname.match(/invoices\[(\d+)\]\[file\]/);
    
        // if (match) {
        // const index = match[1];
    
        let persistedFileKey = null;
        try {
            const newFileKey = await addPdfFile(
                Folders.ClientInvoice,
                file.originalname,
                file.buffer
            );
            persistedFileKey = newFileKey;
        } catch (err) {
            console.log("Error in saving invoice:", err);
            throw new ValidationError("File Generation failed");
        }

        const fileNameWithoutExt = path.parse(file.originalname).name;

    
            invsList.push({
                [TableFields.invoice]: persistedFileKey,
                [TableFields.invoiceNumber]: fileNameWithoutExt,
 
            });
        
    }
    
    const payload = {
        [TableFields.clientId]: client[TableFields.ID],
        [TableFields.invoiceList]: invsList,
    }
    
    return await onValidationCompleted(payload);
    
}
    
    
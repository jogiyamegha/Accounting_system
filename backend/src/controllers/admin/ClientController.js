const ClientService = require('../../db/services/ClientService');
const { TableFields, ValidationMsg } = require('../../utils/constants');
const ValidationError = require('../../utils/ValidationError');
const { sendClientInvitationEmail} = require('../../emails/email');
const Util = require('../../utils/util');

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
    return data;
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
        // [TableFields.companyName] : reqBody[TableFields.companyName],
        [TableFields.userType] : 2
    })
    return response;
}

function isFieldEmpty(existingField) {
    if (existingField) {
        return false;
    }
    return true;
}
const ClientService = require('../../db/services/ClientService');
const { TableFields, ValidationMsg } = require('../../utils/constants');
const ValidationError = require('../../utils/ValidationError');
const { sendClientInvitationEmail} = require('../../emails/email');

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
        undefined,
        async (updatedFields) => {
            let records = await ClientService.insertRecord(
                updatedFields
            );
            if(records[TableFields.email]) {
                sendClientInvitationEmail(
                    records[TableFields.name_],
                    records[TableFields.email],
                    reqBody[TableFields.password]
                )
            }
        }
    )

    return data;
}

async function parseAndValidateClient(
    reqBody,
    existingClient = {},
    onValidationCompleted = async (updatedFields) => {}
) {

    if(isFieldEmpty(reqBody[TableFields.name_])){
        throw new ValidationError(ValidationMsg.NameEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.email])){
        throw new ValidationError(ValidationMsg.EmailEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.password])){
        throw new ValidationError(ValidationMsg.PasswordEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.companyName])){

        throw new ValidationError(ValidationMsg.CompanyNameEmpty);
    }
    const response = await onValidationCompleted({
        [TableFields.name_] : reqBody[TableFields.name_],
        [TableFields.email] : reqBody[TableFields.email],
        [TableFields.password] : reqBody[TableFields.password],
        [TableFields.companyName] : reqBody[TableFields.companyName]
    })
    return response;
}

function isFieldEmpty(existingField) {
    if (existingField) {
        return false;
    }
    return true;
}
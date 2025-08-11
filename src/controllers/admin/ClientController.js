const ClientService = require('../../db/services/ClientService');
const { TableFields, ValidationMsg } = require('../../utils/constants');
const ValidationError = require('../../utils/ValidationError');


exports.addClient = async (req) => {
    const reqBody = req.body;

    const email = reqBody[TableFields.email];
    if(!email) {
        throw new ValidationError(ValidationMsg.EmailEmpty);
    }

    const clientExists = await ClientService.existsWithEmail(email);
    console.log(clientExists);
    if(clientExists) {
        throw new ValidationError(ValidationMsg.ClientExists)
    }

    let data = await parseAndValidateClient(
        reqBody,
        undefined,
        async (updatedFields) => {
            let {clientRecords, password} = await ClientService.insertRecord(
                {
                    email : updatedFields[TableFields.email],
                },
                updatedFields
            );
            if(clientRecords[TableFields.email]) {
                sendStudentInvitationEmail(
                    clientRecords[TableFields.name_],
                    clientRecords[TableFields.email],
                    password
                )
            }
        }
    )

    return data;
}

async function parseAndValidateClient(
    reqBody,
    existingClient = {},
    onValidationCompleted = async () => {}
) {
    if(isFieldEmpty(reqBody[TableFields.name_], existingClient[TableFields.name_])){
        throw new ValidationError(ValidationMsg.NameEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.email], existingClient[TableFields.email])){
        throw new ValidationError(ValidationMsg.EmailEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.password], existingClient[TableFields.password])){
        throw new ValidationError(ValidationMsg.PasswordEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.companyName], existingClient[TableFields.companyName])){
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

function isFieldEmpty(providedField, existingField) {
    if (providedField != undefined) {
        if (providedField) {
            return false;
        }
    } else if (existingField) {
        return false;
    }
    return true;
}
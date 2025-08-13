const ClientService = require("../../db/services/ClientService");
const { TableFields, ValidationMsg } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

exports.setClientProfile = async (req) => {
    const reqBody = req.body;
    const reqUser = req.user;

    const email = reqUser[TableFields.email];

    const clientExists = await ClientService.existsWithEmail(email);
    if(!clientExists){ 
        throw new ValidationError(ValidationMsg.ClientNotExists)
    }
    
    return await parseAndValidateClientProfile(
        reqUser,
        reqBody,
        async () => {
            return await ClientService.setProfile( reqUser, reqBody );
        }
    )
}

async function parseAndValidateClientProfile(
    reqUser,
    reqBody,
    onValidationCompleted = async () => {}
) {

    const userType = reqUser[TableFields.userType];

    if(userType === 2){
        if(isFieldEmpty(reqBody[TableFields.phoneCountry])) {
            throw new ValidationError(ValidationMsg.PhoneCountryEmpty);
        }
        if(isFieldEmpty(reqBody[TableFields.phone])) {
            throw new ValidationError(ValidationMsg.ContactNumberEmpty);
        }
        const response = await onValidationCompleted({
            [TableFields.contact] : {
                [TableFields.phoneCountry] : reqBody[TableFields.phoneCountry],
                [TableFields.phone] : reqBody[TableFields.phone]
            }
        })
        return response;
    }
    else {
        throw new ValidationError(ValidationMsg.NotUser)
    }
}

function isFieldEmpty(existingField) {
    if (existingField) {
        return false;
    }
    return true;
}
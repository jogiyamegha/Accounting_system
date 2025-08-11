const ClientService = require('../../db/services/ClientService');
const { TableFields, TableNames, UserTypes, InterfaceType, ValidationMsg } = require('../../utils/constants');
const ValidationError = require('../../utils/ValidationError');
const Util = require('../../utils/util');

exports.signUp = async(req) => {
    const reqBody = req.body;
         
    let email = req.body[TableFields.email];
    email = (email + '').trim().toLowerCase();

    let user = await ClientService.findByEmail(email).withEmail().execute();

    const token = user.createAuthToken(InterfaceType.Client.ClientWeb);
    await ClientService.saveAuthToken(user[TableFields.ID], token);
    return { user, token };
}

exports.login = async (req) => {
    let email = req.body[TableFields.email];
    email = (email + '').trim().toLocaleLowerCase();
    let password = req.body[TableFields.password];
    
    if(!email) {
        throw new ValidationError(ValidationMsg.EmailEmpty)
    }
    if(!password) {
        throw new ValidationError(ValidationMsg.PasswordEmpty)
    }
    
    let user = await ClientService.findByEmail(email).withBasicInfo().withPassword().execute();
    
    if(user && (await user.isValidAuth(password))) {
        const token = user.createAuthToken();
        await ClientService.saveAuthToken(user[TableFields.ID] , token)

        return { user, token };
    } else {
        throw new ValidationError(ValidationMsg.UnableToLogin);
    }
}

exports.logout = async (req) => {
    const headerToken = req.header("Authorization").replace("Bearer ", "");
    ClientService.removeAuth(req.user[TableFields.ID], headerToken);
};
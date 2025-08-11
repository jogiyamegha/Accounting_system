const AdminService = require('../../db/services/AdminService');
const { TableFields, UserTypes, InterfaceType, ValidationMsg } = require('../../utils/constants');
const ValidationError = require('../../utils/ValidationError');
const Util = require('../../utils/util');

exports.addAdminUser = async(req) => {
    if(Util.parseBoolean(req.headers.dbuser)) {
        await AdminService.insertUserRecord(req.body);
         
        let email = req.body[TableFields.email];
        email = (email + '').trim().toLowerCase();

        let user = await AdminService.findByEmail(email).withEmail().execute();

        const token = user.createAuthToken(InterfaceType.Admin.AdminWeb);
        await AdminService.saveAuthToken(user[TableFields.ID], token);
        return { user, token };
    } else {
        throw new ValidationError(ValidationMsg.NotAllowed);
    }
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
    
    let user = await AdminService.findByEmail(email).withBasicInfo().withPassword().execute();
    
    if(user && (await user.isValidAuth(password))) {
        const token = user.createAuthToken();
        await AdminService.saveAuthToken(user[TableFields.ID] , token)
        return { user, token };
    } else {
        throw new ValidationError(ValidationMsg.UnableToLogin);
    }
}

exports.logout = async (req) => {
    const headerToken = req.header("Authorization").replace("Bearer ", "");
    AdminService.removeAuth(req.user[TableFields.ID], headerToken);
};
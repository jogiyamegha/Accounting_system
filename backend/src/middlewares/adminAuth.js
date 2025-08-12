const jwt = require('jsonwebtoken');
const { TableFields, TableNames, UserTypes, InterfaceType, ResponseStatus, AuthTypes } = require('../utils/constants');
const AdminService = require('../db/services/AdminService');
const ValidationError = require('../utils/ValidationError');

const auth = async (req, res, next) => {
    try {
        const headerToken = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(headerToken, process.env.JWT_ADMIN_PK);
        const admin = await AdminService.getUserByIdAndToken(decoded[TableFields.ID], headerToken)
        .withBasicInfo()
        .execute()

        if(!admin){
            throw new ValidationError();
        }
        
        req.user = admin;
        req.user[TableFields.userType] = UserTypes.Admin;
        req.user[TableFields.authType] = AuthTypes.Admin;
        req[TableFields.interface] = decoded[TableFields.interface] || InterfaceType.Admin.AdminWeb;
        next();

    } catch (e) {
        if(!(e instanceof ValidationError)){
            console.log(e);
        }
        res.status(ResponseStatus.Unauthorized).json({message : 'unAuthorized'})
    }
}

module.exports = auth;
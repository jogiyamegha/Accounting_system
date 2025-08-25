const jwt = require('jsonwebtoken');
const { TableFields, TableNames, UserTypes, InterfaceType, ResponseStatus, AuthTypes, ValidationMsg } = require('../utils/constants');
const AdminService = require('../db/services/AdminService');
const ValidationError = require('../utils/ValidationError');

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.admin_token;
        const decoded = jwt.verify(token, process.env.JWT_ADMIN_PK);
        if(!decoded) throw new ValidationError(ValidationMsg.UserNotFound)
        const admin = await AdminService.getUserByIdAndToken(decoded[TableFields.ID], token)
        .withBasicInfo()
        .execute()
 
        if(!admin){
            throw new ValidationError(ValidationMsg.AdminNotFound);
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

        return res.redirect('http://localhost:3000/admin/login')
        // res.status(ResponseStatus.Unauthorized).json({message : 'unAuthorized'})
    }
}

module.exports = auth;
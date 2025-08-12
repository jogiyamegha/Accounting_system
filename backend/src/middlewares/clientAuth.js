const jwt = require('jsonwebtoken');
const { TableFields, TableNames, UserTypes, InterfaceType, ResponseStatus, AuthTypes } = require('../utils/constants');
const ClientService = require('../db/services/ClientService');
const ValidationError = require('../utils/ValidationError');

const auth = async (req, res, next) => {
    try {
        const headerToken = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(headerToken, process.env.JWT_CLIENT_PK);
        const client = await ClientService.getUserByIdAndToken(decoded[TableFields.ID], headerToken)
        .withBasicInfo()
        .execute()

        if(!client){
            throw new ValidationError();
        }
        
        req.user = client;
        req.user[TableFields.userType] = UserTypes.Client;
        req.user[TableFields.authType] = AuthTypes.Client;
        req[TableFields.interface] = decoded[TableFields.interface] || InterfaceType.Client.ClientWeb;
        next();

    } catch (e) {
        if(!(e instanceof ValidationError)){
            console.log(e);
        }
        res.status(ResponseStatus.Unauthorized).json({message : 'unAuthorized'})
    }
}

module.exports = auth;
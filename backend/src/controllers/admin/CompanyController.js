const CompanyService = require('../../db/services/CompanyService');
const ClientService = require('../../db/services/ClientService');
const { TableFields, ValidationMsg } = require('../../utils/constants');
const ValidationError = require('../../utils/ValidationError');

exports.editClientCompanyData = async (req) => {
    const clientId = req.params[TableFields.clientId];
    const reqBody = req.body;

    console.log("reqBody", reqBody);

    const client = await ClientService.getUserById(clientId).withBasicInfo().execute();
    if(!client){
        throw new ValidationError(ValidationMsg.RecordNotFound);
    }

    const company = CompanyService.getCompanyById(client[TableFields.companyId]).withBasicInfo().execute();

    return await CompanyService.updateCompanyFields(client[TableFields.companyId], reqBody, company);
}
const ClientService = require("../../db/services/ClientService");
const CompanyService = require("../../db/services/CompanyService");

const { TableFields, ValidationMsg } = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");
 
 
exports.addCompany = async (req) => {
    const reqBody = req.body;
    const reqUser = req.user;
 
    //already exists logic here..

    let user = await ClientService.getUserById(reqUser[TableFields.ID]).withBasicInfo().execute()

    let existingCompany = await CompanyService.getCompanyById(user[TableFields.companyId]).withBasicInfo().execute()

 
    let data = await parseAndValidateCompany(
        reqBody,
        undefined,
        async(updatedFields) => {
            let records;
            if(existingCompany){
                records = await CompanyService.updateRecord(existingCompany[TableFields.ID], updatedFields)
            }else{

                records = await CompanyService.insertRecord(
                    updatedFields
                );
                await ClientService.updateCompanyinProfile(reqUser[TableFields.ID], records[TableFields.ID])
            }
            return records;
        }
    )

 
    return data;
 
}


 
exports.getFullCompanyDetails = async (req) => {
    const reqBody = req.body;
    const reqUser = req.user;
 
    //already exists logic here..

    let user = await ClientService.getUserById(reqUser[TableFields.ID]).withBasicInfo().execute()

    if(!user) throw new ValidationError(ValidationMsg.RecordNotFound);

    let existingCompany = await CompanyService.getCompanyById(user[TableFields.companyId]).withBasicInfo().execute();
    if(!existingCompany) throw new ValidationError(ValidationMsg.RecordNotFound);

    return existingCompany;
    
}
 
async function parseAndValidateCompany(
    reqBody,
    existingCompany = {},
    onValidationCompleted = async(updatedFields) => {}
){
    if(isFieldEmpty(reqBody[TableFields.name_])){
        throw new ValidationError(ValidationMsg.NameEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.email])){
        throw new ValidationError(ValidationMsg.EmailEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.phoneCountry])){
        throw new ValidationError(ValidationMsg.PhoneCountryEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.phone])){
        throw new ValidationError(ValidationMsg.ContactNumberEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.zipcode])){
        throw new ValidationError(ValidationMsg.ZipcodeEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.licenseType])){
        throw new ValidationError(ValidationMsg.LicenseTypeEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.licenseNumber])){
        throw new ValidationError(ValidationMsg.LicenseNumberEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.licenseIssueDate])){
        throw new ValidationError(ValidationMsg.LicenseIssueDateEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.licenseExpiry])){
        throw new ValidationError(ValidationMsg.LicenseExpiryEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.startDate])){
        throw new ValidationError(ValidationMsg.StartDateEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.endDate])){
        throw new ValidationError(ValidationMsg.EndDateEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.taxRegistrationNumber])){
        throw new ValidationError(ValidationMsg.TaxRegistrationNumberEmpty);
    }
    if(isFieldEmpty(reqBody[TableFields.businessType])){
        throw new ValidationError(ValidationMsg.BusinessTypeEmpty);
    }
 
   
    const response = await onValidationCompleted({
        [TableFields.name_] : reqBody[TableFields.name_],
        [TableFields.email] : reqBody[TableFields.email],
        [TableFields.address]:{
            [TableFields.addressLine1]: reqBody[TableFields.addressLine1],
            [TableFields.addressLine2]: reqBody[TableFields.addressLine2],
            [TableFields.street]: reqBody[TableFields.street],
            [TableFields.landmark]:reqBody[TableFields.landmark],
            [TableFields.zipcode]: reqBody[TableFields.zipcode],
            [TableFields.city]: reqBody[TableFields.city],
            [TableFields.state]:reqBody[TableFields.state],
            [TableFields.country]: reqBody[TableFields.country]
        },
        [TableFields.licenseDetails] : {
            [TableFields.licenseType] : reqBody[TableFields.licenseType],
            [TableFields.licenseNumber]: reqBody[TableFields.licenseNumber],
            [TableFields.licenseIssueDate]: Util.parseDateString(reqBody[TableFields.licenseIssueDate]) ,
            [TableFields.licenseExpiry]: Util.parseDateString(reqBody[TableFields.licenseExpiry])
        },
        [TableFields.financialYear]:{
            [TableFields.startDate]: Util.parseDateString(reqBody[TableFields.startDate]),
            [TableFields.endDate]: Util.parseDateString(reqBody[TableFields.endDate])
        },
        [TableFields.taxRegistrationNumber] : reqBody[TableFields.taxRegistrationNumber],
        [TableFields.businessType] : reqBody[TableFields.businessType],
        [TableFields.contactPerson]:{
            [TableFields.name_]: reqBody.contactPersonName,
            [TableFields.contact]: {
                [TableFields.phoneCountry] : reqBody[TableFields.phoneCountry],
                [TableFields.phone]: reqBody[TableFields.phone]
            }
        }
 
    })
   
 
    return response;
 
}
 
function isFieldEmpty(existingField) {
    if (existingField) {
        return false;
    }
    return true;
}
 
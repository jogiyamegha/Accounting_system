const ClientService = require("../../db/services/ClientService");
const CompanyService = require("../../db/services/CompanyService");
const DocumentService = require("../../db/services/DocumentService");
const { TableFields, ValidationMsg } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

exports.setClientProfile = async (req) => {
  const reqBody = req.body;
  const reqUser = req.user;

  const email = reqUser[TableFields.email];

  const clientExists = await ClientService.existsWithEmail(email);
  if (!clientExists) {
    throw new ValidationError(ValidationMsg.ClientNotExists);
  }

  return await parseAndValidateClientProfile(reqUser, reqBody, async () => {
    return await ClientService.setProfile(reqUser, reqBody);
  });
};

exports.getFullClientProfile = async (req) => {
  let reqUser = req.user;

  let client = await ClientService.getUserById(reqUser[TableFields.ID])
    .withBasicInfo()
    .execute();

  if (!client) throw new ValidationError(ValidationMsg.RecordNotFound);

  let companyId = client[TableFields.companyId];


  
  let company = await CompanyService.getCompanyById(companyId)
    .withBasicInfo()
    .execute();

  if (!company) throw new ValidationError(ValidationMsg.RecordNotFound);

  let docs = await DocumentService.getDocsByClientId(reqUser[TableFields.ID])
    .withBasicInfo()
    .execute();

  if (!docs) throw new ValidationError(ValidationMsg.RecordNotFound);

  let documents = docs[TableFields.documents]


  return {client, company, documents};
};

async function parseAndValidateClientProfile(
  reqUser,
  reqBody,
  onValidationCompleted = async () => {}
) {
  const userType = reqUser[TableFields.userType];

  if (userType === 2) {
    if (isFieldEmpty(reqBody[TableFields.phoneCountry])) {
      throw new ValidationError(ValidationMsg.PhoneCountryEmpty);
    }
    if (isFieldEmpty(reqBody[TableFields.phone])) {
      throw new ValidationError(ValidationMsg.ContactNumberEmpty);
    }
    const response = await onValidationCompleted({
      [TableFields.contact]: {
        [TableFields.phoneCountry]: reqBody[TableFields.phoneCountry],
        [TableFields.phone]: reqBody[TableFields.phone],
      },
    });
    return response;
  } else {
    throw new ValidationError(ValidationMsg.NotUser);
  }
}

function isFieldEmpty(existingField) {
  if (existingField) {
    return false;
  }
  return true;
}

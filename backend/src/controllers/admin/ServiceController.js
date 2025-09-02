const ClientService = require("../../db/services/ClientService");
const ServiceService = require("../../db/services/ServiceService");
const {
  TableFields,
  ValidationMsg,
  ServiceType,
} = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");
const Email = require("../../emails/email");
const DocumentService = require("../../db/services/DocumentService");

exports.assignService = async (req, res) => {
  const reqBody = req.body;
  const clientEmail = reqBody[TableFields.clientEmail];

  const clientExists = await ClientService.existsWithEmail(clientEmail);
  if (!clientExists) {
    throw new ValidationError(ValidationMsg.ClientNotExists);
  }

  let client = await ClientService.findByEmail(clientEmail)
    .withBasicInfo()
    .execute();

  const existsService = await ServiceService.serviceExistsWithClient(
    clientEmail
  );

  let data;

  if (!existsService) {
    data = await parseAndValidate(
      reqBody,
      client,
      undefined,
      async (updatedFields) => {
        let records = await ServiceService.insertRecord(updatedFields);
        await ServiceService.updateServiceDetails(
          records,
          records[TableFields.ID],
          reqBody,
          res
        );

        // Email.sendServiceAssignMail(client[TableFields.name_], clientEmail, reqBody.serviceType )
      }
    );
  } else {
    const service = await ServiceService.findByEmail(clientEmail)
      .withBasicInfo()
      .execute();
    await ServiceService.updateServiceDetails(
      service,
      service[TableFields.ID],
      reqBody,
      res
    );
    // Email.sendServiceAssignMail(client[TableFields.name_], clientEmail, reqBody.serviceType )
  }
};

exports.getClientsAssignedService = async (req) => {
  const clients = await ServiceService.getClientsFilterByServiceType(
    req.params.serviceType
  )
    .withBasicInfo()
    .execute();
  return clients;
};

exports.getServiceDetail = async (req) => {
  let clientId = req.params.clientId;
  // console.log(clientId)

  let clientDetails = await ClientService.getUserById(clientId)
    .withBasicInfo()
    .execute();
  if (!clientDetails) {
    throw new ValidationError(ValidationMsg.RecordNotFound);
  }

  let allServices = await ServiceService.getServiceByClientId(clientId)
    .withBasicInfo()
    .execute();

  if (!allServices) {
    throw new ValidationError(ValidationMsg.RecordNotFound);
  }

  const docs = await DocumentService.getDocsByClientId(clientId)
    .withBasicInfo()
    .execute();

  if (!docs) {
    throw new ValidationError(ValidationMsg.RecordNotFound);
  }

  return { clientDetails, allServices, docs };
};




exports.deAssignService  = async (req) => {
  const serviceId = req.params[TableFields.ID];
  const service = await ServiceService.findById(serviceId).withBasicInfo().execute();
  console.log(service);
  const clientId = service[TableFields.clientDetail][TableFields.clientId];
  const serviceType = req.params[TableFields.serviceType]
  console.log(clientId);
  console.log(serviceType);
  const clientExists = await ClientService.userExists(clientId);
  if(!clientExists) {
    throw new ValidationError(ValidationMsg.ClientNotExists);
  }

  const checkClientAssignService = await ServiceService.checkClientAssignService(clientId,serviceType);
  console.log(checkClientAssignService);
  if(!checkClientAssignService) {
    throw new ValidationError(ValidationMsg.ClientNotAssignService);
  }

  const isServiceCompleted = await ServiceService.checkIsServiceCompleted(service, serviceType);
  console.log(isServiceCompleted);

  if(isServiceCompleted) {
    throw new ValidationError(ValidationMsg.ServiceIsCompleted)
  }

  await ServiceService.updateDeassign(service, serviceType);
}

async function parseAndValidate (
  reqBody, 
  client,
  existingField = {},
  onValidationCompleted = async (updatedFields) => {}
) {
  if (
    isFieldEmpty(
      reqBody[TableFields.serviceType],
      existingField[TableFields.serviceType]
    )
  ) {
    throw new ValidationError(ValidationMsg.ServiceTypeEmpty);
  }
  const response = await onValidationCompleted({
    [TableFields.clientDetail]: {
      [TableFields.clientEmail]: reqBody[TableFields.clientEmail],
      [TableFields.clientId]: client[TableFields.ID],
      [TableFields.clientName]: client[TableFields.name_],
    },
  });
}

function isFieldEmpty(providedData, existingField) {
  if (providedData !== undefined) {
    if (providedData) {
      return false;
    }
  } else if (existingField) {
    return false;
  }

  return true;
}

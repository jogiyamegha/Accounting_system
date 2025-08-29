const ClientService = require("../../db/services/ClientService");
const ServiceService = require("../../db/services/ServiceService");
const {
  TableFields,
  ValidationMsg,
  ServiceType,
} = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");
const Email = require('../../emails/email');

exports.assignService = async (req, res) => {
  const reqBody = req.body;
  const clientEmail = reqBody[TableFields.clientEmail];

  const clientExists = await ClientService.existsWithEmail(clientEmail);
  if(!clientExists) { 
    throw new ValidationError(ValidationMsg.ClientNotExists);
  }
  
  let client = await ClientService.findByEmail(clientEmail).withBasicInfo().execute()

  const existsService = await ServiceService.serviceExistsWithClient(clientEmail);

  let data;

  if(!existsService) {
    data = await parseAndValidate(
      reqBody,
      client,
      undefined,
      async (updatedFields) => {
        let records = await ServiceService.insertRecord(updatedFields)
        await ServiceService.updateServiceDetails(records ,records[TableFields.ID], reqBody, res)
      
        // Email.sendServiceAssignMail(client[TableFields.name_], clientEmail, reqBody.serviceType )
      }
    ) 
  } else {
    const service = await ServiceService.findByEmail(clientEmail).withBasicInfo().execute();
    await ServiceService.updateServiceDetails(service, service[TableFields.ID], reqBody, res)
    // Email.sendServiceAssignMail(client[TableFields.name_], clientEmail, reqBody.serviceType )

  }
}

exports.getClientsAssignedService = async (req) => {
  const clients = await ServiceService.getClientsFilterByServiceType(req.params.serviceType).withBasicInfo().execute()
  return clients
}

async function parseAndValidate (
  reqBody, 
  client,
  existingField = {},
  onValidationCompleted = async (updatedFields) => {}
){
  if (isFieldEmpty(reqBody[TableFields.serviceType],existingField[TableFields.serviceType])) {
    throw new ValidationError(ValidationMsg.ServiceTypeEmpty);
  }
  const response = await onValidationCompleted({
    [TableFields.clientDetail] : {
      [TableFields.clientEmail] : reqBody[TableFields.clientEmail],
      [TableFields.clientId] : client[TableFields.ID],
      [TableFields.clientName] : client[TableFields.name_]
    }
  }
  )
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

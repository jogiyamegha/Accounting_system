const ClientService = require("../../db/services/ClientService");
const ServiceService = require("../../db/services/ServiceService");
const {
  TableFields,
  ValidationMsg,
  ServiceType,
} = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");
const Email = require('../../emails/email')

// exports.addService = async (req) => {
//   const reqBody = req.body;

//   const type = reqBody[TableFields.serviceType];

//   let existingService = await ServiceService.existsWithType(type);

//   if (existingService) {
//     let result = await parseAndValidateService(
//       reqBody,
//       existingService,
//       async (updatedFields) => {
//         let records = await ServiceService.updateRecord(
//           existingService[TableFields.ID],
//           updatedFields
//         );
//       }
//     );
//     return result;
//   } else {
//     let data = await parseAndValidateService(
//       reqBody,
//       undefined,
//       async (updatedFields) => {
//         let records = await ServiceService.insertRecord(updatedFields);
//       }
//     );

//     return data;
//   }
// };

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
      
        Email.sendServiceAssignMail(client[TableFields.name_], clientEmail, reqBody.serviceType )

      }
    ) 
  } else {
    const service = await ServiceService.findByEmail(clientEmail).withBasicInfo().execute();
    await ServiceService.updateServiceDetails(service, service[TableFields.ID], reqBody, res)
    Email.sendServiceAssignMail(client[TableFields.name_], clientEmail, reqBody.serviceType )

  }
}

// async function parseAndValidateService(
//   reqBody,
//   existingField = {},
//   onValidationCompleted = async (updatedFields) => {}
// ) {
//   if (
//     isFieldEmpty(
//       reqBody[TableFields.serviceType],
//       existingField[TableFields.serviceType]
//     )
//   ) {
//     throw new ValidationError(ValidationMsg.ServiceTypeEmpty);
//   }

//   if (
//     isFieldEmpty(
//       reqBody.duration,
//       existingField[TableFields.targetCompletionDurationInYears]
//     )
//   ) {
//     throw new ValidationError(ValidationMsg.TargetCompletionDateEmpty);
//   }

//   if (
//     isFieldEmpty(
//       reqBody[TableFields.description],
//       existingField[TableFields.description]
//     )
//   ) {
//     throw new ValidationError(ValidationMsg.DescriptionEmpty);
//   }

//   if (
//     isFieldEmpty(
//       reqBody[TableFields.accountantName],
//       existingField[TableFields.accountantName]
//     )
//   ) {
//     throw new ValidationError(ValidationMsg.NameEmpty);
//   }
//   if (
//     isFieldEmpty(reqBody[TableFields.email], existingField[TableFields.email])
//   ) {
//     throw new ValidationError(ValidationMsg.EmailEmpty);
//   }

//   let serviceType = reqBody[TableFields.serviceType];

//   if (typeof serviceType === "string") {
//     const serviceTypeMap = {
//       VATServices: ServiceType.VATServices,
//       CorporateTaxServices: ServiceType.CorporateTaxServices,
//       AccountingServices: ServiceType.AccountingServices,
//       AuditAndCompliance: ServiceType.AuditAndCompliance,
//     };

//     serviceType = serviceTypeMap[serviceType];
//   }

//   const response = await onValidationCompleted({
//     [TableFields.clientEmail] : reqBody[TableFields.email],
//     [TableFields.serviceType]: serviceType,
//     [TableFields.serviceEndDate]: reqBody.duration,
//     [TableFields.description]: reqBody[TableFields.description],
//     [TableFields.assignedStaff]: {
//       [TableFields.accountantName]: reqBody[TableFields.accountantName],
//       [TableFields.email]: reqBody[TableFields.email],
//     },
//   });

//   return response;
// }


exports.getClientsAssignedService = async (req) => {
  const serviceType = req.params.serviceType;
  return await ServiceService.getClientsFilterByServiceType(serviceType).withBasicInfo().execute()
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

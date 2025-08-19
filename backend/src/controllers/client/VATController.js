const { MongoUtil } = require("../../db/mongoose");
const ClientService = require("../../db/services/ClientService");
const DocumentService = require("../../db/services/DocumentService");
const ServiceService = require("../../db/services/ServiceService");
const VATService = require("../../db/services/VATService");
const {
  TableFields,
  ValidationMsg,
  ServiceType,
  DurationType,
  DocumentType,
} = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");

exports.addVatService = async (req) => {
  let reqBody = req.body;
  let userId = MongoUtil.toObjectId(reqBody.userId);
//   let reqUser = req.user;
  let serviceType = reqBody[TableFields.serviceType];

  let client = await ClientService.getUserById(userId)
    .withBasicInfo()
    .execute();

  if (!client) {
    throw new ValidationError(ValidationMsg.RecordNotFound);
  }

  let docs = await DocumentService.getDocsByClientId(userId)
    .withBasicInfo()
    .execute();

  if (!docs) {
    throw new ValidationError(ValidationMsg.RecordNotFound);
  }

  let serviceDetails = await ServiceService.findByServiceType(serviceType);

  if (!serviceDetails) {
    throw new ValidationError(ValidationMsg.RecordNotFound);
  }

  let data = await parseAndValidateVATService(
    reqBody,
    client,
    docs[TableFields.documents],
    serviceDetails,
    async (updatedFields) => {
      let records = await VATService.insertRecord(updatedFields);
      return records;
    }
  );
  return data;
};

async function parseAndValidateVATService(
  reqBody,
  clientDetails,
  docsArray,
  serviceDetails,
  onValidationCompleted = async (updatedFields) => {}
) {
  if (isFieldEmpty(reqBody[TableFields.serviceType])) {
    throw new ValidationError(ValidationMsg.ServiceTypeEmpty);
  }

  if (isFieldEmpty(reqBody[TableFields.durationType])) {
    throw new ValidationError(ValidationMsg.DurationTypeEmpty);
  }

  if (isFieldEmpty(reqBody[TableFields.startingAmount])) {
    throw new ValidationError(ValidationMsg.AmountEmpty);
  }

  let serviceDuration =
    serviceDetails[TableFields.targetCompletionDurationInYears];

  let serviceStartDate = Date.now(); // date when the request is approved, based on it endDat eis calculated

  let endDate = new Date(serviceStartDate);

  // Separate integer years and fractional years
  const years = Math.floor(serviceDuration); // whole years
  const fraction = serviceDuration - years; // decimal part

  // Add whole years
  endDate.setFullYear(endDate.getFullYear() + years);

  // Convert fractional years into months (approx: 1 year = 12 months)
  const months = Math.round(fraction * 12);
  endDate.setMonth(endDate.getMonth() + months);

  let startingAmount = reqBody[TableFields.startingAmount];
  let totalAmount;

  let durationType = reqBody[TableFields.durationType];

  if (typeof durationType === "string") {
    const durationTypeMap = {
      monthly: DurationType.monthly,
      quaterly: DurationType.quaterly,
    };

    durationType = durationTypeMap[durationType];
  }

  if (durationType === 1) {
    const VATRate = 0.18;
    totalAmount = startingAmount * 12 * (1 + VATRate);
  } else if (durationType === 2) {
    const VATRate = 0.18;
    totalAmount = startingAmount * 4 * (1 + VATRate);
  } else {
    throw new ValidationError("Please enter proper Amount");
  }

  let docType = reqBody.docType;

  if (typeof docType === "string") {
    const docTypeMap = {
      VATcertificate: DocumentType.VATcertificate,
    };

    docType = docTypeMap[docType];
  }

  

  const filteredDocs = docsArray.filter(
    (d) => d[TableFields.documentDetails][TableFields.documentType] === docType
  );

  console.log("h",filteredDocs)

  let onlyDocuments = filteredDocs.map(
    (d) => d[TableFields.documentDetails][TableFields.document]
  );

  console.log("2",onlyDocuments)

  let vatDoc = [];

  let submittedDoc = {
    document: onlyDocuments[0],
  };

  vatDoc.push(submittedDoc);

  let response = await onValidationCompleted({
    [TableFields.clientDetails]: {
      [TableFields.clientId]: clientDetails[TableFields.ID],
      [TableFields.documents]: vatDoc,
      [TableFields.serviceStartDate]: serviceStartDate,
      [TableFields.serviceEndDate]: endDate,
      [TableFields.durationType]: durationType,
      [TableFields.startingAmount]: startingAmount,
      [TableFields.totalAmount]: totalAmount,
    },
    [TableFields.serviceDetails]: {
      [TableFields.serviceId]: serviceDetails[TableFields.ID],
    },
  });

  return response;
}

function isFieldEmpty(existingField) {
  if (existingField) {
    return false;
  }
  return true;
}

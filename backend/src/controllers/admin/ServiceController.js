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

exports.addService = async (req) => {
    const reqBody = req.body;
    const serviceExists = await ServiceService.serviceExists(reqBody[TableFields.serviceName]);

    if (serviceExists) {
        throw new ValidationError(ValidationMsg.ServiceAlreadyExists);
    }

    return await parseAndValidate(
        reqBody, 
        undefined, 
        async (updatedFields) => {
            return await ServiceService.insertRecord(updatedFields);
        }
    );
}

exports.editService = async (req) => {
    const reqBody = req.body;
    const serviceId = req.params[TableFields.ID];
    const serviceExists = await ServiceService.serviceExistsWithId(serviceId);
    if(!serviceExists) {
        throw new ValidationError(ValidationMsg.ServiceNotExists)
    }

    const service = await ServiceService.findById(serviceId).withBasicInfo().execute();

    return await parseAndValidate(
        reqBody,
        service,
        async (updatedFields) => {
            return await ServiceService.updateServiceDetails(serviceId, updatedFields);
        }
    )

}

exports.deleteService = async (req) => {
    const serviceId = req.params[TableFields.ID];
    const serviceExists = await ServiceService.serviceExistsWithId(serviceId);
    if(!serviceExists) {
        throw new ValidationError(ValidationMsg.ServiceNotExists)
    }

    return await ServiceService.deleteService(serviceId);
}

exports.assignService = async (req, res) => {
    const reqBody = req.body;
    const serviceId = req.params[TableFields.ID];
    console.log("serviceId", serviceId);

    const clientEmail = reqBody[TableFields.clientEmail];

    const clientExists = await ClientService.existsWithEmail(clientEmail);
    if (!clientExists) {
        throw new ValidationError(ValidationMsg.ClientNotExists);
    }

    let client = await ClientService.findByEmail(clientEmail)
        .withBasicInfo()
        .execute();

    const existsService = await ClientService.serviceExists(
        serviceId,
        clientEmail
    );
    console.log("existsService",existsService);

    if (existsService) {
        throw new ValidationError(ValidationMsg.ServiceAlreadyExists);
    } 
    return await ClientService.addServiceInArray(client,clientEmail ,serviceId);
};

exports.getAllServices = async (req) => {
    const services = await ServiceService.listAllService({
        ...req.query
    })
    .withBasicInfo()
    .execute();
    return services.records;
}

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

    let clientDetails = await ClientService.getUserById(clientId)
        .withBasicInfo()
        .execute();
    if (!clientDetails) {
        throw new ValidationError(ValidationMsg.RecordNotFound);
    }

    let allServices = await ServiceService.getAllServiceByClientId(clientId)
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

exports.deAssignService = async (req) => {
    const serviceId = req.params[TableFields.serviceId];
    const clientId = req.params[TableFields.clientId];

    const clientExists = await ClientService.userExists(clientId);
    if (!clientExists) {
        throw new ValidationError(ValidationMsg.ClientNotExists);
    }

    const checkClientAssignService = await ServiceService.checkClientAssignService(clientId, serviceId);

    if (!checkClientAssignService) {
        throw new ValidationError(ValidationMsg.ClientNotAssignService);
    }

    const isServiceCompleted = await ServiceService.checkIsServiceCompleted(clientId, serviceId);

    if (isServiceCompleted) {
        throw new ValidationError(ValidationMsg.ServiceIsCompleted)
    }

    let result = await ServiceService.updateDeassign(clientId, serviceId);
    return result;
}

exports.renewService = async (req) => {
    const serviceId = req.params[TableFields.serviceId];
    const clientId = req.params[TableFields.clientId];
    const serviceType = req.params[TableFields.serviceType];
    const reqBody = req.body;

    const clientExists = await ClientService.userExists(clientId);
    if (!clientExists) {
        throw new ValidationError(ValidationMsg.ClientNotExists);
    }

    const isServiceCompleted = await ServiceService.checkIsServiceCompleted(clientId, serviceId);

    if (!isServiceCompleted) {
        throw new ValidationError(ValidationMsg.ServiceIsNotCompleted)
    }

    const mainService = await ServiceService.getServiceByClientId(clientId).withBasicInfo().execute();

    let { serviceTypeKey, endDate } = await ServiceService.updateServiceArrayAsRenewService(mainService, serviceType)
    let client = await ClientService.getUserById(clientId).withBasicInfo().execute()
    
    Email.sendServiceRenewalMail(client[TableFields.name_], client[TableFields.email], serviceTypeKey, endDate)
 
}

async function parseAndValidate(
    reqBody,
    existingField = {},
    onValidationCompleted = async (updatedFields) => { }
) {
    if (isFieldEmpty(reqBody[TableFields.serviceName],existingField[TableFields.serviceName])) {
        throw new ValidationError(ValidationMsg.ServiceNameEmpty);
    }
   
    if (isFieldEmpty(reqBody.serviceDuration, existingField.serviceDuration)) {
        throw new ValidationError(ValidationMsg.ServiceDurationEmpty);
    }

    const response = await onValidationCompleted({
        [TableFields.serviceName] : reqBody[TableFields.serviceName],
        [TableFields.serviceDuration] : reqBody[TableFields.serviceDuration]
    });
    return response;
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

const ClientService = require("../../db/services/ClientService");
const ServiceService = require("../../db/services/ServiceService");
const DocumentService = require("../../db/services/DocumentService");
const CalendarController = require('../../controllers/admin/CalendarController');
const {
    TableFields,
    ValidationMsg,
    ServiceType,
} = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");
const Email = require("../../emails/email");

exports.addService = async (req) => {
    const reqBody = req.body;
    const serviceExistsWithName = await ServiceService.serviceExistsWithName(reqBody[TableFields.serviceName]);

    if (serviceExistsWithName) {
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
    if (!serviceExists) {
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
    if (!serviceExists) {
        throw new ValidationError(ValidationMsg.ServiceNotExists)
    }

    return await ServiceService.deleteService(serviceId);
}

// exports.assignService = async (req, res) => {
//     const reqBody = req.body;
//     const serviceId = req.params[TableFields.ID];
//     const clientEmail = reqBody[TableFields.clientEmail];
    
//     const clientExists = await ClientService.existsWithEmail(clientEmail);
//     if (!clientExists) {
//         throw new ValidationError(ValidationMsg.ClientNotExists);
//     }

//     let client = await ClientService.findByEmail(clientEmail)
//         .withBasicInfo()
//         .execute();

//     const serviceExists = await ServiceService.serviceExists(serviceId);
//     if(!serviceExists) {
//         throw new ValidationError(ValidationMsg.ServiceNotExists);
//     }

//     const service = await ServiceService.findById(serviceId).withBasicInfo().execute();

//     const isServiceRunning = await ClientService.checkServiceAssignedAndCompletedOrDeassign(client, serviceId);
//     console.log(isServiceRunning);
   
//     if(isServiceRunning) {
//         throw new ValidationError(ValidationMsg.ServiceIsRunning);
//     }

//     await Email.sendServiceAssignMail(client[TableFields.name_],client[TableFields.email], service[TableFields.serviceName] )
//     return await ClientService.addServiceInArray(clientEmail, serviceId);
// };

exports.assignService = async (req, res) => {
    try {
        const reqBody = req.body;
        const serviceId = req.params[TableFields.ID];
        const clientEmail = reqBody[TableFields.clientEmail];
        
        // Validate input
        if (!serviceId) {
            return res.status(400).json({
                success: false,
                error: "Service ID is required"
            });
        }
        if (!clientEmail) {
            return res.status(400).json({
                success: false,
                error: "Client email is required"
            });
        }

        // Check if client exists
        const clientExists = await ClientService.existsWithEmail(clientEmail);
        if (!clientExists) {
            throw new ValidationError(ValidationMsg.ClientNotExists);
        }

        // Get client details
        let client = await ClientService.findByEmail(clientEmail)
            .withBasicInfo()
            .execute();

        // Check if service exists
        const serviceExists = await ServiceService.serviceExists(serviceId);
        if (!serviceExists) {
            throw new ValidationError(ValidationMsg.ServiceNotExists);
        }

        // Get service details for email
        const service = await ServiceService.findById(serviceId).withBasicInfo().execute();

        // Check if service is already running
        const isServiceRunning = await ClientService.checkServiceAssignedAndCompletedOrDeassign(client, serviceId);
        console.log("isServiceRunning:", isServiceRunning);
       
        if (isServiceRunning) {
            throw new ValidationError(ValidationMsg.ServiceIsRunning);
        }

        // Assign service to client
        const assignResult = await ClientService.addServiceInArray(clientEmail, serviceId);
        
        // Send service assignment email
        await Email.sendServiceAssignMail(
            client[TableFields.name_], 
            client[TableFields.email], 
            service[TableFields.serviceName]
        );

        // Return success response
        return res.status(200).json({
            success: true,
            message: "Service assigned successfully",
            data: assignResult
        });

    } catch (error) {
        console.error("Error in assignService:", error);
        
        if (error instanceof ValidationError) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        return res.status(500).json({
            success: false,
            error: "Internal server error while assigning service"
        });
    }
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

    console.log("all clients service", clients);
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
 
    const client = await ClientService.getUserById(clientId).withBasicInfo().execute();
    const isServiceAssign = await ClientService.checkIsServiceAssign(client, serviceId);
    console.log(isServiceAssign);

    if(!isServiceAssign) {
        throw new ValidationError(ValidationMsg.ServiceIsNotAssigned);
    }

    const isServiceCompleted = await ClientService.checkServiceCompletedOrNot(client, serviceId);

    if(isServiceCompleted) {
        throw new ValidationError(ValidationMsg.ServiceIsCompletedToDeassign);
    }

    return await ClientService.updateDeassign(client, serviceId);
}


// exports.renewService = async (req) => {
//     const serviceId = req.params[TableFields.serviceId];
//     const clientId = req.params[TableFields.clientId];

//     const clientExists = await ClientService.userExists(clientId);
//     if (!clientExists) {
//         throw new ValidationError(ValidationMsg.ClientNotExists);
//     }

//     const service = await ServiceService.findById(serviceId).withBasicInfo().execute();

//     const client = await ClientService.getUserById(clientId).withBasicInfo().execute();

//     const isServiceExistsInClient = await ClientService.isServiceExistsInClient(client, serviceId);

//     if(!isServiceExistsInClient) {
//         throw new ValidationError(ValidationMsg.ServiceNotExistsInClient);
//     }

//     const isServiceCompleted = await ClientService.checkAllServiceCompleted(client, serviceId);
//     console.log("isServiceCompleted", isServiceCompleted);

//     if(!isServiceCompleted) {
//         throw new ValidationError(ValidationMsg.ServiceIsNotCompleted);
//     }

//     await Email.sendServiceRenewalMail(client[TableFields.name_], client[TableFields.email], service[TableFields.serviceName])
//     return await ClientService.addRenewService(client[TableFields.ID], serviceId);
// }

exports.renewService = async (req, res) => {
    try {
        const serviceId = req.params[TableFields.serviceId];
        const clientId = req.params[TableFields.clientId];

        // Validate input
        if (!serviceId) {
            return res.status(400).json({
                success: false,
                error: "Service ID is required"
            });
        }
        if (!clientId) {
            return res.status(400).json({
                success: false,
                error: "Client ID is required"
            });
        }

        // Check if client exists
        const clientExists = await ClientService.userExists(clientId);
        if (!clientExists) {
            throw new ValidationError(ValidationMsg.ClientNotExists);
        }

        // Get service details for email
        const service = await ServiceService.findById(serviceId).withBasicInfo().execute();
        if (!service) {
            throw new ValidationError(ValidationMsg.ServiceNotExists);
        }

        // Get client details
        const client = await ClientService.getUserById(clientId).withBasicInfo().execute();

        // Check if service exists in client's services
        const isServiceExistsInClient = await ClientService.isServiceExistsInClient(client, serviceId);
        if (!isServiceExistsInClient) {
            throw new ValidationError(ValidationMsg.ServiceNotExistsInClient);
        }

        // Check if service is completed and can be renewed
        const isServiceCompleted = await ClientService.checkAllServiceCompleted(client, serviceId);
        console.log("isServiceCompleted:", isServiceCompleted);

        if (!isServiceCompleted) {
            throw new ValidationError(ValidationMsg.ServiceIsNotCompleted);
        }

        // Renew the service
        const renewResult = await ClientService.addRenewService(client[TableFields.ID], serviceId);

        // Send service renewal email
        await Email.sendServiceRenewalMail(
            client[TableFields.name_], 
            client[TableFields.email], 
            service[TableFields.serviceName]
        );

        // Return success response
        return res.status(200).json({
            success: true,
            message: "Service renewed successfully",
            data: renewResult
        });

    } catch (error) {
        console.error("Error in renewService:", error);
        
        if (error instanceof ValidationError) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        return res.status(500).json({
            success: false,
            error: "Internal server error while renewing service"
        });
    }
};


async function parseAndValidate(
    reqBody,
    existingField = {},
    onValidationCompleted = async (updatedFields) => { }
) {
    if (isFieldEmpty(reqBody[TableFields.serviceName], existingField[TableFields.serviceName])) {
        throw new ValidationError(ValidationMsg.ServiceNameEmpty);
    }

    if (isFieldEmpty(reqBody.serviceDuration, existingField.serviceDuration)) {
        throw new ValidationError(ValidationMsg.ServiceDurationEmpty);
    }

    const response = await onValidationCompleted({
        [TableFields.serviceName]: reqBody[TableFields.serviceName],
        [TableFields.serviceDuration]: reqBody[TableFields.serviceDuration]
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

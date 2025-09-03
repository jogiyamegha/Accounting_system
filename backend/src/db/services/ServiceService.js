const {
    TableFields,
    ServiceType,
    ServiceDuration,
} = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");
const Service = require("../models/service");
const { MongoUtil } = require("../mongoose");

class ServiceService {
    static findById = (id) => {
        return new ProjectionBuilder(async function () {
            return await Service.findOne(
                {
                    [TableFields.ID]: MongoUtil.toObjectId(id),
                },
                this
            );
        });
    };

    static findByEmail = (email) => {
        return new ProjectionBuilder(async function () {
            return await Service.findOne(
                {
                    [TableFields.clientDetail + "." + TableFields.clientEmail]: email,
                },
                this
            );
        });
    };

    static serviceExistsWithClient = async (clientEmail) => {
        return await Service.exists({
            [TableFields.clientDetail + "." + TableFields.clientEmail]: clientEmail,
        });
    };

    static getClientsFilterByServiceType = (serviceType) => {
        return new ProjectionBuilder(async function () {
            const docs = await Service.find({
                [TableFields.services]: {
                    $elemMatch: {
                        [TableFields.serviceType]: serviceType,
                        [TableFields.deleted]: false,
                    },
                },
            });

            return docs.map((doc) => {
                doc.services = doc.services.filter((s) => !s.deleted);
                return doc;
            });
        });
    };


    static findByServiceType = async (serviceType) => {
        if (typeof serviceType === "string") {
            const serviceTypeMap = {
                VATServices: ServiceType.VATServices,
                CorporateTaxServices: ServiceType.CorporateTaxServices,
                AccountingServices: ServiceType.AccountingServices,
                AuditAndCompliance: ServiceType.AuditAndCompliance,
            };

            serviceType = serviceTypeMap[serviceType];
        }

        if (!Object.values(ServiceType).includes(serviceType)) {
            throw new ValidationError("Invalid Service Type.");
        }

        return await Service.findOne({
            [TableFields.serviceType]: serviceType,
        });
    };

    static existsWithType = async (type, exceptionId) => {
        let serviceType;
        if (typeof type === "string") {
            const serviceTypeMap = {
                VATServices: ServiceType.VATServices,
                CorporateTaxServices: ServiceType.CorporateTaxServices,
                AccountingServices: ServiceType.AccountingServices,
                AuditAndCompliance: ServiceType.AuditAndCompliance,
            };

            serviceType = serviceTypeMap[type];
        }

        return await Service.exists({
            [TableFields.serviceType]: serviceType,
            ...(exceptionId
                ? {
                    [TableFields.ID]: { $ne: exceptionId },
                }
                : {}),
        });
    };

    static checkClientAssignService = async (clientId, serviceId) => {
        return await Service.exists({
            "clientDetail.clientId": clientId,
            services: {
                $elemMatch: {
                    _id: serviceId,
                },
            },
        });
    };

    static checkIsServiceCompleted = async (clientId, serviceId) => {
        const mainService = await ServiceService.getServiceByClientId(clientId)
            .withBasicInfo()
            .execute();

        const allServices = mainService[TableFields.services];

        for (let service of allServices) {
            if (
                service[TableFields.ID].toString() === serviceId &&
                service[TableFields.serviceStatus] === 3
            ) {
                return true;
            }
        }
        return false;
    };

    static updateDeassign = async (clientId, serviceId) => {
        return await Service.updateOne(
            {
                [`${TableFields.clientDetail}.${TableFields.clientId}`]: clientId,
                [`${TableFields.services}.${TableFields.ID}`]: serviceId,
            },
            {
                $set: {
                    [`${TableFields.services}.$.${TableFields.deleted}`]: true,
                },
            }
        );
    };

    static insertRecord = async (serviceFields) => {
        const service = new Service(serviceFields);
        let error = service.validateSync();
        let createdServiceRecord;

        if (error) {
            throw error;
        } else {
            try {
                createdServiceRecord = await service.save();
                return createdServiceRecord;
            } catch (e) {
                if (createdServiceRecord) {
                    await createdServiceRecord.delete();
                }
            }
        }
    };

    static updateServiceDetails = async (service, id, reqBody, res) => {
        let serviceType = reqBody[TableFields.serviceType];

        if (typeof serviceType === "string") {
            const serviceTypeMap = {
                "VAT": ServiceType.VAT,
                "Corporate Tax": ServiceType.CorporateTaxServices,
                "Payroll": ServiceType.Payroll,
                "Audit": ServiceType.AuditAndCompliance,
            };

            serviceType = serviceTypeMap[serviceType];
        }

        const services = service[TableFields.services];
        for (let s of services) {
            if (s[TableFields.serviceType] === serviceType && s[TableFields.serviceStatus] === 2 && s[TableFields.deleted] === false) {
                return res.status(400).json({
                    message: "This service is running! please wait until completion..",
                });
            }
        }

        // calculate end date based on duration
        const durationInDays =
            ServiceDuration[
            Object.keys(ServiceDuration).find(
                (key) => ServiceType[key] === serviceType
            )
            ];

        const startDate = new Date();
        const endDate = new Date(startDate);
        if (durationInDays) {
            endDate.setDate(startDate.getDate() + durationInDays);
        }

        return await Service.findByIdAndUpdate(
            id,
            {
                $push: {
                    [TableFields.services]: {
                        [TableFields.serviceType]: serviceType,

                        [TableFields.serviceStartDate]: startDate,
                        [TableFields.serviceEndDate]: endDate,
                        [TableFields.serviceStatus]: 2,
                    },
                },
            },
            { new: true, runValidators: true }
        );
    };


    static updateServiceArrayAsRenewService = async (mainService, serviceType) => {
        const serviceTypeNumber = serviceType;

        const serviceTypeMap = {
            1: "VAT",
            2: "CorporateTaxServices",
            3: "Payroll",
            4: "AuditAndCompliance",
        };

        const serviceTypeKey = serviceTypeMap[serviceTypeNumber];
        if (!serviceTypeKey) throw new Error("Invalid service type received");

        const durationInDays = ServiceDuration[serviceTypeKey];
        if (!durationInDays)
            throw new Error(`No duration found for serviceType: ${serviceTypeKey}`);


        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + durationInDays);

        mainService[TableFields.services].push({
            [TableFields.serviceType]: serviceTypeNumber,
            [TableFields.serviceStartDate]: startDate,
            [TableFields.serviceEndDate]: endDate,
            [TableFields.serviceStatus]: 2,
            [TableFields.deleted]: false,
        });

        let result = await mainService.save();
        return { serviceTypeKey, endDate }

    };


    static updateRecord = async (serviceId, updatedFields) => {
        if (!serviceId) throw new Error("Service ID is required for update");

        const updatedService = await Service.findByIdAndUpdate(
            serviceId,
            { $set: updatedFields },
            { new: true }
        );

        if (!updatedService) {
            throw new Error("Company record not found");
        }

        return updatedService.toObject();
    };

    static getServiceByClientId = (clientId) => {
        return new ProjectionBuilder(async function () {
            return await Service.findOne({
                [TableFields.clientDetail + "." + TableFields.clientId]: clientId,
            });
        });
    };

    static getAllServiceByClientId = (clientId) => {
        return new ProjectionBuilder(async function () {
            return await Service.find({
                [TableFields.clientDetail + "." + TableFields.clientId]: clientId,
            });
        });
    };
}



const ProjectionBuilder = class {
    constructor(methodToExecute) {
        const projection = {};
        this.withBasicInfo = () => {
            projection[TableFields.ID] = 1;
            projection[TableFields.clientDetail] = 1;
            projection[TableFields.services] = 1;
            return this;
        };

        this.withId = () => {
            projection[TableFields.ID] = 1;
            return this;
        };
        this.withServices = () => {
            projection[TableFields.services] = 1;
            return this;
        };
        this.execute = async () => {
            return await methodToExecute.call(projection);
        };
    }
};

module.exports = ServiceService;

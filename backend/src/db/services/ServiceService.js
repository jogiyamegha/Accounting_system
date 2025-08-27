const {
  TableFields,
  TableNames,
  ValidationMsg,
  ServiceType,
} = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");
const Service = require("../models/service");

class ServiceService {
  static findById = (id) => {
    return new ProjectionBuilder(async function () {
      return await Service.findOne(
        {
          id,
        },
        this
      );
    });
  };

  static findByEmail = (email) => {
    return new ProjectionBuilder(async function () {
      return await Service.findOne(
        {
          [TableFields.clientEmail]: email,
        },
        this
      );
    });
  };

  static serviceExistsWithClient = async (clientEmail) => {
    return await Service.exists({
      [TableFields.clientEmail]: clientEmail,
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

  static updateServiceDetails = async (id, reqBody) => {
    let serviceType =  reqBody[TableFields.serviceType];

    if (typeof serviceType === "string") {
        const serviceTypeMap = {
          "VAT Filing": ServiceType.VATFiling,
          "Corporate Tax": ServiceType.CorporateTaxServices,
          "Payroll": ServiceType.Payroll,
          "Audit": ServiceType.AuditAndCompliance,
        };
    
        serviceType = serviceTypeMap[serviceType];
      }

    return await Service.findByIdAndUpdate(
      id,
      {
        $push: {
          [TableFields.services]: {
            [TableFields.serviceType]: serviceType,
            [TableFields.serviceStartDate]: new Date(
              reqBody[TableFields.startDate]
            ),
            [TableFields.serviceEndDate]: new Date(
              reqBody[TableFields.endDate]
            ),
          },
        },
      },
      { new: true, runValidators: true }
    );
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
}

const ProjectionBuilder = class {
  constructor(methodToExecute) {
    const projection = {};
    this.withBasicInfo = () => {
      projection[TableFields.ID] = 1;
      projection[TableFields.serviceType] = 1;
      projection[TableFields.targetCompletionDate] = 1;
      projection[TableFields.description] = 1;
      projection[TableFields.assignedStaff] = 1;

      return this;
    };

    this.withId = () => {
      projection[TableFields.ID] = 1;
      return this;
    };
    this.withCompletionDate = () => {
      projection[TableFields.targetCompletionDate] = 1;
      return this;
    };
    this.withAssignedStaff = () => {
      projection[TableFields.assignedStaff] = 1;
      return this;
    };

    this.execute = async () => {
      return await methodToExecute.call(projection);
    };
  }
};

module.exports = ServiceService;

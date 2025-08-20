const {
  TableFields,
  ValidationMsg,
  ServiceType,
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const CalenderEvent = require("../models/calenderEvent");

class CalenderEventService {
  static findById = (id) => {
    return new ProjectionBuilder(async function () {
      return await CalenderEvent.findOne(
        {
          id,
        },
        this
      );
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

    return await CalenderEvent.findOne({
      [TableFields.serviceType]: serviceType,
    });
  };

  static insertRecord = async (calenderEventFields) => {
    const calenderEvent = new CalenderEvent(calenderEventFields);
    let error = calenderEvent.validateSync();
    let createdCalenderRecord;

    if (error) {
      throw error;
    } else {
      try {
        createdCalenderRecord = await calenderEvent.save();
        return createdCalenderRecord;
      } catch (e) {
        if (createdCalenderRecord) {
          await createdCalenderRecord.delete();
        }
      }
    }
  };
}

const ProjectionBuilder = class {
  constructor(methofToExecute) {
    const projection = {};
    this.withBasicInfo = () => {
      projection[TableFields.ID] = 1;
      projection[TableFields.title] = 1;
      projection[TableFields.description] = 1;
      projection[TableFields.associatedClients] = 1;
      projection[TableFields.serviceType] = 1;
      projection[TableFields.deadlineDetails] = 1;
      projection[TableFields.startDate] = 1;
      projection[TableFields.endDate] = 1;
      projection[TableFields.isAllDay] = 1;
      projection[TableFields.colorCode] = 1;
      projection[TableFields.isCompleted] = 1;

      return this;
    };

    this.withId = () => {
      projection[TableFields.ID] = 1;
      return this;
    };

    this.withAssociatedClients = () => {
      projection[TableFields.associatedClients] = 1;
      return this;
    };

    this.execute = async () => {
      return await methofToExecute.call(projection);
    };
  }
};


module.exports = CalenderEventService;
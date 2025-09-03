const {
    TableFields,
    ValidationMsg,
    ServiceType,
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const Calender = require("../models/calender");

class CalenderService {
    static findById = (id) => {
        return new ProjectionBuilder(async function () {
            return await Calender.findOne(
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

        return await Calender.findOne({
            [TableFields.serviceType]: serviceType,
        });
    };

    static insertRecord = async (calenderFields) => {
        const calender = new Calender(calenderFields);
        let error = calender.validateSync();
        let createdCalenderRecord;

        if (error) {
            throw error;
        } else {
            try {
                createdCalenderRecord = await calender.save();
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
            projection[TableFields.associatedClients] = 1;
            projection[TableFields.serviceType] = 1;
            projection[TableFields.deadlineDetails] = 1;
            projection[TableFields.colorCode] = 1;
            projection[TableFields.isCompleted] = 1;
            projection[TableFields.deleted] = 1;
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


module.exports = CalenderService;
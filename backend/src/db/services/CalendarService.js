const {
    TableFields,
    ValidationMsg,
    ServiceType,
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const Calendar = require("../models/calendar");

class CalendarService {
    static findById = (id) => {
        return new ProjectionBuilder(async function () {
            return await Calendar.findOne(
                {
                    id,
                },
                this
            );
        });
    };

    static getAllEventsByDate = () => {
        return new ProjectionBuilder(async function () {
            return await Calendar.find({
                [TableFields.deleted] : false
            })
        })
    }

    static getEventByDateAndDeadlineCategory = (date, deadlineCategory) => {
        return new ProjectionBuilder(async function() {
            return await Calendar.findOne({
                [TableFields.date] : date,
                [TableFields.deadlineCategory] : deadlineCategory
            })
        })
    }

    static checkEventExists = async (date, deadlineCategory, serviceType)  => {
        return await Calendar.exists(
            {
                [TableFields.date] : date,
                [TableFields.serviceType] : serviceType,
                [TableFields.deadlineCategory] : deadlineCategory
            }
        )
    }

    static updateEventField = async (eventId, reqBody) => {
        return await Calendar.findByIdAndUpdate(
            eventId,
            {
                [TableFields.deadlineCategory] : reqBody[TableFields.deadlineCategory]
            }
        )
    }

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

        return await Calendar.findOne({
            [TableFields.serviceType]: serviceType,
        });
    };

    static insertRecord = async (calendarFields) => {
        const calendar = new Calendar(calendarFields);
        let error = calendar.validateSync();
        let createdCalendarRecord;

        if (error) {
            throw error;
        } else {
            try {
                createdCalendarRecord = await calendar.save();
                return createdCalendarRecord;
            } catch (e) {
                if (createdCalendarRecord) {
                    await createdCalendarRecord.delete();
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


module.exports = CalendarService;
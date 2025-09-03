const {
    TableFields,
    ValidationMsg,
    ServiceType,
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const Calendar = require("../models/calendar");
const { MongoUtil } = require("../mongoose");

class CalendarService {
    static findById = (id) => {
        return new ProjectionBuilder(async function () {
            return await Calendar.findOne(
                {
                    [TableFields.ID] : MongoUtil.toObjectId(id)
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

    static updateEvent = async (eventId, updatedFields = {}) => {
        return await Calendar.findByIdAndUpdate(
            { 
                [TableFields.ID]: MongoUtil.toObjectId(eventId)
            },
            updatedFields,
            { new: true } 
        );
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

        return await Calendar.findOne({
            [TableFields.serviceType]: serviceType,
        });
    };

    static updateDeleteEvent = async (eventId) => {
        return await Calendar.findByIdAndUpdate(
            {
                [TableFields.ID] : eventId
            },
            {
                [TableFields.deleted] : true
            }
        )
    }

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
            projection[TableFields.deadlineCategory] = 1;
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
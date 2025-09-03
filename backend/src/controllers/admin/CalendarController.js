const CalendarService = require("../../db/services/CalendarService");
const { TableFields, ValidationMsg } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

exports.addEvent = async (req) => {
    const reqBody = req.body;
    const date = reqBody[TableFields.date];

    return await parseAndValidateEvent(reqBody, undefined, async (updatedFields) => {
        return await CalendarService.insertRecord(updatedFields);
    }) 
}

exports.getAllEvents = async (req) => {
    console.log("object");
    const events = await CalendarService.getAllEventsByDate().withBasicInfo().execute();
    console.log(events);
    return events;
}

async function parseAndValidateEvent(
    reqBody,
    existingField = {},
    onValidationCompleted = async (updatedFields) => {}
) {
    if(isFieldEmpty(reqBody[TableFields.date], existingField[TableFields.date])){
        throw new ValidationError(ValidationMsg.DateEmpty);
    }

    if(isFieldEmpty(reqBody[TableFields.deadlineCategory], existingField[TableFields.deadlineCategory])){
        throw new ValidationError(ValidationMsg.DeadlineCategoryEmpty);
    }

    const response = await onValidationCompleted({
        [TableFields.date] : reqBody[TableFields.date],
        [TableFields.deadlineCategory] : reqBody[TableFields.deadlineCategory]

    })
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


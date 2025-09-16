const CalendarService = require("../../db/services/CalendarService");
const ClientService = require("../../db/services/ClientService");
const { TableFields, ValidationMsg } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

exports.addEvent = async (req) => {
    const reqBody = req.body;
    const date = reqBody[TableFields.date];

    return await parseAndValidateEvent(
        reqBody,
        undefined,
        async (updatedFields) => {
            let existingEvent =
                await CalendarService.getEventByDateAndDeadlineCategory(
                    date,
                    reqBody.deadlineCategory
                )
                    .withBasicInfo()
                    .execute();

            if (existingEvent) {
                let clientsArray = existingEvent[TableFields.associatedClients] || [];
                let newClient = updatedFields[TableFields.associatedClients][0];

                // avoid duplicates
                const alreadyExists = clientsArray.some(
                    (c) =>
                        c[TableFields.clientDetails][TableFields.clientId] ===
                        newClient[TableFields.clientDetails][TableFields.clientId]
                );

                if (!alreadyExists) {
                    clientsArray.push(newClient);
                    await CalendarService.updateRecord(existingEvent[TableFields.ID], {
                        [TableFields.associatedClients]: clientsArray,
                    });
                }

                return existingEvent;
            } else {
                return await CalendarService.insertRecord(updatedFields);
            }
        }
    );
};

exports.setServiceEndDate = async (client) => {
    const endDate = client[TableFields.endDate];
    return await CalendarService.insertRecord(endDate);
};

exports.getAllEvents = async (req) => {
    const events = await CalendarService.getAllEventsByDate()
        .withBasicInfo()
        .execute();
    return events;
};

exports.editEvent = async (req) => {
    const reqBody = req.body;
    const eventId = req.params[TableFields.ID];

    const event = await CalendarService.findById(eventId)
        .withBasicInfo()
        .execute();
    if (!event) {
        throw new ValidationError(ValidationMsg.EventNotFound);
    }

    return await parseAndValidateEvent(reqBody, event, async (updatedFields) => {
        return await CalendarService.updateEvent(eventId, updatedFields);
    });
};

exports.deleteEvent = async (req) => {
    const eventId = req.params[TableFields.ID];
    const event = await CalendarService.findById(eventId)
        .withBasicInfo()
        .execute();

    if (!event) {
        throw new ValidationError(ValidationMsg.EventNotFound);
    }

    return await CalendarService.updateDeleteEvent(eventId);
};

async function parseAndValidateEvent(
    reqBody,
    existingField = {},
    onValidationCompleted = async (updatedFields) => { }
) {
    if (
        isFieldEmpty(reqBody[TableFields.date], existingField[TableFields.date])
    ) {
        throw new ValidationError(ValidationMsg.DateEmpty);
    }

    if (
        isFieldEmpty(
            reqBody[TableFields.deadlineCategory],
            existingField[TableFields.deadlineCategory]
        )
    ) {
        throw new ValidationError(ValidationMsg.DeadlineCategoryEmpty);
    }

    let clientEmail = reqBody.clientEmail;

    let client = await ClientService.findByEmail(clientEmail)
        .withBasicInfo()
        .execute();

    if (!client) {
        throw new ValidationError("Client not found");
    }

    let clientData = {
        [TableFields.clientDetails]: {
            [TableFields.clientId]: client[TableFields.ID],
            [TableFields.clientName]: client[TableFields.name_],
            [TableFields.clientEmail]: client[TableFields.email],
        },
    };

    const updatedFields = {
        [TableFields.date]: reqBody[TableFields.date],
        [TableFields.deadlineCategory]: reqBody[TableFields.deadlineCategory],
        [TableFields.associatedClients]: [clientData],
    };

    return await onValidationCompleted(updatedFields);
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

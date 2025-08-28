const { TableFields, ValidationMsg, NotificationTypes }  =  require("../../utils/constants");
const ValidationError = require('../../utils/ValidationError');
const Util = require('../../utils/util');
const NotificationService = require('../../db/services/NotificationService');


exports.addNotification = async (req) => {
    let reqBody = req.body;
    let receiverId = reqBody[TableFields.receiverId];

    const result = await parseAndValidateNotification(
        reqBody,
        async function (updatedFields){
            return await NotificationService.insertRecord(updatedFields)
        }
    )
}


async function parseAndValidateNotification (
    reqBody,
    onValidationCompleted = async(updatedFields) =>{}
){
    if(isFieldEmpty(reqBody[TableFields.receiverId])){
        throw new ValidationError(ValidationMsg.ReceiverIdEmpty)
    }
    if(isFieldEmpty(reqBody[TableFields.message])){
        throw new ValidationError(ValidationMsg.MessageEmpty)
    }
    if(isFieldEmpty(reqBody[TableFields.notificationType])){
        throw new ValidationError(ValidationMsg.NotificationTypeEmpty);
    }

    let notificationType = reqBody[TableFields.notificationType];

    let notfType = null;
    if(typeof notificationType === 'string'){
        const notificationTypeMap = {
            upcomingDeadline : NotificationTypes.upcomingDeadline,
            missingDocuments : NotificationTypes.missingDocuments,
            feedback : NotificationTypes.feedback,
            documentStatus : NotificationTypes.documentStatus,
            clientActiveStatus : NotificationTypes.clientActiveStatus,
            systemUpdate : NotificationTypes.systemUpdate,
            payrollReminder : NotificationTypes.payrollReminder,
        };
        notfType = notificationTypeMap[notificationType];
    }

    const response = await onValidationCompleted({
        [TableFields.receiverId]: reqBody[TableFields.receiverId],
        [TableFields.notificationType]: notfType,
        [TableFields.message]: reqBody[TableFields.message],
        [TableFields.expiresAt]: reqBody[TableFields.expiresAt] || null,
    })
    
    return response;


}

function isFieldEmpty(existingField) {
  if (existingField) {
    return false;
  }
  return true;
}
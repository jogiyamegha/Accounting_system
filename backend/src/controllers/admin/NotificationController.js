const { TableFields, ValidationMsg, NotificationTypes }  =  require("../../utils/constants");
const ValidationError = require('../../utils/ValidationError');
const NotificationService = require('../../db/services/NotificationService');
const ClientService = require("../../db/services/ClientService");

exports.addNotification = async (req) => {
    let reqBody = req.body;
    let client = await ClientService.findByEmail(reqBody[TableFields.email]).withBasicInfo().execute();

    let receiverId = client[TableFields.ID];
    // console.log("reqBody", reqBody);
    const result = await parseAndValidateNotification(
        reqBody,
        receiverId,
        async function (updatedFields){
            return await NotificationService.insertRecord(updatedFields)
        }
    )
}

exports.getAllNotifications = async (req) => {
    let userId = req.user[TableFields.ID];
    
    const notification = await NotificationService.findByReceiverId(userId)
    .withBasicInfo()
    .execute()
    
    return notification;
}


async function parseAndValidateNotification (
    reqBody,
    receiverId,
    onValidationCompleted = async(updatedFields) =>{}
){
    if(isFieldEmpty(receiverId)){
        throw new ValidationError(ValidationMsg.ReceiverIdEmpty)
    }
    if(isFieldEmpty(reqBody[TableFields.message])){
        throw new ValidationError(ValidationMsg.MessageEmpty)
    }
    if(isFieldEmpty(reqBody.type)){
        throw new ValidationError(ValidationMsg.NotificationTypeEmpty);
    }

    let notificationType = reqBody.type;

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
        [TableFields.receiverId]: receiverId,
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
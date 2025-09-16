const { TableFields, ValidationMsg, NotificationTypes }  =  require("../../utils/constants");
const ValidationError = require('../../utils/ValidationError');
const NotificationService = require('../../db/services/NotificationService');
const ClientService = require("../../db/services/ClientService");

exports.addNotification = async (req) => {
    let reqBody = req.body;
    let client = await ClientService.findByEmail(reqBody[TableFields.email]).withBasicInfo().execute();

    let receiverId = client[TableFields.ID];

    let existingNotification = await NotificationService.getExistingNotification(receiverId, reqBody.type, reqBody[TableFields.expiresAt] , reqBody.message);


    // if (existingNotification) {
    //     return existingNotification; 
    // }
    // const result = await parseAndValidateNotification(
    //     reqBody,
    //     receiverId,
    //     async function (updatedFields){
    //         return await NotificationService.insertRecord(updatedFields)
    //     }
    // )

    // return result;
}

exports.getAllNotifications = async (req) => {
    // let userId = req.user[TableFields.ID];

    const notification = await NotificationService.findByNotifications()
    .withBasicInfo()
    .execute()

    return notification;
}

exports.setNotificationMarkAsRead = async (req) => {
    const id = req.params._id;
    await NotificationService.setNotificationMarkAsRead(id);
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
            "UpComing Deadline" : NotificationTypes.upcomingDeadline,
            "Missing Document" : NotificationTypes.missingDocuments,
           "Feedback"  : NotificationTypes.feedback,
            "Document Status" : NotificationTypes.documentStatus,
            "Client Active Status" : NotificationTypes.clientActiveStatus,
            "System Update" : NotificationTypes.systemUpdate,
            "Payroll Alert" : NotificationTypes.payrollReminder,
            "Service Overdue" : NotificationTypes.serviceOverdue,
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
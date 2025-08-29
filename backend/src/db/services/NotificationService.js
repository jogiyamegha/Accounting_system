const Notification = require("../models/notification");
const {
  TableFields,
  TableNames,
  UserTypes,
  ValidationMsg,
  InterfaceType,
  NotificationTypes,
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const Util = require("../../utils/util");
const { MongoUtil } = require("../../db/mongoose");

class NotificationService {
  static findByReceiverId = (receiverId) => {
    return new ProjectionBuilder(async function () {
      return await Notification.find(
        { [TableFields.receiverId]: receiverId },
        this
      );
    });
  };

  static getNotificationById = (notificationId) => {
    return new ProjectionBuilder(async function () {
      return await Notification.findOne(
        { [TableFields.ID]: notificationId },
        this
      );
    });
  };

  static notificationExists = async (notificationId) => {
    return await Notification.exists({
      [TableFields.ID]: MongoUtil.toObjectId(notificationId),
    });
  };

  static getExistingNotification = async (receiverId, type, expiresAt, message) => {
    let notificationType = type;

    let notfType = null;
    if (typeof notificationType === "string") {
      const notificationTypeMap = {
        "UpComing Deadline": NotificationTypes.upcomingDeadline,
        "Missing Document": NotificationTypes.missingDocuments,
        "Feedback": NotificationTypes.feedback,
        "Document Status": NotificationTypes.documentStatus,
        "Client Active Status": NotificationTypes.clientActiveStatus,
        "System Update": NotificationTypes.systemUpdate,
        "Payroll Alert": NotificationTypes.payrollReminder,
      };
      notfType = notificationTypeMap[notificationType];
    }

    

    const existingNotification = await Notification.findOne({
      receiverId: receiverId,
      notificationType: notfType,
      expiresAt: expiresAt,
      message: message,
      deleted: false
    });

    // console.log("22",existingNotification)
    return existingNotification;
  };

  static insertRecord = async (notificationFields) => {
    const notification = new Notification(notificationFields);

    let error = notification.validateSync();
    let createdNotificationRecord;
    if (error) {
      throw error;
    } else {
      try {
        createdNotificationRecord = await notification.save();
        return createdNotificationRecord;
      } catch (e) {
        if (createdNotificationRecord) {
          await createdNotificationRecord.delete();
        }
      }
    }
  };

  static setNotificationMarkAsRead = async (id) => {
    return await Notification.findByIdAndUpdate(
      {
        [TableFields.ID]: MongoUtil.toObjectId(id),
      },
      {
        [TableFields.isRead]: true,
      }
    );
  };

  static deleteMyReferences = async (
    cascadeDeleteMethodReference,
    tableName,
    ...referenceId
  ) => {
    let records = undefined;
    switch (tableName) {
      case TableNames.Notification:
        records = await Notification.find({
          [TableFields.ID]: {
            $in: referenceId,
          },
        });
        break;
    }
    if (records && records.length > 0) {
      let deleteRecordIds = records.map((a) => a[TableFields.ID]);
      await Notification.updateOne(
        {
          [TableFields.ID]: { $in: deleteRecordIds },
        },
        {
          $set: { [TableFields.deleted]: true },
        }
      );

      if (tableName != TableNames.Notification) {
        cascadeDeleteMethodReference.call(
          {
            ignoreSelfCall: true,
          },
          TableNames.Notification,
          ...deleteRecordIds
        );
      }
    }
  };
}

const ProjectionBuilder = class {
  constructor(methodToExecute) {
    const projection = {};
    this.withBasicInfo = () => {
      projection[TableFields.ID] = 1;
      projection[TableFields.receiverId] = 1;
      projection[TableFields.notificationType] = 1;
      projection[TableFields.isRead] = 1;
      projection[TableFields.expiresAt] = 1;
      projection[TableFields.message] = 1;
      projection[TableFields.deleted] = 1;

      return this;
    };

    this.withId = () => {
      projection[TableFields.ID] = 1;
      return this;
    };

    this.execute = async () => {
      return await methodToExecute.call(projection);
    };
  }
};

module.exports = NotificationService;

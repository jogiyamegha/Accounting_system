const mongoose = require("mongoose");
const {TableFields, TableNames, NotificationTypes, ValidationMsg} = require('../../utils/constants');

const Schema = mongoose.Schema;

const notificationSchema = new Schema(
    {
        [TableFields.receiverId]: {
            type: mongoose.Schema.Types.ObjectId,
            ref: TableNames.Client,
        },
        [TableFields.message]: {
            type: String,
            trim: true,
            required: [true, ValidationMsg.MessageEmpty],
        },
        [TableFields.notificationType]: {
            type: Number,
            enum: Object.values(NotificationTypes),
        },
        [TableFields.isRead] : {
            type : Boolean,
            default : false
        },
        [TableFields.expiresAt] : {
            type : Date
        },
        [TableFields.deleted] : {
            type : Boolean,
            default : false
        }
    },
    {
        timeStamps: true,
    }
);

const Notification = mongoose.model(
    TableNames.Notification,
    notificationSchema
);
module.exports = Notification;

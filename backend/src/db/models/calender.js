const mongoose = require("mongoose");
const { TableFields, TableNames, DeadlineCategory, ValidationMsg, ServiceType } = require('../../utils/constants');
 
const Schema = mongoose.Schema;
 
const calenderSchema = new Schema(
    {
        [TableFields.title]: {
            type: String,
            trim: true,
            required: [true, ValidationMsg.TitleEmpty],
        },
        // [TableFields.description]: {
        //     type: String,
        // },
        [TableFields.associatedClients]: [
            {
                [TableFields.ID]: false,
                [TableFields.clientDetails]: {
                    [TableFields.clientId]: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: TableNames.Client,
                    },
                    // [TableFields.clientName]: {
                    //     type: String,
                    //     trim: true,
                    //     required: [true, ValidationMsg.NameEmpty],
                    // },
                },
            },
        ],
        [TableFields.serviceType]: {
            type: Number,
            enum: Object.values(ServiceType),
        },
        [TableFields.deadlineDetails]: {
            [TableFields.deadlineCategory]: {
                type: Number,
                enum: Object.values(DeadlineCategory),
            },
            [TableFields.deadline]: {
                type: Date,
            },
        },
        // [TableFields.startDate]: {
        //     type: Date,
        // },
        // [TableFields.endDate]: {
        //     type: Date,
        // },
        // [TableFields.isAllDay]: {
        //     type: Boolean,
        //     default: false,
        // },
        [TableFields.colorCode]: {
            type: String,
        },
        [TableFields.isCompleted]: {
            type: Boolean,
            default: false,
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
 
const Calender = mongoose.model(TableNames.Calender, calenderSchema);
module.exports = Calender;
 
 
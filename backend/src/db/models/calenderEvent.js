const mongoose = require("mongoose");
const { TableFields, TableNames, DeadlineCategory } = require('../../utils/constants');
 
const Schema = mongoose.Schema;
 
const calenderEventSchema = new Schema(
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
            enum: Object.values(ServiceTypes),
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
 
const CalenderEvent = mongoose.model(TableNames.CalenderEvent, calenderEventSchema);
module.exports = CalenderEvent;
 
 
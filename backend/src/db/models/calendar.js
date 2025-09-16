const mongoose = require("mongoose");
const {
  TableFields,
  TableNames,
  DeadlineCategory,
  ValidationMsg,
  ServiceType,
  DeadlineCategoryColor,
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const validator = require("validator");



const Schema = mongoose.Schema;

const calendarSchema = new Schema(
  {
    [TableFields.date]: {
      type: Date,
      required: [true, ValidationMsg.DateEmpty],
    },
    [TableFields.associatedClients]: [
      {
        [TableFields.ID]: false,
        [TableFields.clientDetails]: {
          [TableFields.clientId]: {
            type: mongoose.Schema.Types.ObjectId,
            ref: TableNames.Client,
          },
          [TableFields.clientName]: {
            type: String,
            trim: true,
          },
          [TableFields.clientEmail]: {
            type: String,
            trim: true,
            required: [true, ValidationMsg.EmailEmpty],
            lowercase: true,
            validate(value) {
              if (!validator.isEmail(value)) {
                throw new ValidationError(ValidationMsg.EmailInvalid);
              }
            },
          },
        },
      },
    ],
    [TableFields.deadlineCategory]: {
      // type: Number,
      // enum: Object.values(DeadlineCategory),
      type: String,
      required: [true, ValidationMsg.DeadlineCategoryEmpty],
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
    // [TableFields.colorCode]: {
    //   type: String,
    //   enum: Object.values(DeadlineCategoryColor),
    // },
    [TableFields.isCompleted]: {
      type: Boolean,
      default: false,
    },
    [TableFields.deleted]: {
      type: Boolean,
      default: false,
    },
  },
  {
    timeStamps: true,
  }
);

const Calendar = mongoose.model(TableNames.Calendar, calendarSchema);
module.exports = Calendar;

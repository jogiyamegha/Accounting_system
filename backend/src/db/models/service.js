const mongoose = require("mongoose");
const {ValidationMsg, TableFields, TableNames} = require('../../utils/constants');
const Schema = mongoose.Schema;
const validator = require("validator");

const serviceSchema = new Schema(
    {
        [TableFields.serviceType]: {
            type: Number,
            enum: Object.values(ServiceTypes),
            required: [true, ValidationMsg.ServiceTypeEmpty],
        },
        [TableFields.targetCompletionDate]: {
            type: Date,
            required: [true, ValidationMsg.TargetCompletionDateEmpty],
        },
        [TableFields.description]: {
            type: String,
        },
        [TableFields.assignedStaff]: {
            [TableFields.accountantName]: {
                type: String,
                trim: true,
                required: [true, ValidationMsg.AccountantNameEmpty],
            },
            [TableFields.email]: {
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
    {
        timeStamps: true,
    }
);

const Service = mongoose.model(TableNames.Service, serviceSchema);
module.exports = Service;

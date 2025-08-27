const mongoose = require("mongoose");
const {ValidationMsg, TableFields, TableNames , ServiceType} = require('../../utils/constants');
const Schema = mongoose.Schema;

const serviceSchema = new Schema(
    {
        [TableFields.clientEmail]: {
            type: String,
            trim: true
        },
        [TableFields.services] : [
            {
                [TableFields.serviceType] : {
                    type: Number,
                    enum: Object.values(ServiceType),
                    required: [true, ValidationMsg.ServiceTypeEmpty],
                },
                [TableFields.serviceStartDate] : {
                    type : Date
                },
                [TableFields.serviceEndDate] : {
                    type : Date
                }
            }
        ]
    },
    {
        timeStamps: true,
    }
);

const Service = mongoose.model(TableNames.Service, serviceSchema);
module.exports = Service;

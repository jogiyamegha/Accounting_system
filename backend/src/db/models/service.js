const mongoose = require("mongoose");
const {ValidationMsg, TableFields, TableNames , ServiceType, ServiceStatus, ServiceDuration} = require('../../utils/constants');
const Schema = mongoose.Schema;

const serviceSchema = new Schema(
    {
        [TableFields.serviceName] : {
            type: String,
            trim: true,
            required: [true, ValidationMsg.ServiceNameEmpty]
        },
        [TableFields.serviceDuration] : {
            type : Number,
            required: [true, ValidationMsg.ServiceDurationEmpty]
        },
        [TableFields.deleted] : {
            type : Boolean,
            default: false
        }
    },
    {
        timeStamps: true,
    }
);

const Service = mongoose.model(TableNames.Service, serviceSchema);
module.exports = Service;

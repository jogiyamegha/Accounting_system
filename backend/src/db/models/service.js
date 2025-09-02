const mongoose = require("mongoose");
const {ValidationMsg, TableFields, TableNames , ServiceType, ServiceStatus, ServiceDuration} = require('../../utils/constants');
const Schema = mongoose.Schema;

const serviceSchema = new Schema(
    {
        [TableFields.clientDetail] : {

            [TableFields.clientEmail]: {
                type: String,
                trim: true
            },
            [TableFields.clientId] : {
                type : mongoose.Schema.Types.ObjectId,
                ref: TableNames.Client,
                required : [true, ValidationMsg.ClientIdEmpty]
            },
            [TableFields.clientName] : {
                type : String,
                trim : true
            }
        },

        [TableFields.services] : [
            {
                [TableFields.serviceType] : {
                    type: Number,
                    enum: Object.values(ServiceType),
                    required: [true, ValidationMsg.ServiceTypeEmpty],
                },
                [TableFields.serviceDuration] : {
                    type: Number,
                    enum : Object.values(ServiceDuration)
                },
                [TableFields.serviceStartDate] : {
                    type : Date,
                    default : Date.now()
                },
                [TableFields.serviceEndDate] : {
                    type : Date
                },
                [TableFields.serviceStatus] : {
                    type: Number,
                    enum : Object.values(ServiceStatus),
                    default : 1
                },
                [TableFields.deleted] : {
                    type: Boolean,
                    default: false
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

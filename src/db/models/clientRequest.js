const mongoose = require("mongoose");
const { TableFields, TableNames} = require('../../utils/constants');
const Schema = mongoose.Schema;

const clientRequestSchema = new Schema(
    {
        [TableFields.clientId]: {
            type: mongoose.Schema.Types.ObjectId,
            ref: TableNames.Client,
        },
        [TableFields.serviceDetails] : {

            [TableFields.serviceId]: {
                type: mongoose.Schema.Types.ObjectId,
                ref: TableNames.Service,
            },
            [TableFields.documents]: [
                {
                    [TableFields.ID]: false,
                    [TableFields.document]: {
                        type: String,
                    },
                },
            ],
            [TableFields.status]: {
                type: Number,
                enum: Object.values(Status),
            },
            [TableFields.note]: {
                type: String,
            },
            [TableFields.requestedOn]:{
                type: Date,
            },
            [TableFields.serviceStartDate]:{
                type: Date
            },
            [TableFields.serviceEndDate]:{
                type: Date
            }
        },
    },
    {
        timeStamps: true
    }
);

const ClientRequest = mongoose.model(
    TableNames.ClientRequest,
    clientRequestSchema
);
module.exports = ClientRequest;

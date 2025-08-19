const mongoose = require("mongoose");
const {
  ValidationMsg,
  TableFields,
  TableNames,
  RequestStatus,
  DocumentType,
  DurationType,
} = require("../../utils/constants");

const Schema = mongoose.Schema;

const VATserviceSchema = new Schema(
  {
    [TableFields.clientDetails]: {
      [TableFields.clientId]: {
        type: mongoose.Schema.Types.ObjectId,
        ref: TableNames.Client,
      },
      [TableFields.documents]: [
        {
          [TableFields.ID]: false,
          [TableFields.document]: {
            type: String,
            trim: true,
            required: [true, ValidationMsg.DocumentEmpty],
          },
        },
      ],
      [TableFields.requestedOn]: {
        type: Date,
        default: Date.now(),
      },
      [TableFields.requestStatus]: {
        type: Number,
        default: 1,
        enum: Object.values(RequestStatus),
      },
      [TableFields.serviceStartDate]: {
        type: Date,
      },
      [TableFields.serviceEndDate]: {
        type: Date,
      },
      [TableFields.durationType]: {
        type: Number,
        enum: Object.values(DurationType),
      },
      [TableFields.startingAmount]: {
        type: Number,
      },
      [TableFields.totalAmount]: {
        type: Number,
      },
    },
    [TableFields.serviceDetails]: {
      [TableFields.serviceId]: {
        type: mongoose.Schema.Types.ObjectId,
        ref: TableNames.Service,
        required: [true, ValidationMsg.ServiceIdEmpty],
      },
    },
    // [TableFields.requiredDocumentList]: [
    //   {
    //     [TableFields.documentType]: {
    //       type: Number,
    //       enum: Object.values(DocumentType),
    //       required: [true, ValidationMsg.DocumentTypeEmpty],
    //     },
    //   },
    // ],
  },
  {
    timeStamps: true,
  }
);

const VATservice = mongoose.model(TableNames.VATservice, VATserviceSchema);
module.exports = VATservice;

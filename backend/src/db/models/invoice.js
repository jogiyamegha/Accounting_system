const mongoose = require("mongoose");
const { ValidationMsg, TableFields, TableNames, DocumentType, DocStatus} = require('../../utils/constants')
const Schema = mongoose.Schema;

const invoiceSchema = new Schema(
    {
        [TableFields.clientId]: {
            type: mongoose.Schema.Types.ObjectId,
            ref: TableNames.Client,
        },
        [TableFields.invoiceList]: [
            {
                [TableFields.ID] : false,
                [TableFields.invoiceNumber] : {
                    type: String,
                    trim: true
                },
                [TableFields.invoice] : {
                    type : String,
                    trim : true
                }
            },
        ],
        [TableFields.deleted] : {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true,
    }
);

const Invoice = mongoose.model(TableNames.Invoice, invoiceSchema);
module.exports = Invoice;

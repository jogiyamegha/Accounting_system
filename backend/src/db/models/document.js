const mongoose = require("mongoose");
const { ValidationMsg, TableFields, TableNames, DocumentType, DocStatus} = require('../../utils/constants')
const Schema = mongoose.Schema;

const documentSChema = new Schema(
    {
        [TableFields.clientId]: {
            type: mongoose.Schema.Types.ObjectId,
            ref: TableNames.Client,
        },
        [TableFields.documents]: [
            {
                
                [TableFields.documentDetails]: {
                    [TableFields.docStatus]: {
                        type: Number,
                        enum: Object.values(DocStatus),
                    },
                    [TableFields.documentType]: {
                        type: Number,
                        enum: Object.values(DocumentType),
                    },
                    [TableFields.document]: {
                        type: String,
                        required: true,
                    },
                    [TableFields.comments]: {
                        type: String,
                    },
                    [TableFields.uploadedAt]: {
                        type: Date,
                    },
                },
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

const Document = mongoose.model(TableNames.Document, documentSChema);
module.exports = Document;

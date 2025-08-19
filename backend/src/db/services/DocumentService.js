const Document = require("../models/document");
const { TableFields, TableNames, DocStatus } = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");
const { MongoUtil } = require("../mongoose");

class DocumentService {
  static findById = (id) => {
    return new ProjectionBuilder(async function () {
      return await Document.findOne(
        {
          id,
        },
        this
      );
    });
  };

  static getDocsByClientId = (clientId) => {
    return new ProjectionBuilder(async function () {
      return await Document.findOne({ [TableFields.clientId]: clientId }, this);
    });
  };

  static existsWithClient = async (clientId) => {
    return await Document.exists({
      [TableFields.clientId]: clientId,
    });
  };

  static insertRecord = async (documentFields) => {
    const document = new Document(documentFields);
    let error = document.validateSync();
    let createdDocumentRecord;

    if (error) {
      throw error;
    } else {
      try {
        createdDocumentRecord = await document.save();
        return createdDocumentRecord;
      } catch (e) {
        if (createdDocumentRecord) {
          await createdDocumentRecord.delete();
        }
      }
    }
  };

  static upsertDocumentForClient = async (clientId, docDetail) => {
    let documents = {
      [TableFields.documentDetails]:
        docDetail[TableFields.documents][0][TableFields.documentDetails],
    };
    const updatedDoc = await Document.findOneAndUpdate(
      {
        [TableFields.clientId]: clientId,
      },
      {
        $push: {
          [TableFields.documents]: documents,
        },
      },
      { upsert: true, new: true }
    );

    return updatedDoc;
  };

  static updateDocStatus = async (clientId, documentId, newStatus, comment) => {
    if (typeof newStatus === "string") {
      const statusMap = {
        pending: DocStatus.pending,
        approved: DocStatus.approved,
        rejected: DocStatus.rejected,
      };
      newStatus = statusMap[newStatus.toLowerCase()];
    }

    if (!Object.values(DocStatus).includes(newStatus)) {
      throw new ValidationError("Invalid Document Status.");
    }

    let records = await Document.findOne({
      [TableFields.clientId]: MongoUtil.toObjectId(clientId),
    });

    let documents = records[TableFields.documents];

    const matchedDoc = documents.find(
      (doc) => doc._id.toString() === documentId.toString()
    );

    // console.log("matchedDoc", matchedDoc);

    const updatedDoc = await Document.updateOne(
      { [TableFields.clientId]: clientId },
      { $set: { "documents.$[elem].documentDetails.docStatus": newStatus ,
        "documents.$[elem].documentDetails.comments": comment
      } },
      { arrayFilters: [{ "elem._id": documentId }] }
    );

    // console.log(updatedDoc);

    return updatedDoc;
  };
}

const ProjectionBuilder = class {
  constructor(methodToExecute) {
    const projection = {};
    this.withBasicInfo = () => {
      projection[TableFields.clientId] = 1;
      projection[TableFields.documents] = 1;

      return this;
    };
    this.withId = () => {
      projection[TableFields.ID] = 1;
      return this;
    };
    this.execute = async () => {
      return await methodToExecute.call(projection);
    };
  }
};

module.exports = DocumentService;

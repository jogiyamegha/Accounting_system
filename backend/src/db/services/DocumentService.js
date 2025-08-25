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

  static upsertManyDocumentsForClient = async (clientId, documentsArray) => {
    // documentsArray = [{ documentDetails: {...} }, ...]
    if (!Array.isArray(documentsArray) || documentsArray.length === 0) {
      return await Document.findOne({ [TableFields.clientId]: clientId });
    }
    const updated = await Document.findOneAndUpdate(
      { [TableFields.clientId]: clientId },
      {
        $push: {
          [TableFields.documents]: { $each: documentsArray },
        },
      },
      { upsert: true, new: true }
    );
    return updated;
  };

  static updateManyDocumentsForClient = async (clientId, documentsArray) => {
    // documentsArray = [{ documentDetails: {...} }, ...]
    if (!Array.isArray(documentsArray) || documentsArray.length === 0) {
      return await Document.findOne({ [TableFields.clientId]: clientId });
    }
    const updated = await Document.findOneAndUpdate(
      { [TableFields.clientId]: clientId },
      {
        $set: {
          [TableFields.documents]: documentsArray ,
        },
      },
      { upsert: true, new: true }
    );
    return updated;
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

    const updatedDoc = await Document.updateOne(
      { [TableFields.clientId]: clientId },
      {
        $set: {
          "documents.$[elem].documentDetails.docStatus": newStatus,
          "documents.$[elem].documentDetails.comments": comment,
        },
      },
      { arrayFilters: [{ "elem._id": documentId }] }
    );

    return updatedDoc;
  };

  static deleteMyReferences = async (
    cascadeDeleteMethodReference,
    tableName,
    ...referenceId
  ) => {
    let records = undefined;
    // console.log(cascadeDeleteMethodReference, tableName, ...referenceId);
    switch (tableName) {
      case TableNames.Document:
        records = await Document.find({
          [TableFields.ID]: {
            $in: referenceId,
          },
        });
        break;
    }
    if (records && records.length > 0) {
      let deleteRecordIds = records.map((a) => a[TableFields.ID]);
      await Document.updateOne(
        {
          [TableFields.ID]: { $in: deleteRecordIds },
        },
        {
          $set: { [TableFields.deleted]: true },
        }
      );

      if (tableName != TableNames.Document) {
        //It means that the above objects are deleted on request from model's references (And not from model itself)
        cascadeDeleteMethodReference.call(
          {
            ignoreSelfCall: true,
          },
          TableNames.Document,
          ...deleteRecordIds
        ); //So, let's remove references which points to this model
      }
    }
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

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
          [TableFields.documents]: documentsArray,
        },
      },
      { upsert: true, new: true }
    );
    return updated;
  };

  static updateDocStatus = async (clientId, documentId, newStatus, comment) => {
    // console.log("jebhj",documentId)
    if (typeof newStatus === "string") {
      const statusMap = {
        pending: DocStatus.pending,
        approved: DocStatus.approved,
        rejected: DocStatus.rejected,
      };
      newStatus = statusMap[newStatus.toLowerCase()];
    }

    let records = await Document.findOne({
      [TableFields.clientId]: MongoUtil.toObjectId(clientId),
    });

    let documents = records[TableFields.documents];

    // console.log("3.", documents);

    const matchedDoc = documents.find(
      (doc) => doc._id.toString() === documentId
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

  static listDocuments = (filter = {}) => {
    return new ProjectionBuilder(async function () {
      let limit = filter.limit || 0;
      let skip = filter.skip || 0;
      let sortKey = filter.sortKey || TableFields._createdAt;
      let sortOrder = filter.sortOrder || 1;
      let needCount = Util.parseBoolean(filter.needCount);
      // mapping between names and numbers
      const docTypeMap = {
        1: "Financial Statements",
        2: "VAT Returns & Invoices",
        3: "Payroll & WPS Reports",
        4: "Bank Statements",
        5: "Expense Receipts",
        6: "Audit Reports",
      };

      let searchQuery = {};
      let searchTerm = filter.searchTerm;

      if (searchTerm) {
        // find matching docType keys
        const matchingTypes = Object.entries(docTypeMap)
          .filter(([key, value]) =>
            value.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(([key]) => parseInt(key));

        if (matchingTypes.length > 0) {
          searchQuery = {
            "documents.documentDetails.documentType": { $in: matchingTypes },
          };
        } else {
          // fallback: search by comments or other string fields
          searchQuery = {
            "documents.documentDetails.comments": {
              $regex: Util.wrapWithRegexQry(searchTerm),
              $options: "i",
            },
          };
        }
      }

      let baseQuery = {
        [TableFields.deleted]: false,
        ...searchQuery,
      };

      return await Promise.all([
        needCount ? Document.countDocuments(baseQuery) : undefined,
        Document.find(baseQuery)
          .limit(parseInt(limit))
          .skip(parseInt(skip))
          .sort({ [sortKey]: parseInt(sortOrder) }),
      ]).then(([total, records]) => ({ total, records }));
    });
  };

  static deleteDocFromArray = async (clientId, documentId, docArray) => {
    const matchedDoc = docArray.find(
      (doc) => doc._id.toString() === documentId
    );

    const updatedDoc = await Document.updateOne(
      { [TableFields.clientId]: MongoUtil.toObjectId(clientId) },
      {
        $set: {
          "documents.$[elem].documentDetails.deleteDoc": true,
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

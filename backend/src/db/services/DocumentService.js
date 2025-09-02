const Document = require("../models/document");
const {
  TableFields,
  TableNames,
  DocStatus,
  DocumentType,
  ServiceType,
} = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");
const { MongoUtil } = require("../mongoose");

const serviceDocMap = {
  [ServiceType.VATFiling]: [DocumentType.VATcertificate],
  [ServiceType.CorporateTaxServices]: [
    DocumentType.CorporateTaxDocument,
    DocumentType.FinancialStatements,
    DocumentType.BalanceSheet,
  ],
  [ServiceType.Payroll]: [DocumentType.Payroll, DocumentType.WPSReport],
  [ServiceType.AuditAndCompliance]: [
    DocumentType.auditFiles,
    DocumentType.BankStatement,
    DocumentType.Invoice,
  ],
};

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

  static getClientDocumentsByService = async (clientId, serviceType) => {
    const clientDocs = await Document.findOne({ clientId, deleted: false });

    const uploadedDocs =
      clientDocs?.documents?.map((d) => d.documentDetails.documentType) || [];

    const requiredDocs = serviceDocMap[serviceType] || [];

    const remainingDocs = requiredDocs.filter(
      (req) => !uploadedDocs.includes(req)
    );

    return {
      uploadedDocs: uploadedDocs.map((docType) => ({
        type: docType,
      })),
      remainingDocs: remainingDocs.map((docType) => ({
        type: docType,
      })),
    };
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

    // console.log(updatedDoc)

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
    if (!Array.isArray(documentsArray)) {
      throw new Error("documentsArray must be an array");
    }

    const existingDocRecord = await Document.findOne({
      [TableFields.clientId]: clientId,
    });
    let existingDocs = existingDocRecord
      ? existingDocRecord[TableFields.documents] || []
      : [];

    for (const newDoc of documentsArray) {
      const newType =
        newDoc[TableFields.documentDetails]?.[TableFields.documentType];

      if (!newType) continue;

      const existingIndex = existingDocs.findIndex(
        (d) =>
          d[TableFields.documentDetails]?.[TableFields.documentType] === newType
      );

      if (existingIndex >= 0) {
        // Replace existing document of same type
        existingDocs[existingIndex] = newDoc;
      } else {
        // Append as new document
        existingDocs.push(newDoc);
      }
    }

    const updated = await Document.findOneAndUpdate(
      { [TableFields.clientId]: clientId },
      {
        $set: { [TableFields.documents]: existingDocs },
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
        1: "VATcertificate",
        2: "CorporateTaxDocument",
        3: "BankStatement",
        4: "Invoice",
        5: "auditFiles",
        6: "TradeLicense",
        7: "passport",
        8: "FinancialStatements",
        9: "BalanceSheet",
        10: "Payroll",
        11: "WPSReport",
        12: "ExpenseReciept",
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
        // [TableFields.documentDetails + "." + TableFields.deleteDoc]: false,
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

  static getWeeklyUploadStats = async () => {
    const startOfWeek = new Date();
    // console.log(startOfWeek)

    startOfWeek.setDate(startOfWeek.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    // console.log(startOfWeek)

    const docs = await Document.aggregate([
      { $unwind: "$documents" },
      { $unwind: "$documents.documentDetails" },
      {
        $match: {
          "documents.documentDetails.uploadedAt": { $gte: startOfWeek },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfWeek: "$documents.documentDetails.uploadedAt" },
            status: "$documents.documentDetails.docStatus",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // console.log("doc:",docs)

    const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // initialize week with zeros
    const result = Array.from({ length: 7 }).map((_, i) => ({
      day: daysMap[i],
      Approved: 0,
      Pending: 0,
      Rejected: 0,
    }));

    // fill in counts
    docs.forEach((d) => {
      const dayIndex = d._id.day - 1; // MongoDB: 1=Sun
      if (d._id.status === DocStatus.pending)
        result[dayIndex].Pending = d.count;
      if (d._id.status === DocStatus.approved)
        result[dayIndex].Approved = d.count;
      if (d._id.status === DocStatus.rejected)
        result[dayIndex].Rejected = d.count;
    });

    return result;
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

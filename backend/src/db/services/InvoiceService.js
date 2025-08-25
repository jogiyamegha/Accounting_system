const Invoice = require("../models/invoice");
const { TableFields, TableNames, DocStatus } = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");
const { MongoUtil } = require("../mongoose");

class InvoiceService {
  static findById = (id) => {
    return new ProjectionBuilder(async function () {
      return await Invoice.findOne(
        {
          id,
        },
        this
      );
    });
  };

  static getInvoiceByClientId = (clientId) => {
    return new ProjectionBuilder(async function () {
      return await Invoice.findOne({ [TableFields.clientId]: clientId }, this);
    });
  };

  static existsWithClient = async (clientId) => {
    return await Invoice.exists({
      [TableFields.clientId]: clientId,
    });
  };

  static insertRecord = async (invoiceFields) => {
    const invoice = new Invoice(invoiceFields);
    let error = invoice.validateSync();
    let createdInvoiceRecord;

    if (error) {
      throw error;
    } else {
      try {
        createdInvoiceRecord = await invoice.save();
        return createdInvoiceRecord;
      } catch (e) {
        if (createdInvoiceRecord) {
          await createdInvoiceRecord.delete();
        }
      }
    }
  };

  static upsertInvoiceForClient = async (clientId, invoiceArray) => {
    if (!Array.isArray(invoiceArray) || invoiceArray.length === 0) {
      return await Invoice.findOne({ [TableFields.clientId]: clientId });
    }
    const updated = await Invoice.findOneAndUpdate(
      { [TableFields.clientId]: clientId },
      {
        $push: {
          [TableFields.invoiceList]: { $each: invoiceArray },
        },
      },
      { upsert: true, new: true }
    );
    return updated;
  };

  static deleteMyReferences = async (
    cascadeDeleteMethodReference,
    tableName,
    ...referenceId
  ) => {
    let records = undefined;
    // console.log(cascadeDeleteMethodReference, tableName, ...referenceId);
    switch (tableName) {
      case TableNames.Invoice:
        records = await Invoice.find({
          [TableFields.ID]: {
            $in: referenceId,
          },
        });
        break;
    }
    if (records && records.length > 0) {
      let deleteRecordIds = records.map((a) => a[TableFields.ID]);
      await Invoice.updateOne(
        {
          [TableFields.ID]: { $in: deleteRecordIds },
        },
        {
          $set: { [TableFields.deleted]: true },
        }
      );

      if (tableName != TableNames.Invoice) {
        //It means that the above objects are deleted on request from model's references (And not from model itself)
        cascadeDeleteMethodReference.call(
          {
            ignoreSelfCall: true,
          },
          TableNames.Invoice,
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
      projection[TableFields.invoiceList] = 1;

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

module.exports = InvoiceService;

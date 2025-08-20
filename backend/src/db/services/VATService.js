const { TableFields, ValidationMsg } = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");
const VATservice = require("../models/VATservice");
const { MongoUtil } = require("../mongoose");

class VATService {
  static findById = (id) => {
    return new ProjectionBuilder(async function () {
      return await VATservice.findOne(
        {
          id,
        },
        this
      );
    });
  };

  static getVatServiceByClientId = (clientId) => {
    // console.log(clientId);
    return new ProjectionBuilder(async function () {
      return await VATservice.findOne(
        {
          [`${TableFields.clientDetails}.${TableFields.clientId}`]:
            MongoUtil.toObjectId(clientId),
        },
        this
      );
    });
  };

  static insertRecord = async (serviceFields) => {
    const vatService = new VATservice(serviceFields);
    let error = vatService.validateSync();
    let createdServiceRecord;

    if (error) {
      throw error;
    } else {
      try {
        createdServiceRecord = await vatService.save();
        return createdServiceRecord;
      } catch (e) {
        if (createdServiceRecord) {
          await createdServiceRecord.delete();
        }
      }
    }
  };
}

const ProjectionBuilder = class {
  constructor(methodToExecute) {
    const projection = {};
    this.withBasicInfo = () => {
      projection[TableFields.ID] = 1;
      projection[TableFields.clientDetails] = 1;
      projection[TableFields.serviceDetails] = 1;
      // projection[TableFields.requiredDocumentList] = 1;
      return this;
    };

    this.withId = () => {
      projection[TableFields.ID] = 1;
      return this;
    };

    this.withClientsInfo = () => {
      projection[TableFields.clients] = 1;
      return this;
    };

    this.withServiceDetails = () => {
      projection[TableFields.serviceDetails] = 1;
      return this;
    };

    this.execute = async () => {
      return await methodToExecute.call(projection);
    };
  }
};

module.exports = VATService;

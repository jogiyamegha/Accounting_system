const Client = require("../models/client");
const {
  TableFields,
  TableNames,
  UserTypes,
  ValidationMsg,
  InterfaceType,
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const Util = require("../../utils/util");
const { MongoUtil } = require("../mongoose");

class ClientService {
  static findByEmail = (email) => {
    return new ProjectionBuilder(async function () {
      return await Client.findOne({ email }, this);
    });
  };

  static totalRegisteredClients = async () => {
    const clientCounts = await Client.find({
      [TableFields.deleted]: false,
    }).countDocuments();

    return clientCounts;
  };

  static totalActiveClients = async () => {
    const clientCounts = await Client.find({
      [TableFields.isActive]: true,
      [TableFields.deleted]: false
    }).countDocuments();

    return clientCounts;
  };

  static getUserById = (userId) => {
    return new ProjectionBuilder(async function () {
      return await Client.findOne({ [TableFields.ID]: userId }, this);
    });
  };

  static existsWithEmail = async (email, exceptionId) => {
    return await Client.exists({
      [TableFields.email]: email,
      ...(exceptionId
        ? {
            [TableFields.ID]: { $ne: exceptionId },
          }
        : {}),
    });
  };

  static saveAuthToken = async (userId, token) => {
    await Client.updateOne(
      {
        [TableFields.ID]: userId,
      },
      {
        $push: {
          [TableFields.tokens]: {
            [TableFields.token]: token,
          },
        },
      }
    );
  };

  static setProfile = async (reqUser, reqBody) => {
    const id = reqUser[TableFields.ID];
    await Client.updateOne(
      {
        [TableFields.ID]: id,
      },
      {
        $set: {
          [TableFields.name_]: reqBody[TableFields.name_],
          [TableFields.contact]: {
            [TableFields.phoneCountry]: reqBody[TableFields.phoneCountry],
            [TableFields.phone]: reqBody[TableFields.phone],
          },
        },
      }
    );
  };

  static getUserByIdAndToken = (userId, token, lean = false) => {
    return new ProjectionBuilder(async function () {
      return await Client.findOne(
        {
          [TableFields.ID]: userId,
          [TableFields.tokens + "." + TableFields.token]: token,
        },
        this
      ).lean(lean);
    });
  };

  static removeAuth = async (clientId, authToken) => {
    await Client.updateOne(
      {
        [TableFields.ID]: clientId,
      },
      {
        $pull: {
          [TableFields.tokens]: { [TableFields.token]: authToken },
        },
      }
    );
  };

  static insertRecord = async (clientFields) => {
    const client = new Client(clientFields);

    let error = client.validateSync();
    let createdClientRecord;
    if (error) {
      throw error;
    } else {
      try {
        createdClientRecord = await client.save();
        return createdClientRecord;
      } catch (e) {
        if (createdClientRecord) {
          await createdClientRecord.delete();
        }
      }
    }
  };

  static insertUserRecord = async (reqBody) => {
    let email = reqBody[TableFields.email];
    email = (email + "").trim().toLocaleLowerCase();

    const password = reqBody[TableFields.password];

    if (!email) {
      throw new ValidationError(ValidationMsg.EmailEmpty);
    }
    if (!password) {
      throw new ValidationError(ValidationMsg.PasswordEmpty);
    }

    if (email == password) {
      throw new ValidationError(ValidationMsg.PasswordInvalid);
    }

    if (await ClientService.existsWithEmail(email)) {
      throw new ValidationError(ValidationMsg.DuplicateEmail);
    }

    const user = new Client(reqBody);
    user[TableFields.userType] = UserTypes.Client;

    if (!user.isValidPassword(password)) {
      throw new ValidationError(ValidationMsg.PasswordInvalid);
    }
    try {
      await user.save();
      return user;
    } catch (error) {
      if (error.code == 110000) {
        throw new ValidationError(ValidationMsg.DuplicateEmail);
      }
      throw error;
    }
  };

  static updateClient = async (clientId, clientDetails) => {
    // console.log("2",clientDetails)
    return await Client.updateOne(
      {
        [TableFields.ID]: clientId,
      },
      {
        $set: {
          [TableFields.name_]: clientDetails[TableFields.name_],
          [TableFields.position]: clientDetails[TableFields.position],
          [TableFields.contact]: {
            [TableFields.phoneCountry]: clientDetails.contact[TableFields.phoneCountry],
            [TableFields.phone]: clientDetails.contact[TableFields.phone],
          },
        },
      }
    );
  };

  static getResetPasswordToken = async (email) => {
    let user = await ClientService.findByEmail(email)
      .withId()
      .withBasicInfo()
      .withPasswordResetToken()
      .execute();
    if (!user) throw new ValidationError(ValidationMsg.AccountNotRegistered);
    let code;

    const now = new Date();

    if (
      !user[TableFields.passwordResetToken] ||
      !user[TableFields.passwordResetTokenExpiresAt] ||
      user[TableFields.passwordResetTokenExpiresAt] < now
    ) {
      code = Util.generateRandomOTP(4);
      user[TableFields.passwordResetToken] = code;
      user[TableFields.passwordResetTokenExpiresAt] = new Date(
        now.getTime() + 15 * 60000
      ); // 15 min
      await user.save();
    } else {
      code = user[TableFields.passwordResetToken];
    }

    return {
      code,
      email: user[TableFields.email],
      name: user[TableFields.name_],
    };
  };

  static resetPasswordCodeExists = async (providedEmail, otp) => {
    if (!otp) {
      return false;
    }
    let query = { [TableFields.passwordResetToken]: otp };
    if (providedEmail) {
      query[TableFields.email] = providedEmail;
    }

    const user = await Client.findOne(query);

    if (!user) return false;

    // Check expiry
    if (
      !user[TableFields.passwordResetTokenExpiresAt] ||
      user[TableFields.passwordResetTokenExpiresAt] < new Date()
    ) {
      return false; // expired
    }

    return true;
  };

  static resetPassword = async (email, code, newPassword) => {
    let user = await ClientService.findByEmail(email)
      .withId()
      .withBasicInfo()
      .withPasswordResetToken()
      .execute();

    if (!user) throw new ValidationError(ValidationMsg.AccountNotRegistered);

    if (user[TableFields.passwordResetToken] == code) {
      user[TableFields.password] = newPassword;
      user[TableFields.passwordResetToken] = "";
      user[TableFields.tokens] = [];
      return await user.save();
    } else throw new ValidationError(ValidationMsg.InvalidPassResetCode);
  };

  static updatePasswordAndInsertLatestToken = async (
    userObj,
    newPassword,
    token
  ) => {
    userObj[TableFields.tokens] = [{ [TableFields.token]: token }];
    userObj[TableFields.password] = newPassword;
    userObj[TableFields.passwordResetToken] = "";
    userObj[TableFields.passwordResetTokenExpiresAt] = "";
    await userObj.save();
  };

  static updateCompanyinProfile = async (clientId, companyId) => {
    return await Client.findByIdAndUpdate(
      clientId,
      {
        $set: {
          [TableFields.companyId]: companyId,
        },
      },
      {
        new: true,
      }
    );
  };

  static listClients = (filter = {}) => {
    return new ProjectionBuilder(async function () {
      let limit = filter.limit || 0;
      let skip = filter.skip || 0;
      let sortKey = filter.sortKey || TableFields._createdAt;
      let sortOrder = filter.sortOrder || 1;
      let needCount = Util.parseBoolean(filter.needCount);
      let searchQuery = {};

      let searchTerm = filter.searchTerm;
      if (searchTerm) {
        searchQuery = {
          $or: [
            {
              [TableFields.name_]: {
                $regex: Util.wrapWithRegexQry(searchTerm),
                $options: "i",
              },
            },
            {
              [TableFields.email]: {
                $regex: Util.wrapWithRegexQry(searchTerm),
                $options: "i",
              },
            },
          ],
        };
      }

      let baseQuery = {
        [TableFields.deleted]: false,
        ...searchQuery,
      };

      return await Promise.all([
        needCount ? Client.countDocuments(baseQuery) : undefined,
        Client.find(baseQuery)
          .limit(parseInt(limit))
          .skip(parseInt(skip))
          .sort({ [sortKey]: parseInt(sortOrder) }),
      ]).then(([total, records]) => ({ total, records }));
    });
  };

  static deleteMyReferences = async (
    cascadeDeleteMethodReference,
    tableName,
    ...referenceId
  ) => {
    let records = undefined;
    // console.log(cascadeDeleteMethodReference, tableName, ...referenceId);
    switch (tableName) {
      case TableNames.Client:
        records = await Client.find({
          [TableFields.ID]: {
            $in: referenceId,
          },
        });
        break;
    }
    if (records && records.length > 0) {
      let deleteRecordIds = records.map((a) => a[TableFields.ID]);
      await Client.updateOne(
        {
          [TableFields.ID]: { $in: deleteRecordIds },
        },
        {
          $set: { [TableFields.deleted]: true },
        }
      );

      // await removeFileById(Folders.CollegeImage, records[0].image);
      // await removeFileById(Folders.CollegeThumbnail, records[0].thumbnail);

      if (tableName != TableNames.Client) {
        //It means that the above objects are deleted on request from model's references (And not from model itself)
        cascadeDeleteMethodReference.call(
          {
            ignoreSelfCall: true,
          },
          TableNames.Client,
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
      projection[TableFields.name_] = 1;
      projection[TableFields.email] = 1;
      projection[TableFields.userType] = 1;
      projection[TableFields.contact] = 1;
      projection[TableFields.companyId] = 1;
      projection[TableFields.position] = 1;

      return this;
    };
    this.withPasswordResetToken = () => {
      projection[TableFields.passwordResetTokenExpiresAt] = 1;
      return this;
    };
    this.withEmail = () => {
      projection[TableFields.email] = 1;
      return this;
    };
    this.withPassword = () => {
      projection[TableFields.password] = 1;
      return this;
    };
    this.withUserType = () => {
      projection[TableFields.userType] = 1;
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

module.exports = ClientService;

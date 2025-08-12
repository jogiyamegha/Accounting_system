const Admin = require("../../db/models/admin");
const {
  TableFields,
  TableNames,
  ValidationMsg,
  UserTypes,
  InterfaceType,
} = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");

class AdminService {
  static findByEmail = (email) => {
    return new ProjectionBuilder(async function () {
      return await Admin.findOne({ email }, this);
    });
  };

  static existsWithEmail = async (email, exceptionId) => {
    return await Admin.exists({
      [TableFields.email]: email,
      ...(exceptionId
        ? {
            [TableFields.ID]: { $ne: exceptionId },
          }
        : {}),
    });
  };

  static getUserById = (userId) => {
    return new ProjectionBuilder(async function () {
      return await Admin.findOne({ [TableFields.ID]: userId }, this);
    });
  };

  static saveAuthToken = async (userId, token) => {
    await Admin.updateOne(
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

  static getUserByIdAndToken = (userId, token, lean = false) => {
    return new ProjectionBuilder(async function () {
      return await Admin.findOne(
        {
          [TableFields.ID]: userId,
          [TableFields.tokens + "." + TableFields.token]: token,
        },
        this
      ).lean(lean);
    });
  };

  static removeAuth = async (adminId, authToken) => {
    await Admin.updateOne(
      {
        [TableFields.ID]: adminId,
      },
      {
        $pull: {
          [TableFields.tokens]: { [TableFields.token]: authToken },
        },
      }
    );
  };

  static generateOTPCode = (digit) => {
    return Util.generateRandomPassword(digit);
  };

  static getResetPasswordToken = async (email) => {
    let user = await AdminService.findByEmail(email)
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

    const user = await Admin.findOne(query);

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
    let user = await AdminService.findByEmail(email)
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
    await userObj.save();
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

    if (await AdminService.existsWithEmail(email)) {
      throw new ValidationError(ValidationMsg.DuplicateEmail);
    }

    const user = new Admin(reqBody);
    user[TableFields.userType] = UserTypes.Admin;

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
}

const ProjectionBuilder = class {
  constructor(methodToExecute) {
    const projection = {};
    this.withBasicInfo = () => {
      projection[TableFields.name_] = 1;
      projection[TableFields.email] = 1;
      projection[TableFields.userType] = 1;
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
    this.withPasswordResetToken = () => {
      projection[TableFields.passwordResetToken] = 1;
      return this;
    };
    this.execute = async () => {
      return await methodToExecute.call(projection);
    };
  }
};

module.exports = AdminService;

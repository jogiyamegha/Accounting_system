const AdminService = require("../../db/services/AdminService");
const {
  TableFields,
  UserTypes,
  InterfaceType,
  ValidationMsg,
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const Util = require("../../utils/util");
const Email = require('../../emails/email')

exports.addAdminUser = async (req) => {
  if (Util.parseBoolean(req.headers.dbuser)) {
    await AdminService.insertUserRecord(req.body);

    let email = req.body[TableFields.email];
    email = (email + "").trim().toLowerCase();

    let user = await AdminService.findByEmail(email).withEmail().execute();

    const token = user.createAuthToken(InterfaceType.Admin.AdminWeb);
    await AdminService.saveAuthToken(user[TableFields.ID], token);
    return { user, token };
  } else {
    throw new ValidationError(ValidationMsg.NotAllowed);
  }
};

exports.login = async (req) => {
  let email = req.body[TableFields.email];
  email = (email + "").trim().toLocaleLowerCase();
  let password = req.body[TableFields.password];

  if (!email) {
    throw new ValidationError(ValidationMsg.EmailEmpty);
  }
  if (!password) {
    throw new ValidationError(ValidationMsg.PasswordEmpty);
  }

  let user = await AdminService.findByEmail(email)
    .withBasicInfo()
    .withPassword()
    .execute();

  if (user && (await user.isValidAuth(password))) {
    const token = user.createAuthToken();
    await AdminService.saveAuthToken(user[TableFields.ID], token);
    return { user, token };
  } else {
    throw new ValidationError(ValidationMsg.UnableToLogin);
  }
};

exports.logout = async (req) => {
  const headerToken = req.header("Authorization").replace("Bearer ", "");
  AdminService.removeAuth(req.user[TableFields.ID], headerToken);
  console.log("You Logged Out....");
};

exports.forgotPassword = async (req) => {
  let providedEmail = req.body[TableFields.email];
  providedEmail = (providedEmail + "").trim().toLowerCase();

  if (!providedEmail) throw new ValidationError(ValidationMsg.EmailEmpty);

  let { code, email } = await AdminService.getResetPasswordToken(providedEmail);
  Email.sendForgotPasswordMail(email, code);
};

exports.forgotPasswordCodeExists = async (req) => {
  let providedEmail = req.body[TableFields.email];
  let providedCode = req.body.code;
  if (providedEmail) {
    providedEmail = (providedEmail + "").trim().toLowerCase();
  }
  if (!providedEmail || !providedCode) {
    throw new ValidationError(ValidationMsg.ParametersError);
  }
  let exists = await AdminService.resetPasswordCodeExists(
    providedEmail,
    providedCode
  );
  if (!exists) {
    throw new ValidationError(ValidationMsg.InvalidPassResetCode);
  }
};

exports.resetPassword = async (req) => {
  let providedEmail = req.body[TableFields.email];
  providedEmail = (providedEmail + "").trim().toLowerCase();

  const { code, newPassword } = req.body;

  if (!providedEmail) throw new ValidationError(ValidationMsg.EmailEmpty);
  if (!code) throw new ValidationError(ValidationMsg.PasswordResetCodeEmpty);
  if (!newPassword) throw new ValidationError(ValidationMsg.NewPasswordEmpty);

  let user = await AdminService.resetPassword(providedEmail, code, newPassword);
  let token = await createAndStoreAuthToken(user);
  return {
    user: await AdminService.getUserById(user[TableFields.ID])
      .withPassword()
      .withUserType()
      .withBasicInfo()
      .execute(),
    token: token || undefined,
  };
};

exports.changePassword = async (req) => {
  let { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    throw new ValidationError(ValidationMsg.ParametersError);

  let user = await AdminService.getUserById(req.user[TableFields.ID])
    .withPassword()
    .withId()
    .execute();

  if (!user) {
    throw new ValidationError(ValidationMsg.RecordNotFound);
  }

  if (user && (await user.isValidAuth(oldPassword))) {
    if (!user.isValidPassword(newPassword))
      throw new ValidationError(ValidationMsg.PasswordInvalid);
    const token = user.createAuthToken();
    await AdminService.updatePasswordAndInsertLatestToken(
      user,
      newPassword,
      token
    );
    return { token };
  } else throw new ValidationError(ValidationMsg.OldPasswordIncorrect);
};

async function createAndStoreAuthToken(userObj) {
  const token = userObj.createAuthToken(InterfaceType.Admin.AdminWeb);
  await AdminService.saveAuthToken(userObj[TableFields.ID], token);
  return token;
}

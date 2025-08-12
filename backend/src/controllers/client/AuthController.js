const ClientService = require('../../db/services/ClientService');
const { TableFields, TableNames, UserTypes, InterfaceType, ValidationMsg } = require('../../utils/constants');
const ValidationError = require('../../utils/ValidationError');
const Util = require('../../utils/util');
const Email = require('../../emails/email');

exports.signUp = async(req) => {
    const reqBody = req.body;
         
    let email = req.body[TableFields.email];
    email = (email + '').trim().toLowerCase();
    let password = reqBody[TableFields.password]
    
    if (!email) {
        throw new ValidationError(ValidationMsg.EmailEmpty);
    }
    if (!password) {
        throw new ValidationError(ValidationMsg.PasswordEmpty);
    }
    
    let userExists = await ClientService.existsWithEmail(email);
    if(userExists) {
        throw new ValidationError(ValidationMsg.EmailExists)
    }

    await ClientService.insertUserRecord(reqBody);
    let user = await ClientService.findByEmail(email).withBasicInfo().execute()

    if (user && ( user.isValidPassword(password))) {
        const token = user.createAuthToken();
        await ClientService.saveAuthToken(user[TableFields.ID], token);
        return { user, token }
    }
}

exports.login = async (req) => {
    let email = req.body[TableFields.email];
    email = (email + '').trim().toLocaleLowerCase();
    let password = req.body[TableFields.password];
    
    if(!email) {
        throw new ValidationError(ValidationMsg.EmailEmpty)
    }
    if(!password) {
        throw new ValidationError(ValidationMsg.PasswordEmpty)
    }
    
    let user = await ClientService.findByEmail(email).withBasicInfo().withPassword().execute();
    
    if(user && (await user.isValidAuth(password))) {
        const token = user.createAuthToken();
        await ClientService.saveAuthToken(user[TableFields.ID] , token)

        return { user, token };
    } else {
        throw new ValidationError(ValidationMsg.UnableToLogin);
    }
}

exports.logout = async (req) => {
    const headerToken = req.header("Authorization").replace("Bearer ", "");
    ClientService.removeAuth(req.user[TableFields.ID], headerToken);
    console.log("You Logged Out....");
};

exports.forgotPassword = async (req) => {
    let providedEmail = req.body[TableFields.email];
    providedEmail = (providedEmail + "").trim().toLowerCase();

    if (!providedEmail) throw new ValidationError(ValidationMsg.EmailEmpty);

    let { code, email, name } = await ClientService.getResetPasswordToken(providedEmail);
    Email.sendForgotPasswordMail(email, code, name);
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
    let exists = await ClientService.resetPasswordCodeExists(
        providedEmail,
        providedCode
    );
    if (!exists) {
        throw new ValidationError(ValidationMsg.InvalidPassResetCode);
    }
};

exports.changePassword = async (req) => {
  // let { oldPassword, newPassword } = req.body;
    let providedEmail = req.body[TableFields.email]

    let { newPassword, confirmPassword } = req.body;

    if (!providedEmail || !newPassword || !confirmPassword)
        throw new ValidationError(ValidationMsg.ParametersError);

    if (newPassword !== confirmPassword) {
        throw new ValidationError(ValidationMsg.PasswordNotMatched);
    }

    let user = await ClientService.findByEmail(providedEmail)
        .withBasicInfo()

        .withId()
        .execute();

    if (!user) {
        throw new ValidationError(ValidationMsg.RecordNotFound);
    }

    if (user) {
        if (!user.isValidPassword(newPassword))
        throw new ValidationError(ValidationMsg.PasswordInvalid);
        const token = user.createAuthToken();
    
        await ClientService.updatePasswordAndInsertLatestToken(
            user,
            newPassword,
            token
        );
        
        Email.sendChangedPasswordMail(
            providedEmail,
            newPassword,
            user[TableFields.name_]
        );
        return { token };
    } else throw new ValidationError(ValidationMsg.PasswordInvalid);
};
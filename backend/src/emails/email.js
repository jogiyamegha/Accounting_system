const Handlebars = require("handlebars");
const { TableFields, GeneralMessages } = require("../utils/constants");
const path = require("path");
const fs = require("fs");
const customerViewDirPath = path.join(__dirname, "../templates");
const nodemailer = require("nodemailer");

exports.sendForgotPasswordMail = async (emailId, code, name) => {
  const resetPasswordTemplate = fs
    .readFileSync(
      path.join(customerViewDirPath, "admin", "forgot-password.hbs")
    )
    .toString();

  let data = {
    code: code,
    name: name,
  };

  const template = Handlebars.compile(resetPasswordTemplate);
  try {
    await sendEmail(
      emailId,
      GeneralMessages.forgotPasswordEmailSubject,
      template(data)
    );
  } catch (e) {
    console.log(e);
  }
};

exports.sendChangedPasswordMail = async (emailId, newPassword, name) => {
  const resetPasswordTemplate = fs
    .readFileSync(
      path.join(customerViewDirPath, "admin", "change-password.hbs")
    )
    .toString();

  let data = {
    newPassword: newPassword,
    name: name,
  };

  const template = Handlebars.compile(resetPasswordTemplate);
  try {
    await sendEmail(
      emailId,
      GeneralMessages.changePasswordSucess,
      template(data)
    );
  } catch (e) {
    console.log(e);
  }
};

exports.sendClientResetCode = async (name, emailId, code) => {
  const resetPasswordTemplate = fs
    .readFileSync(
      path.join(customerViewDirPath, "client", "forgot-password.hbs")
    )
    .toString();
  let data = {
    name: name,
    code: code,
  };
  const template = Handlebars.compile(resetPasswordTemplate);

  try {
    await sendEmail(
      emailId,
      GeneralMessages.forgotPasswordEmailSubject,
      template(data)
    );
  } catch (e) {
    console.log(e);
  }
};

exports.sendClientSignupMail = async (name, emailId, password) => {
  const signupTemplate = fs
    .readFileSync(path.join(customerViewDirPath, "client", "signup.hbs"))
    .toString();

  let data = {
    name: name,
    username: emailId,
    password: password,
  };
  const template = Handlebars.compile(signupTemplate);

  try {
    await sendEmail(emailId, GeneralMessages.signupEmailSucess, template(data));
  } catch (e) {
    console.log(e);
  }
};

exports.sendClientInvitationEmail = async (name, emailId, code) => {
  const invitationTemplate = fs
    .readFileSync(
      path.join(customerViewDirPath, "client", "client-invitation.hbs")
    )
    .toString();
  let data = {
    name: name,
    code: code,
    email: emailId,
  };
  const template = Handlebars.compile(invitationTemplate);
  try {
    await sendEmail(emailId, GeneralMessages.invitationLink, template(data));
  } catch (e) {
    console.log(e);
  }
};


exports.sendDocStatusMail = async (name, emailId, status, comments) => {
  const invitationTemplate = fs
    .readFileSync(
      path.join(customerViewDirPath, "client", "client-docStatus.hbs")
    )
    .toString();
  let data = {
    name: name,
    status: status,
    comment: comments,
    email: emailId,
  };

  const template = Handlebars.compile(invitationTemplate);
  try {
    await sendEmail(emailId, GeneralMessages.DocStatus, template(data));
  } catch (e) {
    console.log(e);
  }
};

exports.sendServiceAssignMail = async (name, emailId, serviceType) => {
  const invitationTemplate = fs
    .readFileSync(
      path.join(customerViewDirPath, "client", "service-assign.hbs")
    )
    .toString();
  let data = {
    name: name,
    serviceType: serviceType,
    email: emailId,
  };

  const template = Handlebars.compile(invitationTemplate);
  try {
    await sendEmail(emailId, GeneralMessages.ServiceAssign, template(data));
  } catch (e) {
    console.log(e);
  }
};

exports.sendActDActMail = async (name, emailId, status) => {
  const invitationTemplate = fs
    .readFileSync(path.join(customerViewDirPath, "client", "act-deact.hbs"))
    .toString();
 
  let clientStatus;
 
  if (status === "true") {
    clientStatus = "Activated";
  } else {
    clientStatus = "Deactivated";
  }
 
  let data = {
    name: name,
    status: clientStatus,
    email: emailId,
  };
 
  const template = Handlebars.compile(invitationTemplate);
  try {
    await sendEmail(
      emailId,
      GeneralMessages.ClientActivityStatus,
      template(data)
    );
  } catch (e) {
    console.log(e);
  }
};
 
exports.sendServiceRenewalMail = async (name, emailId, serviceName, serviceEndDate) => {
  const invitationTemplate = fs
    .readFileSync(path.join(customerViewDirPath, "client", "service-renewal.hbs"))
    .toString();
 
 
 
  let data = {
    name: name,
    email: emailId,
    serviceName: serviceName,
    serviceEndDate: serviceEndDate
  };
 
  const template = Handlebars.compile(invitationTemplate);
  try {
    await sendEmail(
      emailId,
      GeneralMessages.ClientActivityStatus,
      template(data)
    );
  } catch (e) {
    console.log(e);
  }
};
 

async function sendEmail(
  receiverEMail,
  subject,
  htmlBodyContents,
  fromAddress = process.env.SMTP_SENDER_EMAIL
) {
  let transporter = getTransportInfo();
  let mailOptions = {
    from: fromAddress,
    to: receiverEMail,
    subject: subject,
    html: htmlBodyContents,
  };

  if (process.env.diasbleEmail == true || process.env.diasbleEmail == "true") {
    return;
  }

  await transporter.sendMail(mailOptions);
}

function getTransportInfo() {
  return nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

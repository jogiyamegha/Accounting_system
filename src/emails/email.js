const Handlebars = require('handlebars');
const { GeneralMessages } = require('../utils/constants');
const path = require('path');
const fs = require('fs');
const customViewDirPath = path.join(__dirname, '../templates');
const nodemailer = require('nodemailer');;

exports.sendStudentInvitationEmail = async(name, email, code) => {
    const invitationTemplate = fs.readFileSync(path.join(customViewDirPath, 'student', 'student_invitation.hbs')).toString();
    let data = {
        name : name,
        code : code,
        email : email
    }

    const template = Handlebars.compile(invitationTemplate);
    try{
        await sendEmail(email, GeneralMessages.invitationEmailSubjectStudent, template(data))
    } catch (e) {
        console.log(e);
    }
}

async function sendEmail(receiverEmail, subject, htmlBodyContents, fromAddress = 'Onward'){
    let transporter = getTransportInfo();
    let mailOptions = {
        from : fromAddress,
        to : receiverEmail,
        subject : subject,
        html : htmlBodyContents
    };
    if(process.env.disableEmail == true || process.env.disableEmail == 'true') {
        return;
    }
    await transporter.sendMail(mailOptions)
}

async function sendEmail(receiverEmail, subject, htmlBodyContents, fromAddress = "Onward") {
    let transporter = getTransportInfo();
    let mailOptions = {
        from: fromAddress,
        to: receiverEmail,
        subject: subject,
        html: htmlBodyContents,
    };
    if (process.env.disableEmail == true || process.env.disableEmail == "true") {
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
            user: process.env.SMTP_USER, //smtpUsername
            pass: process.env.SMTP_PASS, //smtpPassword
        },
    });
}

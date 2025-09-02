const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const {GeneralMessages, ServiceType } = require("../utils/constants");

const ServiceTypeNames = {
    [ServiceType.VAT]: "VAT",
    [ServiceType.CorporateTaxServices]: "Corporate Tax Services",
    [ServiceType.Payroll]: "Payroll",
    [ServiceType.AuditAndCompliance]: "Audit & Compliance"
};
class BulkEmail {
    constructor(maxBatchSize = 15) {
        this.queue = [];
        this.maxBatchSize = maxBatchSize;
        this.transporter = this.getTransportInfo();
    }

    getTransportInfo() {
        return nodemailer.createTransport({
            host: process.env.SMTP_SERVER,
            port: process.env.SMTP_PORT,
            secure: false, // true for 465, false for other ports
            pool: true,
            auth: {
                user: process.env.SMTP_USER, //smtpUsername
                pass: process.env.SMTP_PASS, //smtpPassword
            },
            maxMessages: Infinity,
            maxConnections: 5,
        });
    }


    addEmail(name, emailId, serviceTypes, templateName) {
        let mappedServices;
        if (Array.isArray(serviceTypes)) {
            mappedServices = serviceTypes.map(st => ServiceTypeNames[st] || st);
        } else {
            mappedServices = ServiceTypeNames[serviceTypes] || serviceTypes;
        }
        this.queue.push({ name, emailId, serviceTypes: mappedServices, templateName });
    }

    async emailQueue() {
        let totalEmails = this.queue.length;
        console.log("Starting to process emails ", totalEmails);

        let batchSize = Math.min(this.maxBatchSize, totalEmails);
        console.log("✌️batchSize --->", batchSize);

        for (let i = 0; i < totalEmails; i += batchSize) {
            let batch = this.queue.slice(i, i + batchSize);
            console.log("Processed batch ", Math.floor(i / this.maxBatchSize) + 1);
            await Promise.all(batch.map((item) => this.sendEmail(item)));
            await this.delay(10000);
        }
        console.log("Finished processing all emails ", totalEmails);

        this.queue = [];
    }

    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async sendEmail({name, emailId, serviceTypes, templateName}) {
        let templatePath = path.join(__dirname, "..", "templates","service", templateName);
        let emailTemplate = fs.readFileSync(templatePath).toString();
        let template = Handlebars.compile(emailTemplate);
        let htmlContent = template({name, email: emailId, serviceTypes});
                
        let mailOptions = {
            from: "Onward",
            to: emailId,
            subject: GeneralMessages.PendingSubject,
            html: htmlContent,
        };
        if (process.env.disableEmail == true || process.env.disableEmail == "true") {
            return;
        }
        try {
            await this.transporter.sendMail(mailOptions);
            console.log("Email sent successfully to: ", emailId);
        } catch (error) {
            console.error(`Failed to send email to ${emailId}:`, error);
        }
    }
}
module.exports = BulkEmail;

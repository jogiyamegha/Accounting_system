const fs = require('fs');
const path = require('path');
const Service = require('../db/models/service');
const EmailBulk = require('../emails/emailBulk');
const ValidationError = require('../utils/ValidationError');
const { TableFields, TableNames } = require('../utils/constants');

exports.serviceDeadlineTomorrow = async () => {
    try {
        const oneDaysAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
        console.log(oneDaysAgo);
        const allUsers = await Service.find({
            "services.serviceEndDate" : {
                $lt : oneDaysAgo
            }
        });

        console.log(allUsers);

        const serviceTypes = allUsers.map( user => user[TableFields.serviceType]);
        console.log(serviceTypes);

        if(allUsers.length > 0) {
            console.log("here");
            let bulkEmail = new EmailBulk();
            allUsers.forEach( (client) => {
                bulkEmail.addEmail(
                    client[TableFields.clientDetail][TableFields.clientName],
                    client[TableFields.clientDetail][TableFields.clientEmail],
                    serviceTypes,
                    "service-deadline-tomorrow.hbs"
                );
            });
            bulkEmail.emailQueue();
        }

    } catch (error) {
        
    }
}
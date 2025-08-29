const Service = require('../db/models/service');
const EmailBulk = require('../emails/emailBulk');
const NotificationController = require('../controllers/admin/NotificationController');
const { TableFields } = require('../utils/constants');

exports.serviceDeadlineTomorrow = async () => {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0]; 
        
        const tomorrowStart = new Date(`${tomorrowString}T00:00:00.000Z`);
        const tomorrowEnd = new Date(`${tomorrowString}T23:59:59.999Z`);

        const allUsers = await Service.find({
            "services.serviceEndDate": {
                $eq: tomorrowStart,
            }
        });

        if (allUsers.length > 0) {
            let bulkEmail = new EmailBulk();
            
            allUsers.forEach((client) => {
                const tomorrowServices = client[TableFields.services].filter(service => {
                    const serviceEndDate = new Date(service[TableFields.serviceEndDate]);
                    const serviceDateString = serviceEndDate.toISOString().split('T')[0];
                    return serviceDateString === tomorrowString;
                });
                
                const serviceTypes = tomorrowServices.map(service => service[TableFields.serviceType]);
                
                if (serviceTypes.length > 0) {                    
                    bulkEmail.addEmail(
                        client[TableFields.clientDetail][TableFields.clientName],
                        client[TableFields.clientDetail][TableFields.clientEmail],
                        serviceTypes,
                        "service-deadline-tomorrow.hbs"
                    );
                }
            });
            
            bulkEmail.emailQueue();
        }

    } catch (error) {
        console.error('Error in serviceDeadlineTomorrow:', error);
        throw error;
    }
}

exports.serviceDeadlineToday = async () => {
    try {
        const today = new Date();
        const todayString = today.toISOString().split("T")[0];

        const todayStart = new Date(`${todayString}T00:00:00.000Z`);
        const todayEnd   = new Date(`${todayString}T23:59:59.999Z`);

        const allUsers = await Service.find({
            "services.serviceEndDate": {
                $gte: todayStart,
                $lte: todayEnd,
            }
        });

        if (allUsers.length > 0) {
            let bulkEmail = new EmailBulk();

            allUsers.forEach((client) => {
                const todayServices = client[TableFields.services].filter(service => {
                const serviceEndDate = new Date(service[TableFields.serviceEndDate]);
                const serviceDateString = serviceEndDate.toISOString().split("T")[0];
                return serviceDateString === todayString;
                });

                const serviceTypes = todayServices.map(service => service[TableFields.serviceType]);

                if (serviceTypes.length > 0) {
                bulkEmail.addEmail(
                    client[TableFields.clientDetail][TableFields.clientName],
                    client[TableFields.clientDetail][TableFields.clientEmail],
                    serviceTypes,
                    "service-deadline-today.hbs"
                );
                }
            });

            bulkEmail.emailQueue();
        }
    } catch (error) {
        console.error("Error in serviceDeadlineToday:", error);
        throw error;
    }
};

exports.sendNotifiactionServiceDeadlineTomorrow = async () => {
    console.log("object");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0]; 
        
    const tomorrowStart = new Date(`${tomorrowString}T00:00:00.000Z`);
    const tomorrowEnd = new Date(`${tomorrowString}T23:59:59.999Z`);

    const allUsers = await Service.find({
        "services.serviceEndDate": {
            $eq: tomorrowStart,
        }
    });

    if (allUsers.length > 0) {            
        const fakeReq = {
            body: {
                email: allUsers[TableFields.clientEmail],
                type: "Service Deadline Reminder",
                message: `Your service(s)} will end tomorrow.`,
                expiresAt: tomorrowStart,
            },
        };
        console.log(fakeReq);
        await NotificationController.addNotification(fakeReq);
    }
}
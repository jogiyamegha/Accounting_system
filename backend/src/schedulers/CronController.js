const Service = require("../db/models/service");
const EmailBulk = require("../emails/emailBulk");
const NotificationController = require("../controllers/admin/NotificationController");
const { TableFields } = require("../utils/constants");

exports.serviceDeadlineTomorrow = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split("T")[0];

    const tomorrowStart = new Date(`${tomorrowString}T00:00:00.000Z`);
    const tomorrowEnd = new Date(`${tomorrowString}T23:59:59.999Z`);

    const allUsers = await Service.find({
      "services.serviceEndDate": {
        $eq: tomorrowStart,
      },
    });

    if (allUsers.length > 0) {
      let bulkEmail = new EmailBulk();

      allUsers.forEach((client) => {
        const tomorrowServices = client[TableFields.services].filter(
          (service) => {
            const serviceEndDate = new Date(
              service[TableFields.serviceEndDate]
            );
            const serviceDateString = serviceEndDate
              .toISOString()
              .split("T")[0];
            return serviceDateString === tomorrowString;
          }
        );

        const serviceTypes = tomorrowServices.map(
          (service) => service[TableFields.serviceType]
        );

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
    console.error("Error in serviceDeadlineTomorrow:", error);
    throw error;
  }
};

exports.serviceDeadlineToday = async () => {
  try {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    const todayStart = new Date(`${todayString}T00:00:00.000Z`);
    const todayEnd = new Date(`${todayString}T23:59:59.999Z`);

    const allUsers = await Service.find({
      "services.serviceEndDate": {
        $gte: todayStart,
        $lte: todayEnd,
      },
    });

    if (allUsers.length > 0) {
      let bulkEmail = new EmailBulk();

      allUsers.forEach((client) => {
        const todayServices = client[TableFields.services].filter((service) => {
          const serviceEndDate = new Date(service[TableFields.serviceEndDate]);
          const serviceDateString = serviceEndDate.toISOString().split("T")[0];
          return serviceDateString === todayString;
        });

        const serviceTypes = todayServices.map(
          (service) => service[TableFields.serviceType]
        );

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

// exports.sendNotificationForServiceDeadline = async ({ daysFromNow = 0 } = {}) => {
//     try {
//         console.log(`🔔 Checking for service deadlines exactly ${daysFromNow} day(s) ahead...`);

//         // Step 1: Calculate start & end of target date in UTC
//         const targetDate = new Date();
//         targetDate.setDate(targetDate.getDate() + daysFromNow);

//         const startOfDay = new Date(targetDate);
//         startOfDay.setUTCHours(0, 0, 0, 0);

//         const endOfDay = new Date(targetDate);
//         endOfDay.setUTCHours(23, 59, 59, 999);

//         console.log("➡️ Start of day:", startOfDay.toISOString());
//         console.log("➡️ End of day:", endOfDay.toISOString());

//         // Step 2: Query services whose end date falls within the day
//         const allUsers = await Service.find({
//             "services.serviceEndDate": {
//                 $gte: startOfDay,
//                 $lte: endOfDay
//             }
//         });

//         console.log("Users found:", allUsers.length);

//         // Step 3: Send notifications
//         for (const user of allUsers) {
//             const endingServices = user.services.filter(service =>
//                 service.serviceEndDate >= startOfDay && service.serviceEndDate <= endOfDay
//             );

//             if (endingServices.length > 0) {
//                 const serviceTypes = endingServices.map(s => s.serviceType).join(", ");
//                 const fakeReq = {
//                     body: {
//                         email: user.clientDetail.clientEmail,
//                         type: "Service Deadline Reminder",
//                         message: `Your service(s) ${serviceTypes} will end on ${targetDate.toDateString()}.`,
//                         expiresAt: endOfDay,
//                     },
//                 };

//                 console.log(`📨 Sending notification to: ${user.clientDetail.clientEmail}`);
//                 await NotificationController.addNotification(fakeReq);
//             }
//         }

//     } catch (err) {
//         console.error("❌ Error in sendNotificationForServiceDeadline:", err);
//     }
// };

// exports.sendUpcomingServiceNotifications = async () => {
//     try {
//         console.log("🔔 Checking for upcoming service deadlines...");

//         const today = new Date();
//         today.setUTCHours(0, 0, 0, 0);
//         const endOfToday = new Date(today);
//         endOfToday.setUTCHours(23, 59, 59, 999);

//         const tomorrow = new Date(today);
//         tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
//         const endOfTomorrow = new Date(tomorrow);
//         endOfTomorrow.setUTCHours(23, 59, 59, 999);

//         console.log("➡️ Today range:", today.toISOString(), "-", endOfToday.toISOString());
//         console.log("➡️ Tomorrow range:", tomorrow.toISOString(), "-", endOfTomorrow.toISOString());

//         // Query services ending today or tomorrow
//         const allUsers = await Service.find({
//             "services.serviceEndDate": {
//                 $gte: today,
//                 $lte: endOfTomorrow
//             }
//         });

//         console.log("Users found:", allUsers.length);

//         for (const user of allUsers) {
//             // Filter services for today or tomorrow separately
//             const todayServices = user.services.filter(service =>
//                 service.serviceEndDate >= today && service.serviceEndDate <= endOfToday
//             );

//             const tomorrowServices = user.services.filter(service =>
//                 service.serviceEndDate > endOfToday && service.serviceEndDate <= endOfTomorrow
//             );

//             // Send notifications for today
//             if (todayServices.length > 0) {
//                 const serviceTypes = todayServices.map(s => s.serviceType).join(", ");
//                 const fakeReq = {
//                     body: {
//                         email: user.clientDetail.clientEmail,
//                         type: "Service Deadline Reminder",
//                         message: `Your service(s) ${serviceTypes} will end today (${today.toDateString()}).`,
//                         expiresAt: endOfToday,
//                     },
//                 };
//                 console.log(`📨 Sending notification for today to: ${user.clientDetail.clientEmail}`);
//                 await NotificationController.addNotification(fakeReq);
//             }

//             // Send notifications for tomorrow
//             if (tomorrowServices.length > 0) {
//                 const serviceTypes = tomorrowServices.map(s => s.serviceType).join(", ");
//                 const fakeReq = {
//                     body: {
//                         email: user.clientDetail.clientEmail,
//                         type: "Service Deadline Reminder",
//                         message: `Your service(s) ${serviceTypes} will end tomorrow (${tomorrow.toDateString()}).`,
//                         expiresAt: endOfTomorrow,
//                     },
//                 };
//                 console.log(`📨 Sending notification for tomorrow to: ${user.clientDetail.clientEmail}`);
//                 await NotificationController.addNotification(fakeReq);
//             }
//         }

//     } catch (err) {
//         console.error("❌ Error in sendUpcomingServiceNotifications:", err);
//     }
// };

exports.sendNotificationsBasedOnDB = async () => {
  try {
    console.log("🔔 Checking for upcoming service deadlines based on DB...");

    const now = new Date(); // current datetime

    // Step 1: Query all users with services whose end date is in the future or today
    const allUsers = await Service.find({
      "services.serviceEndDate": { $gte: now }, // all future or ongoing services
    });

    // Step 2: Loop over users and filter services that are ending today or in the future
    for (const user of allUsers) {
      const upcomingServices = user.services.filter(
        (service) => service.serviceEndDate >= now
      );

      if (upcomingServices.length > 0) {
        const serviceTypes = upcomingServices
          .map((s) => s.serviceType)
          .join(", ");
        const earliestEndDate = new Date(
          Math.min(...upcomingServices.map((s) => s.serviceEndDate))
        );

        const fakeReq = {
          body: {
            email: user.clientDetail.clientEmail,
            type: "Service Deadline Reminder",
            message: `Your service(s) ${serviceTypes} will end on ${earliestEndDate.toDateString()}.`,
            expiresAt: earliestEndDate,
          },
        };

        console.log(
          `📨 Sending notification to: ${user.clientDetail.clientEmail}`
        );
        await NotificationController.addNotification(fakeReq);
      }
    }
  } catch (err) {
    console.error("❌ Error in sendNotificationsBasedOnDB:", err);
  }
};

const Client = require("../models/client");
const {
  TableFields,
  TableNames,
  UserTypes,
  ValidationMsg,
  ServiceStatus,
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const Util = require("../../utils/util");
const { MongoUtil } = require("../mongoose");
const ServiceService = require("./ServiceService");
const moment = require("moment");

class ClientService {
  static userExists = (id) => {
    return Client.exists({
      [TableFields.ID]: id,
    });
  };

  static findByEmail = (email) => {
    return new ProjectionBuilder(async function () {
      return await Client.findOne({ email }, this);
    });
  };

 static findServicesByClientEmail = async (email) => {
  const result = await Client.findOne({ email }); 
  return result?.services || []; 
};

  static isServiceExistsInClient = async (client, serviceId) => {
    const services = client[TableFields.services];
    for (let service of services) {
      if (service[TableFields.serviceId].toString() === serviceId) {
        return true;
      }
    }
    return false;
  };

  static checkInternalServiceExists = async (client, serviceId) => {
    const services = client[TableFields.services];
    if (services.length == 0) {
      return false;
    }
    for (let service of services) {
      if (service[TableFields.ID].toString() === serviceId.toString()) {
        return true;
      }
    }
    return false;
  };

  static checkServiceAssignedAndCompletedOrDeassign = async (
    client,
    serviceId
  ) => {
    // Check if service is currently running (assigned, not deleted, and not completed)
    const services = client[TableFields.services];
    if (services.length != 0) {
      for (let service of services) {
        if (service[TableFields.serviceId].toString() === serviceId) {
          // If service exists and is not deleted and not completed, it's running
          if (
            service[TableFields.deleted] == false &&
            service[TableFields.endDate] > new Date() &&
            service[TableFields.serviceStatus] === 3
          ) {
            return true; // Service is running
          }
        }
      }
    }
    return false; // No running service found, can assign
  };

  static checkIsServiceAssign = async (client, serviceId) => {
    const services = client[TableFields.services];
    for (let service of services) {
      if (
        service[TableFields.serviceId].toString() === serviceId &&
        service[TableFields.deleted] == false &&
        service[TableFields.endDate] > new Date()
      ) {
        return true; // Service is assigned and active
      }
    }
    return false;
  };

  static checkServiceCompletedOrNot = async (client, serviceId) => {
    const services = client[TableFields.services];

    for (let service of services) {
      if (
        service[TableFields.serviceId].toString() === serviceId &&
        service[TableFields.deleted] == false &&
        service[TableFields.endDate] <= new Date()
      ) {
        return true; // Service is completed
      }
    }
    return false;
  };

  // static checkAllServiceCompleted = async (client, serviceId) => {
  //     const services = client[TableFields.services];
  //     if (services.length > 0) {
  //         for (let service of services) {
  //             if (
  //                 (service[TableFields.serviceId].toString() === serviceId.toString()) &&
  //                 (service[TableFields.endDate] < new Date()) &&
  //                 (service[TableFields.serviceStatus] == 3) &&
  //                 (service[TableFields.deleted] == false)
  //             ) {
  //                 return true;
  //             }
  //         }
  //         return false;
  //     } else {
  //         return false;
  //     }
  // }

  // static getAllClientsRelatedService = (serviceId) => {
  //     return new ProjectionBuilder(async function () {
  //         return Client.find({
  //             [TableFields.services]: {
  //                 $elemMatch: {
  //                     [TableFields.serviceId]: MongoUtil.toObjectId(serviceId),
  //                     [TableFields.deleted]: false
  //                 }
  //             }
  //         }).select({
  //             services: {
  //                 $filter: {
  //                     input: "$services",
  //                     as: "service",
  //                     cond: {
  //                         $and: [
  //                             { $eq: ["$$service.serviceId", MongoUtil.toObjectId(serviceId)] },
  //                             { $eq: ["$$service.deleted", false] }
  //                         ]
  //                     }
  //                 }
  //             }
  //         });
  //     });
  // };

  // static checkAllServiceCompleted = async (client, serviceId) => {
  //     console.log(client);
  //     const services = client[TableFields.services];
  //     if (services.length > 0) {
  //         console.log("1");
  //         for (let service of services) {
  //             if(!service[TableFields.updatedDateAfterStatusChangeToCompleted]){
  //                 console.log("2");
  //                 if (
  //                     (service[TableFields.serviceId].toString() === serviceId.toString()) &&
  //                     (service[TableFields.endDate] <= new Date()) &&
  //                     (service[TableFields.serviceStatus] == 3) &&
  //                     (service[TableFields.deleted] == false)
  //                 ) {
  //                     console.log("first");
  //                     return true;
  //                 }
  //             } else {
  //                 console.log("3");
  //                 if (
  //                     (service[TableFields.serviceId].toString() === serviceId.toString()) &&
  //                     (service[TableFields.updatedDateAfterStatusChangeToCompleted] <= new Date()) &&
  //                     (service[TableFields.serviceStatus] == 3) &&
  //                     (service[TableFields.deleted] == false)
  //                 ) {
  //                     console.log("second");
  //                     return true;
  //                 }
  //             }
  //         }
  //     }
  //     return false;
  // }

  static checkAllServiceCompleted = async (client, serviceId) => {
    const services = client[TableFields.services] || [];

    const relevantServices = services.filter(
      (service) =>
        service[TableFields.serviceId]?.toString() === serviceId.toString() &&
        service[TableFields.deleted] === false
    );
    console.log(relevantServices);
    if (relevantServices.length === 0) return true;

    return relevantServices.every((service) => {
      const dateToCheck =
        service[TableFields.updatedDateAfterStatusChangeToCompleted] ||
        service[TableFields.endDate];
      return (
        service[TableFields.serviceStatus] === 3 &&
        dateToCheck &&
        dateToCheck <= new Date()
      );
    });
  };

  static checkIsServiceRunning = async (client, serviceId) => {
    const services = client[TableFields.services] || [];

    const relevantServices = services.filter(
      (service) =>
        service[TableFields.serviceId]?.toString() === serviceId.toString() &&
        service[TableFields.deleted] === false
    );

    if (relevantServices.length === 0) return false;

    return relevantServices.every((service) => {
      return (
        service[TableFields.serviceStatus] === 2 &&
        service[TableFields.deleted] === false
      );
    });
  };

  static getAllClientsRelatedService = (serviceId, filter = {}) => {
    return new ProjectionBuilder(async function () {
      const objectId = MongoUtil.toObjectId(serviceId);

      // Extract pagination, sorting, and count params
      let limit = filter.limit || 0;
      let skip = filter.skip || 0;
      let sortKey = filter.sortKey || TableFields._createdAt;
      let sortOrder = filter.sortOrder || 1;
      let needCount = Util.parseBoolean(filter.needCount);

      // Build search query
      let searchQuery = {};
      let searchTerm = filter.searchTerm;
      if (searchTerm) {
        searchQuery = {
          $or: [
            {
              [TableFields.name]: {
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
            {
              [TableFields.phone]: {
                $regex: Util.wrapWithRegexQry(searchTerm),
                $options: "i",
              },
            },
          ],
        };
      }

      // ✅ Base query:
      // - Ensure outer deleted is false
      // - Then check for service match with deleted=false
      let baseQuery = {
        [TableFields.deleted]: false, // outer deleted check
        [TableFields.services]: {
          $elemMatch: {
            [TableFields.serviceId]: objectId,
            [TableFields.deleted]: false,
          },
        },
        ...searchQuery,
      };

      return await Promise.all([
        needCount ? Client.countDocuments(baseQuery) : undefined,
        Client.find(baseQuery)
          .limit(parseInt(limit))
          .skip(parseInt(skip))
          .sort({ [sortKey]: parseInt(sortOrder) })
          .select({
            _id: 1,
            name: 1,
            email: 1,
            phone: 1,
            services: {
              $filter: {
                input: "$services",
                as: "service",
                cond: {
                  $and: [
                    { $eq: ["$$service.serviceId", objectId] },
                    { $eq: ["$$service.deleted", false] }, // inner deleted check
                  ],
                },
              },
            },
          }),
      ]).then(([total, records]) => ({ total, records }));
    });
  };

   static getAllClientsForDeadline =  (serviceId) => {
        return new ProjectionBuilder(async function() {
            const docs = await Client.find({
                [TableFields.services]: {
                    $elemMatch: {
                        [TableFields.serviceId]: serviceId,
                        [TableFields.deleted]: false,
                    },
                },
            });
 
            return docs.map((doc) => {
                doc.services = doc?.services.filter((s) => !s.deleted);
                return doc;
            })
        })
    }
 

  static checkIsServiceCompleted = async (clientId, serviceId) => {
    const client = await ClientService.getUserById(clientId)
      .withBasicInfo()
      .execute();
    const services = client[TableFields.services];

    // Filter services by serviceId and sort by start date (most recent first)
    const serviceInstances = services
      .filter(
        (service) =>
          service[TableFields.serviceId].toString() === serviceId.toString()
      )
      .sort(
        (a, b) =>
          new Date(b[TableFields.serviceStartDate]) -
          new Date(a[TableFields.serviceStartDate])
      );

    if (serviceInstances.length === 0) {
      return false; // No service found
    }

    // Check the most recent service instance
    const latestService = serviceInstances[0];
    const currentDate = new Date();
    const endDate = new Date(latestService[TableFields.endDate]);

    // Service is completed if:
    // 1. Status is 3 (completed) AND end date has passed, OR
    // 2. Status is 2 (active) AND end date has passed (expired)
    if (
      (latestService[TableFields.serviceStatus] == 3 &&
        endDate < currentDate) ||
      (latestService[TableFields.serviceStatus] == 2 && endDate < currentDate)
    ) {
      return true;
    }

    return false;
  };

  static checkIsServiceCompleted = async (clientId, serviceId) => {
    const client = await ClientService.getUserById(clientId)
      .withBasicInfo()
      .execute();
    const services = client[TableFields.services];

    // Filter services by serviceId and sort by start date (most recent first)
    const serviceInstances = services
      .filter(
        (service) =>
          service[TableFields.serviceId].toString() === serviceId.toString()
      )
      .sort(
        (a, b) =>
          new Date(b[TableFields.serviceStartDate]) -
          new Date(a[TableFields.serviceStartDate])
      );

    if (serviceInstances.length === 0) {
      return false; // No service found
    }

    // Check the most recent service instance
    const latestService = serviceInstances[0];
    const currentDate = new Date();
    const endDate = new Date(latestService[TableFields.endDate]);

    // Service is completed if:
    // 1. Status is 3 (completed) AND end date has passed, OR
    // 2. Status is 2 (active) AND end date has passed (expired)
    if (
      (latestService[TableFields.serviceStatus] == 3 &&
        endDate < currentDate) ||
      (latestService[TableFields.serviceStatus] == 2 && endDate < currentDate)
    ) {
      return true;
    }

    return false;
  };

  static updateDeassign = async (client, serviceArrayItemId) => {
    return await Client.findOneAndUpdate(
      {
        [TableFields.ID]: client[TableFields.ID],
        [`${TableFields.services}._id`]: serviceArrayItemId,
      },
      {
        $set: {
          [`${TableFields.services}.$.deleted`]: true,
          [`${TableFields.services}.$.deassignDate`]: new Date(),
        },
      },
      { new: true }
    );
  };

  // static updateServiceStatus = async (serviceId, clientId, newStatus) => {

  //     return await Client.findByIdAndUpdate(
  //         {
  //             [TableFields.ID] : clientId
  //         },
  //         {
  //             $set: {
  //                 [`${TableFields.services}.$[elem].${TableFields.serviceStatus}`]: newStatus
  //             }
  //         },
  //         {
  //             arrayFilters: [
  //                 {
  //                     [`elem.${TableFields.serviceId}`]: serviceId,
  //                     [`elem.${TableFields.deleted}`]: false
  //                 }
  //             ],
  //             new: true
  //         }
  //     )
  // }

  static updateServiceStatus = async (serviceId, clientId, newStatus) => {
    const statusMap = {
      notStarted: ServiceStatus.notStarted,
      "not Started": ServiceStatus.notStarted,
      inProgress: ServiceStatus.inProgress,
      "in Progress": ServiceStatus.inProgress,
      completed: ServiceStatus.completed,
      completed: ServiceStatus.completed,
      1: ServiceStatus.notStarted,
      2: ServiceStatus.inProgress,
      3: ServiceStatus.completed,
    };

    const mappedStatus = statusMap[newStatus];
    if (!mappedStatus) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    if (newStatus === 2) {
      return await Client.findByIdAndUpdate(
        clientId,
        {
          $set: {
            [`${TableFields.services}.$[elem].${TableFields.serviceStatus}`]:
              mappedStatus,
            [`${TableFields.services}.$[elem].${TableFields.serviceStatusChangeDate}`]:
              Date.now(),
            [`${TableFields.services}.$[elem].${TableFields.updatedDateAfterStatusChangeToInProgress}`]:
              Date.now(),
          },
        },
        {
          arrayFilters: [
            {
              "elem._id": serviceId,
              [`elem.${TableFields.deleted}`]: false,
            },
          ],
          new: true,
        }
      );
    }

    if (newStatus === 3) {
      return await Client.findByIdAndUpdate(
        clientId,
        {
          $set: {
            [`${TableFields.services}.$[elem].${TableFields.serviceStatus}`]:
              mappedStatus,
            [`${TableFields.services}.$[elem].${TableFields.serviceStatusChangeDate}`]:
              Date.now(),
            [`${TableFields.services}.$[elem].${TableFields.updatedDateAfterStatusChangeToCompleted}`]:
              Date.now(),
          },
        },
        {
          arrayFilters: [
            {
              "elem._id": serviceId,
              [`elem.${TableFields.deleted}`]: false,
            },
          ],
          new: true,
        }
      );
    }
    return await Client.findByIdAndUpdate(
      clientId,
      {
        $set: {
          [`${TableFields.services}.$[elem].${TableFields.serviceStatus}`]:
            mappedStatus,
          [`${TableFields.services}.$[elem].${TableFields.serviceStatusChangeDate}`]:
            Date.now(),
        },
      },
      {
        arrayFilters: [
          {
            "elem._id": serviceId,
            [`elem.${TableFields.deleted}`]: false,
          },
        ],
        new: true,
      }
    );
  };

  static addRenewService = async (clientId, serviceId) => {
    const service = await ServiceService.findById(serviceId)
      .withBasicInfo()
      .execute();
    console.log("service", service);
    console.log(service[0]);

    const todayDate = new Date();
    const endDate = new Date(todayDate);
    endDate.setDate(endDate.getDate() + service[TableFields.serviceDuration]);

    return await Client.updateOne(
      {
        [TableFields.ID]: clientId,
      },
      {
        $push: {
          [TableFields.services]: {
            [TableFields.serviceId]: serviceId,
            [TableFields.serviceName]: service[TableFields.serviceName],
            [TableFields.serviceDuration]: service[TableFields.serviceDuration],
            [TableFields.serviceStartDate]: todayDate,
            [TableFields.endDate]: endDate,
            [TableFields.serviceStatus]: 2,
          },
        },
      }
    );
  };

  // static updateClientServiceDetail = async (client, serviceId, reqBody) => {
  //     // Build dynamic update object only with provided fields
  //     const updateFields = {};
  //     if (reqBody[TableFields.serviceStartDate] !== undefined) {
  //         updateFields[`services.$.${TableFields.serviceStartDate}`] =
  //             reqBody[TableFields.serviceStartDate];
  //     }
  //     if (reqBody[TableFields.endDate] !== undefined) {
  //         updateFields[`services.$.${TableFields.endDate}`] =
  //             reqBody[TableFields.endDate];
  //     }
  //     if (reqBody[TableFields.serviceStatusChangeDate] !== undefined) {
  //         updateFields[`services.$.${TableFields.serviceStatusChangeDate}`] =
  //             reqBody[TableFields.serviceStatusChangeDate];
  //     }

  //     if (Object.keys(updateFields).length === 0) {
  //         throw new Error("No valid fields to update");
  //     }

  //     return await Client.findOneAndUpdate(
  //         {
  //             [TableFields.ID]: client[TableFields.ID],
  //             [`${TableFields.services}.${TableFields.ID}`]: serviceId,
  //         },
  //         {
  //             $set: updateFields,
  //         },
  //         { new: true } // return updated document
  //     );
  // };

  static updateClientServiceDetail = async (client, serviceId, reqBody) => {
    // 1. Fetch the client first to get existing service data
    const clientDoc = await Client.findOne({
      [TableFields.ID]: client[TableFields.ID],
      [`${TableFields.services}.${TableFields.ID}`]: serviceId,
    });

    if (!clientDoc) {
      throw new Error("Client or service not found");
    }

    const service = clientDoc.services.find(
      (s) => s._id.toString() === serviceId.toString()
    );

    if (!service) {
      throw new Error("Service not found in client");
    }

    const updateFields = {};
    const today = moment().startOf("day");

    // -------------------------------
    // 2. Validate and update serviceStartDate
    // -------------------------------
    if (reqBody[TableFields.serviceStartDate] !== undefined) {
      const newStartDate = moment(
        reqBody[TableFields.serviceStartDate]
      ).startOf("day");
      if (newStartDate.isBefore(today)) {
        throw new Error("Service start date cannot be in the past");
      }
      updateFields[`services.$.${TableFields.serviceStartDate}`] =
        newStartDate.toDate();

      // Set service status = 1 (not started) if start date is in future
      if (newStartDate.isAfter(today)) {
        updateFields[`services.$.${TableFields.serviceStatus}`] = 1;
      }
    }

    // -------------------------------
    // 3. Validate and update endDate
    // -------------------------------
    if (reqBody[TableFields.endDate] !== undefined) {
      const newEndDate = moment(reqBody[TableFields.endDate]).startOf("day");
      const baseStartDate =
        reqBody[TableFields.serviceStartDate] !== undefined
          ? moment(reqBody[TableFields.serviceStartDate]).startOf("day")
          : moment(service.serviceStartDate).startOf("day");

      if (newEndDate.isBefore(baseStartDate)) {
        throw new Error("End date cannot be before start date");
      }

      updateFields[`services.$.${TableFields.endDate}`] = newEndDate.toDate();

      // Calculate updated duration
      const newDuration = newEndDate.diff(baseStartDate, "days") + 1; // inclusive of start day
      updateFields[`services.$.updatedServiceDuration`] = newDuration;

      // If start date was also changed, set status = 1
      if (reqBody[TableFields.serviceStartDate] !== undefined) {
        updateFields[`services.$.${TableFields.serviceStatus}`] = 1;
      }
    }

    // -------------------------------
    // 4. Update serviceStatusChangeDate if provided
    // -------------------------------
    if (reqBody[TableFields.serviceStatusChangeDate] !== undefined) {
      updateFields[`services.$.${TableFields.serviceStatusChangeDate}`] =
        reqBody[TableFields.serviceStatusChangeDate];
    }

    if (Object.keys(updateFields).length === 0) {
      throw new Error("No valid fields to update");
    }

    // -------------------------------
    // 5. Perform the update
    // -------------------------------
    return await Client.findOneAndUpdate(
      {
        [TableFields.ID]: client[TableFields.ID],
        [`${TableFields.services}.${TableFields.ID}`]: serviceId,
      },
      { $set: updateFields },
      { new: true }
    );
  };

  static updateClientServiceDeassign = async (client, serviceId) => {
    return await Client.findByIdAndUpdate(
      client[TableFields.ID],
      {
        $set: {
          [`${TableFields.services}.$[elem].${TableFields.deleted}`]: true,
          [`${TableFields.services}.$[elem].${TableFields.deassignDate}`]:
            Date.now(),
        },
      },
      {
        arrayFilters: [
          {
            "elem._id": serviceId,
            [`elem.${TableFields.deleted}`]: false,
          },
        ],
        new: true,
      }
    );
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
      [TableFields.deleted]: false,
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

  static serviceExists = async (serviceId, clientEmail) => {
    const client = await ClientService.findByEmail(clientEmail)
      .withBasicInfo()
      .execute();
    const services = client?.[TableFields.services] || [];
    return services.some(
      (service) =>
        service[TableFields.serviceId].toString() === serviceId.toString() &&
        service[TableFields.serviceStatus] === 3
    );
  };

  // static addServiceInArray = async (clientEmail, serviceId) => {
  //     const service = await ServiceService.findById(serviceId).withBasicInfo().execute();

  //     const todayDate = new Date();
  //     const endDate = new Date(todayDate);
  //     endDate.setDate(endDate.getDate() + service[TableFields.serviceDuration]);

  //     return await Client.updateOne(
  //         {
  //             [TableFields.email]: clientEmail
  //         },
  //         {
  //             $push: {
  //                 [TableFields.services]: {
  //                     [TableFields.serviceId]: serviceId,
  //                     [TableFields.serviceStartDate]: todayDate,
  //                     [TableFields.endDate]: endDate,
  //                     [TableFields.serviceStatus]: 2
  //                 }
  //             }
  //         }
  //     );
  // };

  static addServiceInArray = async (clientEmail, serviceId) => {
    const service = await ServiceService.findById(serviceId)
      .withBasicInfo()
      .execute();

    const todayDate = new Date();
    const endDate = new Date(todayDate);
    endDate.setDate(endDate.getDate() + service[TableFields.serviceDuration]);

    return await Client.updateOne(
      {
        [TableFields.email]: clientEmail,
      },
      {
        $push: {
          [TableFields.services]: {
            [TableFields.serviceId]: serviceId,
            [TableFields.serviceName]: service[TableFields.serviceName],
            [TableFields.serviceDuration]: service[TableFields.serviceDuration],
            [TableFields.serviceStartDate]: todayDate,
            [TableFields.endDate]: endDate,
            [TableFields.serviceStatus]: 2,
            [TableFields.deleted]: false, // Explicitly set deleted to false
          },
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

  static updateClient = async (clientId, reqBody, existingClient) => {
    let updateFields = {};

    console.log(reqBody);

    if (reqBody[TableFields.name_]) {
      updateFields[TableFields.name_] = reqBody[TableFields.name_];
    }

    if (reqBody[TableFields.position]) {
      updateFields[TableFields.position] = reqBody[TableFields.position];
    }

    let contactUpdate = {};
    if (reqBody?.contact?.[TableFields.phoneCountry]) {
      contactUpdate[TableFields.phoneCountry] =
        reqBody.contact[TableFields.phoneCountry];
    } else {
      contactUpdate[TableFields.phoneCountry] =
        existingClient.contact[TableFields.phoneCountry];
    }

    if (reqBody?.contact?.[TableFields.phone]) {
      contactUpdate[TableFields.phone] = reqBody.contact[TableFields.phone];
    } else {
      contactUpdate[TableFields.phone] =
        existingClient.contact[TableFields.phone];
    }

    // Only add contact if we have any updates or keep original
    if (Object.keys(contactUpdate).length > 0) {
      updateFields[TableFields.contact] = contactUpdate;
    }

    let data = await Client.updateOne(
      { [TableFields.ID]: clientId },
      { $set: updateFields }
    );
    // console.log("data",data);

    return data;
  };

  static changeClientActivation = async (clientId) => {
    let client = await Client.findById(clientId);
    let status = client[TableFields.isActive];

    return await Client.findByIdAndUpdate(
      clientId,
      {
        $set: {
          [TableFields.isActive]: !status,
        },
      },
      {
        new: true,
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
        deleted: false,
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
      projection[TableFields.services] = 1;

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

const Company = require("../models/company");
const {
    TableFields,
    TableNames,
    UserTypes,
    ValidationMsg,
    InterfaceType,
} = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const Util = require("../../utils/util");
const { MongoUtil } = require("../../db/mongoose");

class CompanyService {
    static findByEmail = (email) => {
        return new ProjectionBuilder(async function () {
            return await Company.findOne({ email }, this);
        });
    };

    static getCompanyById = (userId) => {
        return new ProjectionBuilder(async function () {
            return await Company.findOne({ [TableFields.ID]: userId }, this);
        });
    };

    static existsWithEmail = async (email, exceptionId) => {
        return await Company.exists({
            [TableFields.email]: email,
            ...(exceptionId
                ? {
                    [TableFields.ID]: { $ne: exceptionId },
                }
                : {}),
        });
    };

    static getCompanyById = (companyId) => {
        return new ProjectionBuilder(async function () {
            return await Company.findOne({ [TableFields.ID]: companyId }, this);
        });
    };

    static companyExists = async (companyId) => {
        return await Company.exists({
            [TableFields.ID]: MongoUtil.toObjectId(companyId),
        });
    };

    static insertRecord = async (companyFields) => {
        const company = new Company(companyFields);

        let error = company.validateSync();
        let createdCompanyRecord;
        if (error) {
            throw error;
        } else {
            try {
                createdCompanyRecord = await company.save();
                return createdCompanyRecord;
            } catch (e) {
                if (createdCompanyRecord) {
                    await createdCompanyRecord.delete();
                }
            }
        }
    };

    static updateCompanyFields = async (companyId, reqBody, existingCompany) => {
        let updatedFields = {};

        if (reqBody[TableFields.name_]) {
            updatedFields[TableFields.name_] = reqBody[TableFields.name_];
        }

        if (reqBody[TableFields.email]) {
            updatedFields[TableFields.email] = reqBody[TableFields.email];
        }

        const addressUpdate = {};
        if (reqBody?.address?.[TableFields.addressLine1]) {
            console.log("in 1");
            addressUpdate[TableFields.addressLine1] = reqBody.address[TableFields.addressLine1];
            console.log(addressUpdate);
        } else {
            addressUpdate[TableFields.addressLine1] = existingCompany.address[TableFields.addressLine1];
        }

        if (reqBody?.address?.[TableFields.addressLine2]) {
            console.log("in 2");
            addressUpdate[TableFields.addressLine2] = reqBody.address[TableFields.addressLine2];
        } else {
            addressUpdate[TableFields.addressLine2] = existingCompany.address[TableFields.addressLine2];
            console.log(addressUpdate);
        }

        if (reqBody?.address?.[TableFields.street]) {
            addressUpdate[TableFields.street] = reqBody.address[TableFields.street];
        } else {
            addressUpdate[TableFields.street] = existingCompany.address[TableFields.street];
        }

        if (reqBody?.address?.[TableFields.landmark]) {
            addressUpdate[TableFields.landmark] = reqBody.address[TableFields.landmark];
        } else {
            addressUpdate[TableFields.landmark] = existingCompany.address[TableFields.landmark];
        }

        if (reqBody?.address?.[TableFields.zipcode]) {
            addressUpdate[TableFields.zipcode] = reqBody.address[TableFields.zipcode];
        } else {
            addressUpdate[TableFields.zipcode] = existingCompany.address[TableFields.zipcode];
        }

        if (reqBody?.address?.[TableFields.city]) {
            addressUpdate[TableFields.city] = reqBody.address[TableFields.city];
        } else {
            addressUpdate[TableFields.city] = existingCompany.address[TableFields.city];
        }
        if (reqBody?.address?.[TableFields.state]) {
            addressUpdate[TableFields.state] = reqBody.address[TableFields.state];
        } else {
            addressUpdate[TableFields.state] = existingCompany.address[TableFields.state];
        }
        if (reqBody?.address?.[TableFields.country]) {
            addressUpdate[TableFields.country] = reqBody.address[TableFields.country];
        } else {
            addressUpdate[TableFields.country] = existingCompany.address[TableFields.country];
        }


        let licenseDetailsUpdate = {};
        if (reqBody?.licenseDetails?.[TableFields.licenseType]) {
            licenseDetailsUpdate[TableFields.licenseType] = reqBody.licenseDetails[TableFields.licenseType];
        } else {
            licenseDetailsUpdate[TableFields.licenseType] = existingCompany.licenseDetails[TableFields.licenseType];
        }

        if (reqBody?.licenseDetails?.[TableFields.licenseNumber]) {
            licenseDetailsUpdate[TableFields.licenseNumber] = reqBody.licenseDetails[TableFields.licenseNumber];
        } else {
            licenseDetailsUpdate[TableFields.licenseNumber] = existingCompany.licenseDetails[TableFields.licenseNumber];
        }

        if (reqBody?.licenseDetails?.[TableFields.licenseIssueDate]) {
            licenseDetailsUpdate[TableFields.licenseIssueDate] = reqBody.licenseDetails[TableFields.licenseIssueDate];
        } else {
            licenseDetailsUpdate[TableFields.licenseIssueDate] = existingCompany.licenseDetails[TableFields.licenseIssueDate];
        }

        if (reqBody?.licenseDetails?.[TableFields.licenseExpiry]) {
            licenseDetailsUpdate[TableFields.licenseExpiry] = reqBody.licenseDetails[TableFields.licenseExpiry];
        } else {
            licenseDetailsUpdate[TableFields.licenseExpiry] = existingCompany.licenseDetails[TableFields.licenseExpiry];
        }

        let financialYearUpdate = {};
        if (reqBody?.financialYear?.[TableFields.startDate]) {
            financialYearUpdate[TableFields.startDate] = reqBody.financialYear[TableFields.startDate];
        } else {
            financialYearUpdate[TableFields.startDate] = existingCompany.financialYear[TableFields.startDate];
        }

        if (reqBody?.financialYear?.[TableFields.endDate]) {
            financialYearUpdate[TableFields.endDate] = reqBody.financialYear[TableFields.endDate];
        } else {
            financialYearUpdate[TableFields.endDate] = existingCompany.financialYear[TableFields.endDate];
        }

        if (reqBody[TableFields.taxRegistrationNumber]) {
            updatedFields[TableFields.taxRegistrationNumber] = reqBody[TableFields.taxRegistrationNumber];
        }

        if (reqBody[TableFields.businessType]) {
            updatedFields[TableFields.businessType] = reqBody[TableFields.businessType];
        }

        // let contactPersonUpdate = {};
        // if (reqBody?.contact?.[TableFields.phoneCountry]) {
        //     contactPersonUpdate[TableFields.phoneCountry] = reqBody.contact[TableFields.phoneCountry];
        // } else {
        //     contactPersonUpdate[TableFields.phoneCountry] = existingCompany.contact[TableFields.phoneCountry];
        // }

        // if (reqBody?.contact?.[TableFields.phone]) {
        //     contactPersonUpdate[TableFields.phone] = reqBody.contact[TableFields.phone];
        // } else {
        //     contactPersonUpdate[TableFields.phone] = existingCompany.contact[TableFields.phone];
        // }

        if (Object.keys(addressUpdate).length > 0) {
            updatedFields[TableFields.address] = addressUpdate;
        }

        if (Object.keys(financialYearUpdate).length > 0) {
            updatedFields[TableFields.financialYear] = financialYearUpdate;
        }

        // if (Object.keys(contactPersonUpdate).length > 0) {
        //     updatedFields[TableFields.contact] = contactPersonUpdate;
        // }

        return await Company.updateOne(
            { [TableFields.ID]: companyId },
            { $set: updatedFields }
        );

    }


    static updateCompanyFields2 = async (companyId, reqBody, existingCompany) => {
        let updatedFields = {};

        // Helper function to merge nested objects safely
        const mergeNestedObject = (existingObj = {}, updateObj = {}) => {
            return Object.keys(existingObj).reduce((acc, key) => {
                if (updateObj[key] !== undefined && updateObj[key] !== null) {
                    acc[key] = updateObj[key]; // take new value if provided
                } else {
                    acc[key] = existingObj[key]; // fallback to existing
                }
                return acc;
            }, {});
        };

        // Top-level direct fields (no nesting)
        const directFields = [
            TableFields.name_,
            TableFields.email,
            TableFields.taxRegistrationNumber,
            TableFields.businessType
        ];

        directFields.forEach((field) => {
            if (reqBody[field] !== undefined && reqBody[field] !== null) {
                updatedFields[field] = reqBody[field];
            }
        });

        // Merge nested objects dynamically
        if (existingCompany.address) {
            updatedFields[TableFields.address] = mergeNestedObject(existingCompany.address, reqBody.address || {});
        }

        if (existingCompany.licenseDetails) {
            updatedFields[TableFields.licenseDetails] = mergeNestedObject(
                existingCompany.licenseDetails,
                reqBody.licenseDetails || {}
            );
        }

        if (existingCompany.financialYear) {
            updatedFields[TableFields.financialYear] = mergeNestedObject(
                existingCompany.financialYear,
                reqBody.financialYear || {}
            );
        }

        if (existingCompany.contactPerson?.[TableFields.contact]) {
            updatedFields[TableFields.contactPerson] = {
                ...existingCompany.contactPerson,
                [TableFields.contact]: mergeNestedObject(
                    existingCompany.contactPerson[TableFields.contact],
                    reqBody.contactPerson?.[TableFields.contact] || {}
                ),
            };

            // If contactPerson.name is passed, update it
            if (reqBody.contactPerson?.[TableFields.name_]) {
                updatedFields[TableFields.contactPerson][TableFields.name_] =
                    reqBody.contactPerson[TableFields.name_];
            }
        }

        return await Company.updateOne(
            { [TableFields.ID]: companyId },
            { $set: updatedFields }
        );
    };

    static updateRecord = async (companyId, updatedFields) => {
        if (!companyId) throw new Error("Company ID is required for update");

        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            { $set: updatedFields },
            { new: true }
        );

        if (!updatedCompany) {
            throw new Error("Company record not found");
        }

        return updatedCompany.toObject();
    };

    static deleteMyReferences = async (
        cascadeDeleteMethodReference,
        tableName,
        ...referenceId
    ) => {
        let records = undefined;
        switch (tableName) {
            case TableNames.Company:
                records = await Company.find({
                    [TableFields.ID]: {
                        $in: referenceId,
                    },
                });
                break;
        }
        if (records && records.length > 0) {
            let deleteRecordIds = records.map((a) => a[TableFields.ID]);
            await Company.updateOne(
                {
                    [TableFields.ID]: { $in: deleteRecordIds },
                },
                {
                    $set: { [TableFields.deleted]: true },
                }
            );

            if (tableName != TableNames.Company) {
                //It means that the above objects are deleted on request from model's references (And not from model itself)
                cascadeDeleteMethodReference.call(
                    {
                        ignoreSelfCall: true,
                    },
                    TableNames.Company,
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
            projection[TableFields.ID] = 1;
            projection[TableFields.name_] = 1;
            projection[TableFields.email] = 1;
            projection[TableFields.contact] = 1;
            projection[TableFields.address] = 1;
            projection[TableFields.licenseDetails] = 1;
            projection[TableFields.financialYear] = 1;
            projection[TableFields.taxRegistrationNumber] = 1;
            projection[TableFields.businessType] = 1;
            projection[TableFields.contactPerson] = 1;

            return this;
        };

        this.withId = () => {
            projection[TableFields.ID] = 1;
            return this;
        };

        this.withName = () => {
            projection[TableFields.name_] = 1;
            return this;
        };

        this.withContact = () => {
            projection[TableFields.contact] = 1;
            return this;
        };

        this.withLicenseDetails = () => {
            projection[TableFields.licenseDetails] = 1;
            return this;
        };

        this.withFinancialYear = () => {
            projection[TableFields.financialYear] = 1;
            return this;
        };

        this.withTaxRegistrationNumber = () => {
            projection[TableFields.taxRegistrationNumber] = 1;
            return this;
        };

        this.withBusinessTypeInfo = () => {
            projection[TableFields.businessType] = 1;
            return this;
        };

        this.withContactPersonInfo = () => {
            projection[TableFields.contactPerson] = 1;
            return this;
        };

        this.execute = async () => {
            return await methodToExecute.call(projection);
        };
    }
};

module.exports = CompanyService;

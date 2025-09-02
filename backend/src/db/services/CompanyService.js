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

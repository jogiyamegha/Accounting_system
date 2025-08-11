const mongoose = require("mongoose");
const validator = require("validator");
const { TableFields, TableNames, ValidationMsg, LicenseTypes, BusinessTypes} = require('../../utils/constants');

const Schema = mongoose.Schema;

const companySchema = new Schema(
    {
        [TableFields.name_]: {
            type: String,
            trim: true,
            required: [true, ValidationMsg.NameEmpty],
        },
        [TableFields.email]: {
            type: String,
            trim: true,
            required: [true, ValidationMsg.EmailEmpty],
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new ValidationError(ValidationMsg.EmailInvalid);
                }
            },
        },
        [TableFields.contact]: {
            [TableFields.phoneCountry]: {
                type: String,
            },
            [TableFields.phone]: {
                type: Number,
            },
        },
        [TableFields.address]: {
            [TableFields.addressLine1]: {
                type: String,
            },
            [TableFields.addressLine2]: {
                type: String,
            },
            [TableFields.street]: {
                type: String,
            },
            [TableFields.landmark]: {
                type: String,
            },
            [TableFields.zipCode]: {
                type: Number,
                required: [true, ValidationMsg.ZipcodeEmpty],
            },
            [TableFields.city]: {
                type: String,
            },
            [TableFields.state]: {
                type: String,
            },
            [TableFields.country]: {
                type: String,
            },
        },
        [TableFields.licenseDetails]: {
            [TableFields.licenseType]: {
                type: Number,
                enum: Object.values(LicenseTypes),
            },
            [TableFields.licenseNumber]: {
                type: String,
                trim : true,
                required: [true, ValidationMsg.LicenseNumberEmpty],
            },
            [TableFields.licenseIssueDate] : {
                type: Date,
                required: [true, ValidationMsg.LicenseIssueDateEmpty],
            },
            [TableFields.licenseExpiry]: {
                type: Date,
                required: [true, ValidationMsg.LicenseExpiryEmpty],
            },
        },
        [TableFields.financialYear]: {
            [TableFields.startDate]: {
                type: Date,
            },
            [TableFields.endDate]: {
                type: Date,
            },
        },
        [TableFields.taxRegistrationNumber]: {
            type: String,
        },
        [TableFields.businessType]: {
            type: Number,
            enum: Object.values(BusinessTypes),
        },
        [TableFields.contactPerson]: {
            [TableFields.name]: {
                type: String,
                trim: true,
                required: [true, ValidationMsg.NameEmpty],
            },
            [TableFields.contact]: {
                [TableFields.phoneCountry]: {
                    type: String,
                },
                [TableFields.phone]: {
                    type: Number,
                },
            },
        },
    },
    {
        timeStamps: true,
    }
);


const Company = mongoose.model(TableNames.Company, companySchema);
module.exports = Company;
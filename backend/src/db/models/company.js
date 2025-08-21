const mongoose = require("mongoose");
const validator = require("validator");
const { TableFields, TableNames, ValidationMsg } = require('../../utils/constants');
const Util = require("../../utils/util");
 
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
            [TableFields.zipcode]: {
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
                type: String,
                trim: true,
                // enum: Object.values(LicenseTypes),
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
            type: Number,
            required: [true, ValidationMsg.TaxRegistrationNumberEmpty],
            validate: {
                validator(value) {
                return !value || Util.isValidTaxRegistrationNumber(value);
            },
            message: () => ValidationMsg.InvalidTaxRegNumber
        }
        },
        [TableFields.businessType]: {
            type: String,
            // enum: Object.values(BusinessTypes),
        },
          [TableFields.deleted] : {
            type: Boolean,
            default: false
        },
        [TableFields.contactPerson]: {
            [TableFields.name_]: {
                type: String,
                trim: true,
                // required: [true, ValidationMsg.NameEmpty],
            },
            [TableFields.contact]: {
                [TableFields.phoneCountry]: {
                    type: String,
                    trim : true,
                    lowercase : true
                },
                [TableFields.phone]: {
                    type : Number,
                    trim : true,
                    // validate: {
                    //     validator(value) {
                    //         return !value || Util.isValidMobileNumber(value);
                    //     },
                    //     message: () => ValidationMsg.PhoneInvalid
                    // }

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
 
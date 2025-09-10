const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { TableFields, TableNames, InterfaceType, ValidationMsg, UserTypes, ServiceStatus } = require('../../utils/constants');
const Util = require('../../utils/util');
const Schema = mongoose.Schema;

const clientSchema = new Schema(
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
        [TableFields.password]: {
            type: String,
            minlength: 8,
            trim: true,
        },
        [TableFields.contact]: {
            [TableFields.phoneCountry] : {
                type : String,
                trim : true,
                lowercase : true
            },
            [TableFields.phone] : {
                type : Number,
                trim : true,
                validate: {
                    validator(value) {
                        return !value || Util.isValidMobileNumber(value);
                    },
                    message: () => ValidationMsg.PhoneInvalid
                }                
            },
        },
        [TableFields.position] : {
            type : String,
            trim : true,
            required:[true, ValidationMsg.PositionEmpty]
        },
        [TableFields.companyId]: {
            type: mongoose.Schema.Types.ObjectId,
            trim: true,
        },
        [TableFields.registeredDate]: {
            type: Date,
            default : Date.now()
        },
        [TableFields.isActive]: {
            type: Boolean,
            default: true,
        },
        [TableFields.userType]: {
            type: Number,
            enum: Object.values(UserTypes),
        },
        [TableFields.deleted] : {
            type: Boolean,
            default: false
        },
        [TableFields.passwordResetToken]: {
            type: String,
            trim: true,
        },
        [TableFields.passwordResetTokenExpiresAt]: {
            type: Date,
        },
        [TableFields.tokens]: [
            {
                [TableFields.ID]: false,
                [TableFields.token]: {
                    type: String,
                    required: true,
                },
            },
        ],

        [TableFields.services] : [
            {
                [TableFields.serviceId] : {
                    type : mongoose.Schema.Types.ObjectId,
                    ref : TableNames.Service
                },
                [TableFields.serviceStartDate] : {
                    type : Date,
                    default : Date.now() 
                },
                [TableFields.endDate] : {
                    type : Date
                },
                [TableFields.serviceStatus] : {
                    type : Number,
                    enum : Object.values(ServiceStatus)
                },
                [TableFields.serviceStatusChangeDate] : {
                    type: Date
                },
                [TableFields.deleted] : {
                    type: Boolean,
                    default : false
                }
            }
        ]
    },
    {
        timeStamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete ret[TableFields.password];
                delete ret[TableFields.passwordResetToken];
                delete ret.__v;
            },
        },
    }
);

clientSchema.pre("save", async function (next) {
    if(this.isModified(TableFields.password)){
            this[TableFields.password] = await bcrypt.hash(this[TableFields.password], 8);
        }
    next();
});

clientSchema.methods.isValidAuth = async function (password) {
    return await bcrypt.compare(password, this[TableFields.password]);
};

clientSchema.methods.isValidPassword = function (password) {
    let regEx =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    return regEx.test(password);
};

clientSchema.methods.createAuthToken = function (interFaceType) {
    const token = jwt.sign(
        {
            [TableFields.ID]: this._id.toString(),
            interface: interFaceType,
        },
        process.env.JWT_CLIENT_PK,
        {
            expiresIn: "24h",
        }
    );

    return token;
};

clientSchema.index({ [TableFields.email]: 1 }, { unique: true });

const Client = mongoose.model(TableNames.Client, clientSchema);
module.exports = Client;

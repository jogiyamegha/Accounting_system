const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { TableFields, TableNames, UserTypes, ValidationMsg, InterfaceType} = require('../../utils/constants');

const Schema = mongoose.Schema;

const adminSchema = new Schema(
    {
        [TableFields.name_]: {
            type: String,
            trim: true,
            required: true,
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
            required: [true, ValidationMsg.PasswordEmpty],
            minlength: 8,
            trim: true,
        },
        [TableFields.userType]: {
            type: Number,
            enum: Object.values(UserTypes),
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
        [TableFields.passwordResetToken]: {
            type: String,
            trim: true,
        },
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

adminSchema.pre('save', async function(next) {
    if(this.isModified(TableFields.password)){
        this[TableFields.password] = await bcrypt.hash(this[TableFields.password], 8);
    }
    next();
})

adminSchema.methods.isValidAuth = async function (password) {
    return await bcrypt.compare(password, this[TableFields.password]);
};

adminSchema.methods.isValidPassword = function (password) {
    let regEx =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    return regEx.test(password);
};

adminSchema.methods.createAuthToken = function (interFaceType) {
    const token = jwt.sign(
        {
            [TableFields.ID]: this._id.toString(),
            interface: interFaceType,
        },
        process.env.JWT_ADMIN_PK,
        {
            expiresIn: "24h",
        }
    );

    return token;
};

adminSchema.index({ [TableFields.email]: 1 }, { unique: true });

const Admin = mongoose.model(TableNames.Admin, adminSchema);
module.exports = Admin;

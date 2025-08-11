const Client = require('../models/client');
const { TableFields, TableNames, UserTypes, ValidationMsg, InterfaceType} = require('../../utils/constants');
const ValidationError = require('../../utils/ValidationError');

class ClientService {
    static findByEmail = (email) => {
        return new ProjectionBuilder(async function() {
            return await Client.findOne({email}, this);
        })
    }

    static existsWithEmail = async (email, exceptionId) => {
        return await Client.exists({
            [TableFields.email] : email,
            ...(exceptionId
                ? {
                    [TableFields.ID] : {$ne : exceptionId}
                  }
                : {}
            ),
        })
    }

    static saveAuthToken = async (userId, token) => {
        await Client.updateOne(
            {
                [TableFields.ID] : userId
            },
            {
                $push : {
                    [TableFields.tokens] : {
                        [TableFields.token] : token
                    }
                }
            }
        )
    }

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
                    [TableFields.tokens]: {[TableFields.token]: authToken},
                },
            }
        );
    };

     static insertRecord = async (clientFields) => {
        const client = new Client(clientFields);

        let error = client.validateSync();
        let createdClientRecord;
        if(error){
            throw error;
        } else {
            try{
                createdClientRecord = await client.save();    
                return createdClientRecord;
            } catch(e){
                if(createdClientRecord){
                    await createdClientRecord.delete();
                }
            }
        }
    }

    static insertUserRecord = async (reqBody) => {
        let email = reqBody[TableFields.email];
        email = (email + '').trim().toLocaleLowerCase();

        const password = reqBody[TableFields.password];

        if(!email) {
            throw new ValidationError(ValidationMsg.EmailEmpty);
        }
        if(!password) {
            throw new ValidationError(ValidationMsg.PasswordEmpty);
        }

        if(email == password){
            throw new ValidationError(ValidationMsg.PasswordInvalid);
        }

        if(await ClientService.existsWithEmail(email)){
            throw new ValidationError(ValidationMsg.DuplicateEmail)
        }

        const user = new Client(reqBody);
        user[TableFields.userType] = UserTypes.Client;

        if(!user.isValidPassword(password)){
            throw new ValidationError(ValidationMsg.PasswordInvalid)
        }
        try{
            await user.save();
            return user;
        } catch (error){
            if(error.code == 110000) {
                throw new ValidationError(ValidationMsg.DuplicateEmail)
            }
            throw error;
        }

    }
}

const ProjectionBuilder = class {
    constructor(methodToExecute) {
        const projection = {};
        this.withBasicInfo = () => {
            projection[TableFields.name_] = 1;
            projection[TableFields.email] = 1;
            projection[TableFields.userType] = 1;
            projection[TableFields.contact] = 1;
            
            return this; 
        }
         this.withEmail = () => {
            projection[TableFields.email] = 1;
            return this;
        }
        this.withPassword = () => {
            projection[TableFields.password] = 1;
            return this;
        }
        this.withUserType = () => {
            projection[TableFields.userType] = 1;
            return this;
        }
        this.withId = () => {
            projection[TableFields.ID] = 1;
            return this;
        }
        this.execute = async () => {
            return await methodToExecute.call(projection);
        }
    }
}

module.exports = ClientService;
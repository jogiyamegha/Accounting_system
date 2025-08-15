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
 
class CompanyService {
 
    static findByEmail = (email) => {
        return new ProjectionBuilder(async function() {
            return await Company.findOne({email}, this);
        })
    }

    static getCompanyById = (userId) => {
    return new ProjectionBuilder(async function () {
      return await Company.findOne({ [TableFields.ID]: userId }, this);
    });
  };
 
    static existsWithEmail = async (email, exceptionId) => {
        return await Company.exists({
            [TableFields.email] : email,
            ...(exceptionId
                ? {
                    [TableFields.ID] : {$ne : exceptionId}
                  }
                : {}
            ),
        })
    }
 
    static getCompanyById = (companyId) => {
        return new ProjectionBuilder(async function () {
            return await Company.findOne({ [TableFields.ID]: companyId }, this);
        });
    };
 
    static insertRecord = async (companyFields) => {
        const company = new Company(companyFields);
 
        let error = company.validateSync();
        let createdCompanyRecord;
        if(error){
            throw error;
        } else {
            try{
                createdCompanyRecord = await company.save();    
                return createdCompanyRecord;
            } catch(e){
                if(createdCompanyRecord){
                    await createdCompanyRecord.delete();
                }
            }
        }
    }
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
       
        return this;
    }
 
    this.withId = () => {
        projection[TableFields.ID] = 1;
        return this;
    }
 
    this.withName = () => {
        projection[TableFields.name_] = 1;
        return this;
    }
 
    this.withContact = () => {
        projection[TableFields.contact] = 1;
        return this;
    }
 
    this.withLicenseDetails = () => {
        projection[TableFields.licenseDetails] = 1;
        return this;
    }
 
    this.withFinancialYear = () => {
        projection[TableFields.financialYear] = 1;
        return this;
    }
 
    this.withTaxRegistrationNumber = () => {
        projection[TableFields.taxRegistrationNumber] = 1;
        return this;
    }
 
    this.withBusinessTypeInfo = () => {
        projection[TableFields.businessType] = 1;
        return this;
    }
 
    this.withContactPersonInfo = () => {
        projection[TableFields.contactPerson] = 1;
        return this;
    }
 
    this.execute = async () => {
        return await methodToExecute.call(projection);
    }
  }
};
 
module.exports = CompanyService;
 
 
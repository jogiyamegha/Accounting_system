// const VATService = require("../../db/services/VATService");
// const { TableFields, ValidationMsg } = require("../../utils/constants");
// const ValidationError = require("../../utils/ValidationError");

// exports.approveVATRequest = async (req) => {

//     let clientId = req.body.clientId;

//     let vatRequest = await VATService.getVatServiceByClientId(clientId).withBasicInfo().execute();

//     console.log(vatRequest)
//     if(!vatRequest) throw new ValidationError(ValidationMsg.RecordNotFound);



// }


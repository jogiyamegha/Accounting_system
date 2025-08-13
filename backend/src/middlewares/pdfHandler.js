const {
    ValidationMsgs,
    ResponseStatus,
    TableFields,
    ApiResponseCode,
} = require("../utils/constants");

const ValidationError = require("../utils/ValidationError");

const Util = require("../utils/util");

const multer = require("multer");

function isValidPDFFile(fileOriginalname) {
    return Util.isPdfFile(fileOriginalname); // You should define this function in util.js
}

const uploader = multer({
        fileFilter(req, file, cb) {
            if (!isValidPDFFile(file.originalname)) {
            return cb(new ValidationError(ValidationMsgs.incorrectPDF));
        }

        cb(undefined, true);
    },
});

const PDFHandler = class {
      static single = function (fieldName) {
     const m1 = uploader.single(fieldName);

    const methodToExecute = async (req, resp, next) => {
      m1(req, resp, function (err) {
        if (err) {
          resp

            .status(ResponseStatus.InternalServerError)

            .send(Util.getErrorMessage(err));
        } else {
          next();
        }
      });
    };

    return methodToExecute;
  };

  static uploadPDFFile = function (fieldName) {
    const m1 = uploader.single(fieldName);

    const methodToExecute = async (req, resp, next) => {
      m1(req, resp, function (err) {
        if (err) {
          resp

            .status(ApiResponseCode.ClientServerError)

            .send(Util.getErrorMessage(err));
        } else {
          next();
        }
      });
    };

    return methodToExecute;
  };
};

module.exports = PDFHandler;

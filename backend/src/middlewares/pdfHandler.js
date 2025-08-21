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
  return Util.isPdfFile(fileOriginalname);
}

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter(req, file, cb) {
    if (!isValidPDFFile(file.originalname)) {
      return cb(new ValidationError(ValidationMsgs.incorrectPDF));
    }
    cb(undefined, true);
  },
});

const PDFHandler = class {
  static uploadPDFFiles = function (fieldName) {
    const m1 = uploader.array(fieldName);
    return (req, resp, next) => {
      m1(req, resp, function (err) {
        if (err) {
          return resp
            .status(ApiResponseCode.ClientOrServerError)
            .send(Util.getErrorMessage(err));
        }
        next();
      });
    };
  };

  static uploadPDFFile = function (fieldName) {
    const m1 = uploader.single(fieldName);
    return (req, resp, next) => {
      m1(req, resp, function (err) {
        if (err) {
          return resp
            .status(ApiResponseCode.ClientOrServerError)
            .send(Util.getErrorMessage(err));
        }
        next();
      });
    };
  };

  // ✅ New method: supports indexed fieldnames like documents[0][file]
  static uploadAnyPDF = function () {
    const m1 = uploader.any();
    return (req, resp, next) => {
      m1(req, resp, function (err) {
        if (err) {
          return resp
            .status(ApiResponseCode.ClientOrServerError)
            .send(Util.getErrorMessage(err));
        }
        next();
      });
    };
  };

  static uploadMultiplePDFs = function (fieldName, maxCount = 10) {
    const m1 = uploader.array(fieldName, maxCount);
    return (req, resp, next) => {
      m1(req, resp, function (err) {
        if (err) {
          return resp
            .status(ApiResponseCode.ClientOrServerError)
            .send(Util.getErrorMessage(err));
        }
        next();
      });
    };
  };
};

module.exports = PDFHandler;

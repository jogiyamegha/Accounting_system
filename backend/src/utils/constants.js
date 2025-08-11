const UserTypes = (function () {
  function UserTypes() {}
  UserTypes.Admin = 1;
  UserTypes.Client = 2;
  return UserTypes;
})();

const InterfaceType = (function () {
  function InterfaceType() {}
  InterfaceType.Admin = {
    AdminWeb: "i1",
  };
  InterfaceType.Client = {
    ClientWeb: "i2",
  };
  return InterfaceType;
})();

const DeadlineCategory = (function () {
  function DeadlineCategory() {}
  DeadlineCategory.VATfiling = 1;
  DeadlineCategory.corporateTaxReturn = 2;
  DeadlineCategory.audit = 3;
  return DeadlineCategory;
})();

const Status = (function () {
  function Status() {}
  Status.notStarted = 1;
  Status.inProgress = 2;
  Status.completed = 3;
  return Status;
})();

const DocumentType = (function () {
  function DocumentType() {}
  DocumentType.VATcertificate = 1;
  DocumentType.CorporateTacDocument = 2;
  DocumentType.BankStatement = 3;
  DocumentType.bankStatement = 4;
  DocumentType.Invoice = 5;
  DocumentType.auditFiles = 6;
  (DocumentType.TradeLicense = 7), (DocumentType.passport = 8);
  DocumentType.Other = 9;
  return DocumentType;
})();

const DocStatus = (function () {
  function DocStatus() {}
  DocStatus.pending = 1;
  DocStatus.approved = 2;
  DocStatus.rejected = 3;
  return DocStatus;
})();

const ServiceType = (function () {
  function ServiceType() {}
  ServiceType.VAT = 1;
  ServiceType.corporateTax = 2;
  ServiceType.accounting = 3;
  ServiceType.general = 5;
  return ServiceType;
})();

const LicenseTypes = (function () {
  function LicenseTypes() {}
  return LicenseTypes;
})();

const BusinessTypes = (function () {
  function BusinessTypes() {}
  return BusinessTypes;
})();

const NotificationTypes = (function () {
  function NotificationTypes() {}
  NotificationTypes.upcomingDeadline = 1;
  NotificationTypes.missingDocuments = 2;
  NotificationTypes.feedback = 3;
  NotificationTypes.documentStatus = 4;
  NotificationTypes.clientActiveStatus = 5;
  NotificationTypes.systemUpdate = 6;
  return NotificationTypes;
})();

const RequestStatus = (function RequestStatus() {
  function RequestStatus() {}
  RequestStatus.pending = 1;
  RequestStatus.approved = 2;
  RequestStatus.rejected = 3;
  return RequestStatus;
})();

const FCMPlatformType = (function () {
  function type() {}
  type.Android = 1;
  type.iOS = 2;
  return type;
})();

const ValidationMsg = (function () {
  function ValidationMsg() {}
  ValidationMsg.NameEmpty = "Name required!";
  ValidationMsg.EmailEmpty = "Email required!";
  ValidationMsg.EmailInvalid = "Oops, email invalid please enter valid email..";
  ValidationMsg.PasswordEmpty = "Password required!";
  ValidationMsg.PasswordInvalid = "Password Invalid";
  ValidationMsg.LicenseNumberEmpty = "License number required!";
  ValidationMsg.RegisteredDateEmpty = "Registered-Date required!";
  ValidationMsg.LicenseExpiryEmpty = "LicenseExpiry required!";
  ValidationMsg.ZipcodeEmpty = "zipCode required!";
  ValidationMsg.ServiceTypeEmpty = "ServiceType required";
  ValidationMsg.ReceiverIdEmpty = "ReceiverId required";
  ValidationMsg.MessageEmpty = "message required!";
  ValidationMsg.InvalidPassResetCode = "The Password Reset Token is Invalid.";
  ValidationMsg.TargetCompletionDateEmpty = "TargetCompletionDate required!";
  ValidationMsg.AccountantNameEmpty = "AccountantName required!";
  ValidationMsg.AccountNotRegistered = "Account not registered.";
  ValidationMsg.RequestStatusEmpty = "Request Status required!";
  ValidationMsg.DocumentEmpty = "Document required!";
  ValidationMsg.ServiceIdEmpty = "ServiceId required!";
  ValidationMsg.DocumentTypeEmpty = "DocumentType required";
  ValidationMsg.NotAllowed = "Not Allowed!";
  ValidationMsg.UnableToLogin = "Unable To Login!";
  ValidationMsg.DuplicateEmail = "email already exists!";
  ValidationMsg.LicenseIssueDateEmpty = "licenseIssueDate required!";
  ValidationMsg.CompanyNameEmpty = "CompanyName required!";
  ValidationMsg.ParametersError = "Invalid Parameter";
  ValidationMsg.PasswordResetCodeEmpty = "Reset code is Required..";
  ValidationMsg.NewPasswordEmpty = "New Password is require.";
  ValidationMsg.RecordNotFound = "Record not Found!";
  ValidationMsg.OldPasswordIncorrect = "Entered old password is incorrect.";
  ValidationMsg.ClientExists = "Client already Exists";

  return ValidationMsg;
})();

const ResponseMessages = (function () {
  function ResponseMessages() {}
  ResponseMessages.Ok = "Ok";
  ResponseMessages.NotFound = "Data not found!";
  ResponseMessages.signInSuccess = "Sign In successfully!";
  ResponseMessages.signOutSuccess = "Sign Out successfully!";
  return ResponseMessages;
})();

const GeneralMessages = (function () {
  function GeneralMessages() {}
  GeneralMessages.PendingSubject = "Updates Pending";
  GeneralMessages.forgotPasswordEmailSubject = "Reset your password";
  GeneralMessages.signupEmailSucess = "Your Account is Ready!";
  GeneralMessages.invitationLink = "Invitation link for login";
  return GeneralMessages;
})();

const TableNames = (function () {
  function TableNames() {}
  TableNames.Admin = "admins";
  TableNames.Client = "clients";
  TableNames.Document = "documents";
  TableNames.Company = "companies";
  TableNames.CalenderEvent = "calenderevents";
  TableNames.Notification = "notifications";
  TableNames.Service = "services";
  TableNames.ClientService = "clientServices";
  TableNames.VATservice = "VATservices";
  return TableNames;
})();

const TableFields = (function () {
  function TableFields() {}
  TableFields.ID = "_id";
  TableFields.name_ = "name";
  TableFields.email = "email";
  TableFields.password = "password";
  TableFields.tokens = "token";
  TableFields.token = "token";
  TableFields.userType = "userType";
  TableFields.passwordResetToken = "passwordResetToken";
  TableFields.contact = "contact";
  TableFields.phoneCountry = "phoneCountry";
  TableFields.phone = "phone";
  TableFields.companyId = "companyId";
  TableFields.companyName = "companyName";
  TableFields.registeredDate = "registeredDate";
  TableFields.isActive = "isActive";
  TableFields.clientDetails = "clientDetails";
  TableFields.clientId = "clientId";
  TableFields.documents = "documents";
  TableFields.documentDetails = "documentDetails";
  TableFields.docStatus = "docStatus";
  TableFields.documentType = "documentType";
  TableFields.document = "document";
  TableFields.comments = "comments";
  TableFields.uploadedAt = "uploadedAt";
  TableFields.address = "address";
  TableFields.addressLine1 = "addressLine1";
  TableFields.addressLine2 = "addressLine2";
  TableFields.street = "street";
  TableFields.landmark = "landmark";
  TableFields.zipCode = "zipCode";
  TableFields.city = "city";
  TableFields.state = "state";
  TableFields.country = "country";
  TableFields.licenseDetails = "licenseDetails";
  TableFields.licenseType = "licenseType";
  TableFields.licenseNumber = "licenseNumber";
  TableFields.licenseIssueDate = "licenseIssueDate";
  TableFields.licenseExpiry = "licenseExpiry";
  TableFields.taxRegistrationNumber = "taxRegistrationNumber";
  TableFields.financialYear = "financialYear";
  TableFields.startDate = "startDate";
  TableFields.endDate = "endDate";
  TableFields.businessType = "businessType";
  TableFields.contactPerson = "contactPerson";
  TableFields.title = "title";
  TableFields.description = "description";
  TableFields.associatedClients = "associatedClients";
  TableFields.clientDetail = "clientDetail";
  TableFields.clientName = "clientName";
  TableFields.serviceType = "serviceType";
  TableFields.deadlineDetails = "deadlineDetails";
  TableFields.deadlineCategory = "deadlineCategory";
  TableFields.deadline = "deadline";
  TableFields.startDate = "startDate";
  TableFields.endDate = "endDate";
  TableFields.isAllDay = "isAllDay";
  TableFields.colorCode = "colorCode";
  TableFields.isCompleted = "isCompleted";
  TableFields.receiverId = "receiverId";
  TableFields.message = "message";
  TableFields.notificationType = "notificationType";
  TableFields.serviceType = "serviceType";
  TableFields.targetCompletionDate = "targetCompletionDate";
  TableFields.description = "description";
  TableFields.assignedStaff = "assignedStaff";
  TableFields.accountantName = "accountantName";
  TableFields.note = "note";
  TableFields.requestedOn = "requestedOn";
  TableFields.status = "status";
  TableFields.serviceDetails = "serviceDetails";
  TableFields.serviceId = "serviceId";
  TableFields.serviceStartDate = "serviceStartDate";
  TableFields.serviceEndDate = "serviceEndDate";
  TableFields.clients = "clients";
  TableFields.startingAmount = "startingAmount";
  TableFields.totalAmount = "totalAmount";
  TableFields.requiredDocumentList = "requiredDocumentList";
  TableFields.value = "value";
  TableFields.authType = 'authType';

  return TableFields;
})();

const AuthTypes = (function () {
  function types() {}
  types.Admin = 1;
  types.CollegeAdmin = 2;
  types.Student = 3;
  return types;
})();

const Types = (function () {
  function types() {}
  types.admin = 1;
  types.collegeAdmin = 2;
  types.student = 3;
  return types;
})();

const ResponseStatus = (function () {
  function ResponseStatus() {}
  ResponseStatus.Failed = 0;
  ResponseStatus.Success = 200;
  ResponseStatus.BadRequest = 400;
  ResponseStatus.Unauthorized = 401;
  ResponseStatus.NotFound = 404;
  ResponseStatus.UpgradeRequired = 426;
  ResponseStatus.AccountDeactivated = 3001;
  ResponseStatus.InternalServerError = 500;
  ResponseStatus.ServiceUnavailable = 503;
  return ResponseStatus;
})();
const DefaultConfigTypes = (function () {
  function types() {}
  types.userAppSettings = "appSettings"; //default configuration type
  return types;
})();

const ApiResponseCode = (function () {
  function ApiResponseCode() {}
  ApiResponseCode.ClientOrServerError = 400;
  ApiResponseCode.ResponseSuccess = 200;
  ApiResponseCode.AuthError = 401;
  ApiResponseCode.UnderMaintenance = 503; //Service Unavailable
  ApiResponseCode.ForceUpdate = 409; //Version Control
  return ApiResponseCode;
})();
const ResponseFields = (function () {
  function ResponseFields() {}
  ResponseFields.status = "status";
  ResponseFields.message = "message";
  ResponseFields.result = "result";
  return ResponseFields;
})();

module.exports = {
  UserTypes,
  InterfaceType,
  DeadlineCategory,
  Status,
  DocumentType,
  DocStatus,
  ServiceType,
  LicenseTypes,
  BusinessTypes,
  NotificationTypes,
  RequestStatus,
  FCMPlatformType,
  ValidationMsg,
  ResponseMessages,
  GeneralMessages,
  TableNames,
  TableFields,
  AuthTypes,
  Types,
  ResponseStatus,
  DefaultConfigTypes,
  ApiResponseCode,
  ResponseFields,
};

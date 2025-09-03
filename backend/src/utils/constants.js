const UserTypes = (function () {
    function UserTypes() { }
    UserTypes.Admin = 1;
    UserTypes.Client = 2;
    return UserTypes;
})();

const InterfaceType = (function () {
    function InterfaceType() { }
    InterfaceType.Admin = {
        AdminWeb: "i1",
    };
    InterfaceType.Client = {
        ClientWeb: "i2",
    };
    return InterfaceType;
})();

const DeadlineCategory = (function () {
    function DeadlineCategory() { }
    DeadlineCategory.VATfiling = 1;
    DeadlineCategory.corporateTaxReturn = 2;
    DeadlineCategory.payroll = 3;
    DeadlineCategory.audit = 4;
    return DeadlineCategory;
})();

const DeadlineCategoryColor = (function (){
    function DeadlineCategoryColor() {};
    DeadlineCategoryColor.VATfiling = '#9ECAD6';
    DeadlineCategoryColor.corporateTaxReturn = '#748DAE';
    DeadlineCategoryColor.payroll = '#F5CBCB';
    DeadlineCategoryColor.audit = '#FFEAEA';
    return DeadlineCategoryColor;
})()

const Status = (function () {
    function Status() { }
    Status.notStarted = 1;
    Status.inProgress = 2;
    Status.completed = 3;
    return Status;
})();

const ServiceStatus = (function () {
    function ServiceStatus() { };
    ServiceStatus.notStarted = 1;
    ServiceStatus.inProgress = 2;
    ServiceStatus.completed = 3;

    return ServiceStatus;
})();

const DocumentType = (function () {
    function DocumentType() { }
    DocumentType.VATcertificate = 1;
    DocumentType.CorporateTaxDocument = 2;
    DocumentType.BankStatement = 3;
    DocumentType.Invoice = 4;
    DocumentType.auditFiles = 5;
    DocumentType.TradeLicense = 6;
    DocumentType.passport = 7;
    DocumentType.FinancialStatements = 8;
    DocumentType.BalanceSheet = 9;
    DocumentType.Payroll = 10;
    DocumentType.WPSReport = 11;
    DocumentType.ExpenseReciept = 12;
    return DocumentType;
})();

const DocStatus = (function () {
    function DocStatus() { }
    DocStatus.pending = 1;
    DocStatus.approved = 2;
    DocStatus.rejected = 3;
    return DocStatus;
})();

const DurationType = (function () {
    function DurationType() { }
    DurationType.monthly = 1;
    DurationType.quaterly = 2;
    return DurationType;
})();

const ServiceType = (function () {
    function ServiceType() { }
    ServiceType.VAT = 1;
    ServiceType.CorporateTaxServices = 2;
    ServiceType.Payroll = 3;
    ServiceType.AuditAndCompliance = 4;
    return ServiceType;
})();

const ServiceDuration = (function () {
    function ServiceDuration() { }
    ServiceDuration.VAT = 30;
    ServiceDuration.CorporateTaxServices = 60;
    ServiceDuration.Payroll = 45;
    ServiceDuration.AuditAndCompliance = 30
    return ServiceDuration;
})();

const LicenseTypes = (function () {
    function LicenseTypes() { }
    return LicenseTypes;
})();

const BusinessTypes = (function () {
    function BusinessTypes() { }

    return BusinessTypes;
})();

const NotificationTypes = (function () {
    function NotificationTypes() { }
    NotificationTypes.upcomingDeadline = 1;
    NotificationTypes.missingDocuments = 2;
    NotificationTypes.feedback = 3;
    NotificationTypes.documentStatus = 4;
    NotificationTypes.clientActiveStatus = 5;
    NotificationTypes.systemUpdate = 6;
    NotificationTypes.payrollReminder = 7;

    return NotificationTypes;
})();

const RequestStatus = (function RequestStatus() {
    function RequestStatus() { }
    RequestStatus.pending = 1;
    RequestStatus.approved = 2;
    RequestStatus.rejected = 3;
    return RequestStatus;
})();

const FCMPlatformType = (function () {
    function type() { }
    type.Android = 1;
    type.iOS = 2;
    return type;
})();

const ValidationMsg = (function () {
    function ValidationMsg() { }

    ValidationMsg.TitleEmpty = 'title required';
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
    ValidationMsg.ServiceStartDateEmpty = 'Service Start Date required!';
    ValidationMsg.DurationTypeEmpty = "DurationType required";
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
    ValidationMsg.PasswordNotMatched = "Password doesn't matched..";
    ValidationMsg.EmailExists = "user exists";
    ValidationMsg.ClientNotExists = "Client is Not Exists";
    ValidationMsg.ContactNumberEmpty = "Contact Number required!";
    ValidationMsg.PhoneInvalid = "phone numbe invalid";
    ValidationMsg.PhoneCountryEmpty = "Phone Country required";
    ValidationMsg.NotUser = "you can not set profile as you are not client!";
    ValidationMsg.LicenseTypeEmpty = "License Type required";
    ValidationMsg.StartDateEmpty = "StartDate required";
    ValidationMsg.EndDateEmpty = "EndDate required";
    ValidationMsg.TaxRegistrationNumberEmpty = "Tax Registration Number required";
    ValidationMsg.BusinessTypeEmpty = "BusinessType required";
    ValidationMsg.InvalidTaxRegNumber = "Invalid TaxRegistration Number";
    ValidationMsg.ClientIdEmpty = "ClientId required";
    ValidationMsg.DocumentTypeRequired = "DocumentType Required!";
    ValidationMsg.FileUploadFailed = "FileUpload Failed";
    ValidationMsg.FileRequired = "File Required";
    ValidationMsg.DescriptionEmpty = "Description is Required.";
    ValidationMsg.AmountEmpty = "Amount is Required.";
    ValidationMsg.PositionEmpty = "position required";
    ValidationMsg.CompanyNotExists = "Company Not Exists";
    ValidationMsg.UserNotFound = "Cannot get the user Token to verify";
    ValidationMsg.AdminNotFound = "Admin Not Found from Token";
    ValidationMsg.ServiceNotEnded = "Opps, can not assign service as past service is running!"
    ValidationMsg.ClientNotAssignService = 'this service is not assigned to client..';
    ValidationMsg.ServiceIsCompleted = 'service is already completed, You can not De-assign.';
    ValidationMsg.ServiceIsNotCompleted = 'service is not completed yet, so you can renew it after completion';
    ValidationMsg.DeadlineCategoryEmpty = 'deadline field is required';
    ValidationMsg.DateEmpty = 'Date required';
    ValidationMsg.EventNotFound = 'Event Not Found';

    return ValidationMsg;
})();

const ResponseMessages = (function () {
    function ResponseMessages() { }
    ResponseMessages.Ok = "Ok";
    ResponseMessages.NotFound = "Data not found!";
    ResponseMessages.signInSuccess = "Sign In successfully!";
    ResponseMessages.signOutSuccess = "Sign Out successfully!";
    return ResponseMessages;
})();

const GeneralMessages = (function () {
    function GeneralMessages() { }
    GeneralMessages.PendingSubject = "Updates Pending";
    GeneralMessages.DocStatus = "Document's Update Message";
    GeneralMessages.ServiceAssign = "New Service Assign ";
    GeneralMessages.forgotPasswordEmailSubject = "Reset your password";
    GeneralMessages.signupEmailSucess = "Your Account is Ready!";
    GeneralMessages.changePasswordSucess =
        "Your new Pasword is set successfully..";
    GeneralMessages.invitationLink = "Invitation link for login";
    GeneralMessages.ClientActivityStatus = "Your activity status changed";
    GeneralMessages.RenewalMessage = 'Your service got renewal!';
    return GeneralMessages;
})();

const TableNames = (function () {
    function TableNames() { }
    TableNames.Admin = "admins";
    TableNames.Client = "clients";
    TableNames.Document = "documents";
    TableNames.Company = "companies";
    TableNames.Calendar = "calendars";
    TableNames.Notification = "notifications";
    TableNames.Service = "services";
    TableNames.ClientService = "clientServices";
    TableNames.VATservice = "VATservices";
    TableNames.Invoice = 'invoices';
    return TableNames;
})();

const TableFields = (function () {
    function TableFields() { }
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
    TableFields.documentId = "documentId";
    TableFields.documents = "documents";
    TableFields.documentDetails = "documentDetails";
    TableFields.docStatus = "docStatus";
    TableFields.documentType = "documentType";
    TableFields.document = "document";
    TableFields.comments = "comments";
    TableFields.uploadedAt = "uploadedAt";
    TableFields.deleteDoc = "deleteDoc";
    TableFields.address = "address";
    TableFields.addressLine1 = "addressLine1";
    TableFields.addressLine2 = "addressLine2";
    TableFields.street = "street";
    TableFields.landmark = "landmark";
    TableFields.zipcode = "zipcode";
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
    TableFields.serviceDuration = 'serviceDuration';
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
    TableFields.isRead = 'isRead';
    TableFields.expiresAt = 'expiresAt';
    TableFields.serviceType = "serviceType";
    TableFields.targetCompletionDate = "targetCompletionDate";
    TableFields.targetCompletionDurationInYears =
        "targetCompletionDurationInYears";
    TableFields.description = "description";
    TableFields.assignedStaff = "assignedStaff";
    TableFields.accountantName = "accountantName";
    TableFields.note = "note";
    TableFields.requestedOn = "requestedOn";
    TableFields.status = "status";
    TableFields.requestStatus = "requestStatus";
    TableFields.serviceDetails = "serviceDetails";
    TableFields.serviceId = "serviceId";
    TableFields.serviceStartDate = "serviceStartDate";
    TableFields.serviceEndDate = "serviceEndDate";
    TableFields.serviceStatus = 'serviceStatus';
    TableFields.clients = "clients";
    TableFields.durationType = "durationType";
    TableFields.startingAmount = "startingAmount";
    TableFields.totalAmount = "totalAmount";
    TableFields.requiredDocumentList = "requiredDocumentList";
    TableFields.value = "value";
    TableFields.authType = "authType";
    TableFields.passwordResetTokenExpiresAt = "passwordResetTokenExpiresAt";
    TableFields.position = "position";
    TableFields.deleted = 'deleted';
    TableFields.invoiceList = 'invoiceList';
    TableFields.invoice = 'invoice';
    TableFields.invoiceNumber = 'invoiceNumber';
    TableFields.services = 'services';
    TableFields.clientEmail = 'clientEmail';
    TableFields.startDate = 'startDate';
    TableFields.endDate = 'endDate';
    TableFields.serviceType = "serviceType";
    TableFields.serviceDuration = "ServiceDuration";
    TableFields.date = 'date';

    return TableFields;
})();

const AuthTypes = (function () {
    function types() { }
    types.Admin = 1;
    types.CollegeAdmin = 2;
    types.Student = 3;
    return types;
})();

const Types = (function () {
    function types() { }
    types.admin = 1;
    types.collegeAdmin = 2;
    types.student = 3;
    return types;
})();

const ResponseStatus = (function () {
    function ResponseStatus() { }
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
    function types() { }
    types.userAppSettings = "appSettings"; //default configuration type
    return types;
})();

const ApiResponseCode = (function () {
    function ApiResponseCode() { }
    ApiResponseCode.ClientOrServerError = 400;
    ApiResponseCode.ResponseSuccess = 200;
    ApiResponseCode.AuthError = 401;
    ApiResponseCode.UnderMaintenance = 503; //Service Unavailable
    ApiResponseCode.ForceUpdate = 409; //Version Control
    return ApiResponseCode;
})();
const ResponseFields = (function () {
    function ResponseFields() { }
    ResponseFields.status = "status";
    ResponseFields.message = "message";
    ResponseFields.result = "result";
    return ResponseFields;
})();

module.exports = {
    UserTypes,
    InterfaceType,
    DeadlineCategory,
    DeadlineCategoryColor,
    Status,
    ServiceStatus,
    DocumentType,
    DocStatus,
    ServiceType,
    ServiceDuration,
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
    DurationType,
};

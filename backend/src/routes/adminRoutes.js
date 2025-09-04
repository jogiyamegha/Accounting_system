const API = require("../utils/apiBuilder");
const AuthController = require('../controllers/admin/AuthController');
const ClientController = require('../controllers/admin/ClientController');
const DocumentController = require('../controllers/admin/DocumentController')
const ServiceController = require('../controllers/admin/ServiceController');
const CalendarController = require('../controllers/admin/CalendarController');
const NotificationController = require('../controllers/admin/NotificationController');
const InvoiceController = require('../controllers/admin/InvoiceController');
const AdminDashboardController = require('../controllers/admin/AdminDashboardController');
const CronController = require('../schedulers/CronController');
const { TableFields } = require("../utils/constants");
const PDFHandler = require('../middlewares/pdfHandler');


const router = API.configRoute("/admin")

/**
 * 
 * Auth Routes
 * 
 */

.addPath('/admin')
.asGET((req, res) => {
    res.json({
        // success: true,
        user: req.user 
    });
})
.useAdminAuth()
.build()

.addPath("/signup")
.asPOST(AuthController.addAdminUser)
.build()

.addPath("/login")
.asPOST(AuthController.login)
.build()

.addPath("/logout")
.asPOST(AuthController.logout)
.useAdminAuth()
.build()

.addPath('/forgot-password')
.asPOST(AuthController.forgotPassword)
.build()
 
.addPath('/verify-otp')
.asPOST(AuthController.forgotPasswordCodeExists)
.build()
 
.addPath('/change-password')
.asPOST(AuthController.changePassword)
.build()

/**
 * 
 * Admin-Dashboard Routes
 * 
 */

.addPath('/admin-dashboard')
.asGET(AdminDashboardController.getDashboard)
.useAdminAuth()
.build()

.addPath('/documents/upload-stats')
.asGET(DocumentController.getUploadStats)
.useAdminAuth()
.build()



/**
 * 
 * Client-Management Routes
 * 
 */

.addPath('/client-management')
.asGET(ClientController.getAllClients)
.useAdminAuth()
.build()

.addPath('/add-client')
.asPOST(ClientController.addClient)
.userMiddlewares(PDFHandler.uploadAnyPDF())
.useAdminAuth()
.build()

// .addPath(`/edit-client/:${TableFields.clientId}`)
// .GET(ClientController.getClientDetails)
// .useAdminAuth()
// .build()

.addPath(`/edit-client/:${TableFields.clientId}`)
.asUPDATE(ClientController.editClient)
.userMiddlewares(PDFHandler.uploadAnyPDF())
.useAdminAuth()
.build()
 
.addPath(`/delete-client/:${TableFields.clientId}`)
.asDELETE(ClientController.deleteClient)
// .useAdminAuth()
.build()


.addPath(`/client-detail/:${TableFields.clientId}`)
.asGET(ClientController.getClientDetails)
.useAdminAuth()
.build()

.addPath(`/change-status/:${TableFields.clientId}`)
.asUPDATE(ClientController.activateDeactivateClient)
.useAdminAuth()
.build()


.addPath('/documents')
.asPOST(DocumentController.getDocumentsForAdmin)
.useAdminAuth()
.build()

/**
 * Invoice Routes
 */

.addPath(`/generate-invoice/:${TableFields.clientId}`)
.asGET(ClientController.getClientDetails)
.useAdminAuth()
.build()


.addPath(`/generate-invoice/:${TableFields.clientId}`)
.asPOST(InvoiceController.addInvoice)
.userMiddlewares(PDFHandler.uploadAnyPDF())
.useAdminAuth()
.build()
 

.addPath(`/update-doc-status/:${TableFields.clientId}`)
.asUPDATE(DocumentController.updateDocumentStatus)
.useAdminAuth()
.build()



// .addPath('/add-service')
// .asPOST(ServiceController.addService)
// .useAdminAuth()
// .build()

/**
 * Service - management
 */

.addPath('/service-management')
.asGET(ServiceController.getAllServices)
.useAdminAuth()
.build()

.addPath('/add-service')
.asPOST(ServiceController.addService)
.useAdminAuth()
.build()

/** 
 * Assign service to client
 */

.addPath('/assign-service')
.asPOST(ServiceController.assignService) 
.useAdminAuth()
.build()

.addPath(`/de-assign-service/:${TableFields.serviceId}/:${TableFields.clientId}`)
.asDELETE(ServiceController.deAssignService)
.useAdminAuth()
.build()

.addPath(`/renew-service/:${TableFields.serviceId}/:${TableFields.clientId}/:${TableFields.serviceType}`)
.asPOST(ServiceController.renewService)
.useAdminAuth()
.build()

.addPath(`/all-clients-assigned-service/:${TableFields.serviceType}`)
.asGET(ServiceController.getClientsAssignedService)
.useAdminAuth()
.build()

.addPath(`/documents/:${TableFields.clientId}/:${TableFields.serviceType}`)
.asGET(DocumentController.getClientDocuments)
.useAdminAuth()
.build()

.addPath(`/documents/upload/:${TableFields.clientId}/:${TableFields.serviceType}`)
.asPOST(DocumentController.addClientDocument)
.userMiddlewares(PDFHandler.uploadPDFFile("file"))
.useAdminAuth()
.build()

// .addPath('/approve-vat-request')
// .asPOST(VATController.approveVATRequest)
// .build()



.addPath('/document-management')
.asGET(DocumentController.getAllDocuments)
.useAdminAuth()
.build()

.addPath('/delete-document')
.asDELETE(DocumentController.deleteDocument)
.useAdminAuth()
.build()

/**
 * Notification Routes
 */

.addPath('/notification-management')
.asGET(NotificationController.getAllNotifications  
)
.useAdminAuth()
.build()

.addPath('/notification-management')
.asPOST(NotificationController.addNotification)
.useAdminAuth()
.build()

.addPath(`/notification-mark-as-read/:${TableFields.ID}`)
.asUPDATE(NotificationController.setNotificationMarkAsRead)
.useAdminAuth()
.build()

.addPath(`/service/:${TableFields.serviceType}`)
.asGET(ServiceController.getClientsAssignedService)
.useAdminAuth()
.build()

.addPath(`/service-details/:${TableFields.clientId}`)
.asGET(ServiceController.getServiceDetail)
.useAdminAuth()
.build()

/**
 * Calendar routes
 */

.addPath('/add-calendar-event')
.asPOST(CalendarController.addEvent)
.useAdminAuth()
.build()

.addPath('/all-calendar-events')
.asGET(CalendarController.getAllEvents)
.useAdminAuth()
.build()

.addPath(`/edit-calendar-event/:${TableFields.ID}`)
.asUPDATE(CalendarController.editEvent)
.useAdminAuth()
.build()

.addPath(`/delete-calendar-event/:${TableFields.ID}`)
.asDELETE(CalendarController.deleteEvent)
.useAdminAuth()
.build()

.getRouter()
module.exports = router;
const API = require("../utils/apiBuilder");
const AuthController = require('../controllers/admin/AuthController');
const ClientController = require('../controllers/admin/ClientController');
const DocumentController = require('../controllers/admin/DocumentController')
const ServiceController = require('../controllers/admin/ServiceController');
const VATController = require('../controllers/admin/VATController');
const InvoiceController = require('../controllers/admin/InvoiceController');
const AdminDashboardController = require('../controllers/admin/AdminDashboardController')
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


.addPath('/add-service')
.asPOST(ServiceController.addService)
.useAdminAuth()
.build()

// .addPath('/approve-vat-request')
// .asPOST(VATController.approveVATRequest)
// .build()


.addPath('/document-management')
.asGET(DocumentController.getAllDocuments)
.useAdminAuth()
.build()


.getRouter()
module.exports = router;
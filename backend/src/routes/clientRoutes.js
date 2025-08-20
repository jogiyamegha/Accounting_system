const API = require("../utils/apiBuilder");
const AuthController = require('../controllers/client/AuthController');
const ProfileController = require('../controllers/client/ProfileController');
const CompanyController = require('../controllers/client/CompanyController');
const { TableFields } = require("../utils/constants");
const DocumentController = require('../controllers/client/DocumentController');
const VATController = require('../controllers/client/VATController')
const PDFHandler = require('../middlewares/pdfHandler');
const router = API.configRoute("/client")

/**
 * 
 * Auth Routes
 * 
 */

.addPath('/client')
.asGET((req, res) => {
    res.json({
        success: true,
        user: req.user 
    });
})
.useClientAuth()
.build()

.addPath("/signup")
.asPOST(AuthController.signUp)
.build()

.addPath("/login")
.asPOST(AuthController.login)
.build()

.addPath("/logout")
.asPOST(AuthController.logout)
.useClientAuth()
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
 * Profile Routes
 * 
 */

.addPath('/profile')
.asGET(ProfileController.getFullClientProfile)
.useClientAuth()
.build()


.addPath("/client-profile")
.asPOST(ProfileController.setClientProfile)
.useClientAuth()
.build()

.addPath('/company-profile')
.asGET(CompanyController.getFullCompanyDetails)
.useClientAuth()
.build()

.addPath('/company-profile')
.asPOST(CompanyController.addCompany)
.useClientAuth()
.build()

.addPath('/document')
.asPOST(DocumentController.addDocument)
.userMiddlewares(PDFHandler.single([TableFields.document]))
.useClientAuth()
.build()

.addPath('/request-service')
.asPOST(VATController.addVatService)
// .useClientAuth()
.build()

.getRouter()
module.exports = router;
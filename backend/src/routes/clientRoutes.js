const API = require("../utils/apiBuilder");
const AuthController = require('../controllers/client/AuthController');
const ProfileController = require('../controllers/client/ProfileController');
const CompanyController = require('../controllers/client/CompanyController');
const { TableFields } = require("../utils/constants");
const router = API.configRoute("/client")

/**
 * 
 * Auth Routes
 * 
 */

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

.addPath("/client-profile")
.asPOST(ProfileController.setClientProfile)
.useClientAuth()
.build()

.addPath('/company-profile')
.asPOST(CompanyController.addCompany)
.useClientAuth()
.build()

.getRouter()
module.exports = router;
const API = require("../utils/apiBuilder");
const AuthController = require('../controllers/client/AuthController');
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


.getRouter()
module.exports = router;
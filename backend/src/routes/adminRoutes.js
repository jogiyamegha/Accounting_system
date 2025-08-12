const API = require("../utils/apiBuilder");
const AuthController = require('../controllers/admin/AuthController');
const ClientController = require('../controllers/admin/ClientController');
const { TableFields } = require("../utils/constants");
const router = API.configRoute("/admin")

/**
 * 
 * Auth Routes
 * 
 */

.addPath('/admin')
.asGET((req, res) => {
    res.json({
        success: true,
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



.addPath('/add-client')
.asPOST(ClientController.addClient)
.useAdminAuth()
.build()

.getRouter()
module.exports = router;
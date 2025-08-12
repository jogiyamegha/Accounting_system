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
        user: req.user // ✅ Matches what your middleware sets
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

.addPath('/forgotPassword')
.asPOST(AuthController.forgotPassword)
.useAdminAuth()
.build()
 
.addPath('/verify-otp')
.asPOST(AuthController.forgotPasswordCodeExists)
.useAdminAuth()
.build()
 
.addPath('/change-password')
.asPOST(AuthController.changePassword)
.useAdminAuth()
.build()

.addPath('/add-client')
.asPOST(ClientController.addClient)
.useAdminAuth()
.build()

.getRouter()
module.exports = router;
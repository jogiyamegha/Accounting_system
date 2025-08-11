const API = require("../utils/apiBuilder");
const AuthController = require('../controllers/admin/AuthController');
const { TableFields } = require("../utils/constants");
const router = API.configRoute("/admin")

/**
 * 
 * Auth Routes
 * 
 */
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


.getRouter()
module.exports = router;
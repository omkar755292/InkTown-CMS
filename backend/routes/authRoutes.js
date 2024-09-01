// routes/authRoutes.js
const express = require( 'express' );
const { viewAllUsers, SuperAdminLogin, userRegister, userLogin, SuperAdminRegister } = require( '../controllers/authController' );
const authMiddleware = require( '../middlewares/authMiddleware' );

const router = express.Router();

router.post( 'user/auth/register', userRegister );
router.post( 'user/auth/login', userLogin );
router.post( '/superadmin/login', SuperAdminLogin );
router.post( '/superadmin/register', SuperAdminRegister );
router.get( '/users', viewAllUsers );


module.exports = router;

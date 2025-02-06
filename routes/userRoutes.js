const express = require('express');
const router = express.Router();

const { requestOTP ,verifySignup,verifyToken,login,requestResetPassword,resetPassword} = require('../controllers/userControllers'); 

//otp getting route
router.post("/req-otp", requestOTP); 
//signup route
router.post("/req-signup", verifySignup);
//logged verification route
router.post("/req-verify-token", verifyToken);
//login route
router.post("/req-login", login);
//request to reset password link's route
router.post("/req-reset-password", requestResetPassword);
//request to set new password 
router.post("/req-new-password/:id", resetPassword);

module.exports = router;  // Ensure this line is included to export the router

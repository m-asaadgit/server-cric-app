const express = require('express');
const router = express.Router();

const { requestOTP,adminVerificationForEvent,adminVerificationForMatch ,verifySignup,verifyToken,login,requestResetPassword,resetPassword, getUserDetails} = require('../controllers/userControllers'); 

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
router.get("/req-user-data/:token", getUserDetails);
router.get("/verify-event-updater/:eventId", adminVerificationForEvent);
router.get("/verify-match-updater/:matchId", adminVerificationForMatch);

module.exports = router;  // Ensure this line is included to export the router

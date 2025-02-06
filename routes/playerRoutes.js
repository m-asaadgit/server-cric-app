const express = require('express');
const router = express.Router();

const {createPlayer,updateTotalStats} =require("../controllers/playerController")

router.post("/",createPlayer)
router.put("/totalstats/:playerId",updateTotalStats)






module.exports = router;  // Ensure this line is included to export the router

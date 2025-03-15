const express = require("express");
const router = express.Router();
const {getAllNonlistedMatchesDetail,getNonlistedMatchesDetailById}=require("../controllers/clientSideController")

router.get("/",getAllNonlistedMatchesDetail)
router.get("/:matchId",getNonlistedMatchesDetailById)
module.exports = router;

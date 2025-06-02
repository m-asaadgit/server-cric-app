const express = require("express");
const router = express.Router();
const {
  getAllNonlistedMatchesDetail,
  getAllMatchesOfSeriesById,
  getNonlistedMatchesDetailById,
  getAllEvents,
  abc,

} = require("../controllers/clientSideController");

router.get("/", getAllNonlistedMatchesDetail);
router.get("/all-events", getAllEvents);
router.get("/matches-of/:categoryId", getAllMatchesOfSeriesById);
router.get("/:matchId", getNonlistedMatchesDetailById);
// router.post("/kdmke", abc);

module.exports = router;

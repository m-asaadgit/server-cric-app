const express = require("express");
const {
  createMatch,
  getMatchDetailsById,
  updateMatchDetailsById,
  updateOpeners,
  ballToBallUpdate,
  newBatterAfterWicket,
  updateBowlerAfterOver,
} = require("../controllers/matchesController");
const { adminMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", adminMiddleware, createMatch);
router.put("/toss-winners/:matchId", adminMiddleware, updateMatchDetailsById);
router.put("/add-openers/:matchId", adminMiddleware, updateOpeners);
router.put(
  "/ball-to-ball-update/team-a/:matchId",
  adminMiddleware,
  ballToBallUpdate
);
router.put(
  "/new-batter/team-a/:matchId",
  adminMiddleware,
  newBatterAfterWicket
);
router.put(
  "/new-bowler/team-a/:matchId",
  adminMiddleware,
  updateBowlerAfterOver
);

router.get("/:matchId", getMatchDetailsById);
module.exports = router;

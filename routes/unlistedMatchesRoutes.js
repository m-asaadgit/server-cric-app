const express = require("express");
const {
  createMatch,
//   getMatchDetailsById,
  updateMatchDetailsById,
  updateOpeners,
  updateNewBowler,
  ballToBallUpdate,
  superOverCreation,
  superOverBallUpdate,
  newBatterAfterWicket,
  updateBowlerAfterOver,
//   newBatterAfterWicket,
//   updateBowlerAfterOver,
} = require("../controllers/UnlistedMatchController");
const { adminMiddleware, adminMiddlewareForMatchCreation } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", adminMiddlewareForMatchCreation, createMatch);
router.put("/toss-winners/:matchId", adminMiddleware, updateMatchDetailsById);

router.put("/add-openers/:matchId", adminMiddleware, updateOpeners);

router.put(
  "/ball-to-ball-update/:matchId",
  adminMiddleware,
  ballToBallUpdate
);

router.get(
  "/bowler-update/:matchId",
  adminMiddleware,
  updateNewBowler
);
router.put(
  "/new-batter/:matchId",
  adminMiddleware,
  newBatterAfterWicket
);
router.put(
  "/new-bowler/:matchId",
  adminMiddleware,
  updateBowlerAfterOver
);

// router.get("/:matchId", getMatchDetailsById);




// super Over routes
router.put(
  "/super-over-creation/:matchId",
  adminMiddleware,
  superOverCreation
);router.put(
  "/super-over-ball-update/:matchId",
  adminMiddleware,
  superOverBallUpdate
);

module.exports = router;

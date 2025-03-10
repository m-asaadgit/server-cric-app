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
//   newBatterAfterWicket,
//   updateBowlerAfterOver,
} = require("../controllers/UnlistedMatchController");
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

router.get(
  "/bowler-update/:matchId",
  adminMiddleware,
  updateNewBowler
);
// router.put(
//   "/new-batter/team-a/:matchId",
//   adminMiddleware,
//   newBatterAfterWicket
// );
// router.put(
//   "/new-bowler/team-a/:matchId",
//   adminMiddleware,
//   updateBowlerAfterOver
// );

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

const express = require("express");
const {
  createMatch,
  //   getMatchDetailsById,
  updateMatchDetailsAfterTossById,
  updateOpeners,
  updateNewBowler,
  ballToBallUpdateForFirstInning,
  superOverCreation,
  superOverBallUpdate,
  newBatterAfterWicket,
  updateBowlerAfterOver,
  createMatchForCategoried,
  ballToBallUpdateForSecondInning,
  nextBatterInSuperOver,
  updateOpenersForSuperOver,
  //   newBatterAfterWicket,
  //   updateBowlerAfterOver,
} = require("../controllers/UnlistedMatchController");
const {
  adminMiddleware,
  adminMiddlewareForMatchCreation,
} = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", adminMiddlewareForMatchCreation, createMatch);

router.post(
  "/categoried",
  adminMiddlewareForMatchCreation,
  createMatchForCategoried
);
router.put(
  "/toss-winners/:matchId",
  adminMiddleware,
  updateMatchDetailsAfterTossById
);

router.put("/add-openers/:matchId", adminMiddleware, updateOpeners);

router.put(
  "/ball-to-ball-update-first-inning/:matchId",
  adminMiddleware,
  ballToBallUpdateForFirstInning
);
router.put(
  "/ball-to-ball-update-second-inning/:matchId",
  adminMiddleware,
  ballToBallUpdateForSecondInning
);

router.put("/new-batter/:matchId", adminMiddleware, newBatterAfterWicket);
router.put("/new-bowler/:matchId", adminMiddleware, updateBowlerAfterOver);

// router.get("/:matchId", getMatchDetailsById);

// super Over routes
router.put(
  "/super-over-next-batter/:matchId",
  adminMiddleware,
  nextBatterInSuperOver
);
router.put(
  "/super-over-ball-update/:matchId",
  adminMiddleware,
  superOverBallUpdate
);
router.put(
  "/super-over-openers-update/:matchId",
  adminMiddleware,
  updateOpenersForSuperOver
);

module.exports = router;

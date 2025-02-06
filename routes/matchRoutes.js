const express = require("express");
const {
  createMatch,
  getMatchDetailsById,
  updateMatchDetailsById,
  updateOpeners,
} = require("../controllers/matchesController");
const { adminMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", adminMiddleware, createMatch);
router.put("/toss-winners/:matchId", adminMiddleware, updateMatchDetailsById);
router.put("/add-openers/:matchId", adminMiddleware, updateOpeners);

router.get("/:matchId", getMatchDetailsById);
module.exports = router;

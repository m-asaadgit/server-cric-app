const express = require("express");
const router = express.Router();
const {
  createSeriesOrTournament,
} = require("../controllers/tournamentAndSeriesController");
const {
  adminMiddlewareForMatchCreation,
} = require("../middlewares/authMiddleware");

router.post("/", adminMiddlewareForMatchCreation,createSeriesOrTournament);

module.exports = router;

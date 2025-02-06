const express = require('express');
const { createTeam, updateTeamPlayers, getTeamPlayers } = require('../controllers/teamsController');
const router = express.Router();




router.post("/",createTeam)
router.get("/",getTeamPlayers)
router.put("/:teamId",updateTeamPlayers)
module.exports = router
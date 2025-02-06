const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  gender: { type: String, enum:["Male","Female"],required: true},
  DOB: { type: Date, required: true},
  lastName: { type: String, required: true },
  email: { type: String, required: true},
  battingStyle: {
    type: String,
    enum: ["Right arm Batsman", "Left arm Batsman"],
    required: true,
  },
  role: {
    type: String,
    enum: ["Batter", "Bowler", "Wicketkeeper-Batter",,"All-rounder"],
    required: true,
  },
  BowlingStyle: {
    type: String,
    enum: [
      "Right arm fast",
      "Left arm fast",
      "Right arm spin",
      "Left arm spin",
      "Right arm medium fast",
      "Right arm medium",
      "Left arm medium fast",
      "Left arm medium",
    ],
    required: true,
  },
  teamsPlayed: [
    {
      teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teams",
        required: true,
      },
      teamName: { type: String, default: null, required: true },
    },
  ],
  Stats: {
    totalruns: { type: Number, default: 0 },
    totalBallsFaced: { type: Number, default: 0 },
    totalFours: { type: Number, default: 0 },
    totalSixes: { type: Number, default: 0 },
    totalWides: { type: Number, default: 0},
    totalNoBalls: { type: Number, default: 0},
    totalByes: { type: Number, default: 0},
    highestScore: { type: Number, default: 0 },
    totalWickets: { type: Number, default: 0 },
    totalCenturies: { type: Number, default: 0 },
    totalHalfCenturies: { type: Number, default: 0 },
    totalBallsBowled: { type: Number, default: 0 },
    totalCatches: { type: Number, default: 0 },
    totalSixConceded: { type: Number, default: 0 },
    totalFourConceded: { type: Number, default: 0 },
    totalRunsConceded: { type: Number, default: 0 },
  },
  StatsPerMatch: [
    {
      matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Matches",
      },
      runs: { type: Number, default: 0 },
      ballsFaced: { type: Number, default: 0 },
      fours: { type: Number, default: 0 },
      sixes: { type: Number, default: 0 },
      runOuts: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      noballs: { type: Number, default: 0 },
      byes: { type: Number, default: 0 },
      wides: { type: Number, default: 0 },
      ballsBowled: { type: Number, default: 0 },
      catches: { type: Number, default: 0 },
      sixConceded: { type: Number, default: 0 },
      fourConceded: { type: Number, default: 0 },
      runConceded: { type: Number, default: 0 },
    },
  ],
},{
  timestamps: true,
});

module.exports = mongoose.model("Players", playerSchema);

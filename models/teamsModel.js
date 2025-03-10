const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    matchesStats: {
      matchesPlayed: { type: Number, default: 0 },
      matchesWon: { type: Number, default: 0 },
      matchesLost: { type: Number, default: 0 },
      matchesDraw: { type: Number, default: 0 },
      totalRunsScored: { type: Number, default: 0 },
      totalRunsConcided: { type: Number, default: 0 },
      totalWickets: { type: Number, default: 0 },
      highestScore: { type: Number, default: 0 },
    },
    players: [
      {
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Players" },
        playerName: { type: String },
      },
    ], // List of player names
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teams", teamSchema);

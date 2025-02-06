const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    players: [{ 
        playerId: { type: mongoose.Schema.Types.ObjectId,ref:"Players"},
        playerName: { type: String  },
    }], // List of player names
}, { timestamps: true });

module.exports = mongoose.model("Teams", teamSchema);

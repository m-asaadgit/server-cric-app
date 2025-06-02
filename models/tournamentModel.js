const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    isCompleted: { type: Boolean, required: false },
    winner: { type: String,  },
    runner: { type: String,  },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type:{type: String, default: "Tournament"}
   
}, { timestamps: true });

module.exports = mongoose.model("Tournament", tournamentSchema);

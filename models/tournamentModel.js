const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String},
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Matches" }],
}, { timestamps: true });

module.exports = mongoose.model("Tournament", tournamentSchema);

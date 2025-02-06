const mongoose = require("mongoose");

const seriesSchema = new mongoose.Schema({
    name: { type: String, required: true },
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Match" }],
}, { timestamps: true });

module.exports = mongoose.model("Series", seriesSchema);

const mongoose = require("mongoose");

const seriesSchema = new mongoose.Schema({
    name: { type: String, required: true },
    isCompleted: { type: Boolean, required: false },
    winner: { type: String,  },
    runner: { type: String,  },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type:{type: String, default: "Series"}

  
}, { timestamps: true });


module.exports = mongoose.model("Series", seriesSchema);

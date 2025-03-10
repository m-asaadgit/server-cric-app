const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    matchsHosted: [{ type: mongoose.Schema.Types.ObjectId, ref: "Matches" }],
    tournamentHosted: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
    }],
    seriesHosted: [{ type: mongoose.Schema.Types.ObjectId, ref: "Series" }],
  },

  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if password is modified

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, isAdmin: this.isAdmin },
    process.env.JWT_SECRET, // Replace with your actual secret key
    { expiresIn: "20d" } // Token expiry time
  );
};

module.exports = mongoose.model("User", userSchema);

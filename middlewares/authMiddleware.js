const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const unlistedMatches = require("../models/NonListingMatchModel");

// Auth Middleware
const authMiddleware = (req, res, next) => {
  // Get the token from the 'Authorization' header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store user info from token
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid token" });
  }
};
const adminMiddleware = async (req, res, next) => {
  // Get the token from the 'Authorization' header
  const token = req.header("Authorization")?.replace("Bearer ", "");
  const { matchId } = req.params;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check if user is registered and if they have admin privileges
    const isRegistered = await User.findById(decoded.id);
    const unlistedMatchDetails = await unlistedMatches
      .findById(matchId)
      .select("hostDetail");

    if (!isRegistered) {
      return res
        .status(400)
        .json({ message: "User not registered", decoded: decoded });
    }

    if (!isRegistered.isAdmin) {
      return res.status(403).json({ message: "You are not an admin" });
    }
    if (decoded.id != unlistedMatchDetails.hostDetail) {
      return res
        .status(400)
        .json({
          message: "You are not allowed to update this match ScoreCard",
        });
    }
    req.user = decoded; // Store user info from token

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error in adminMiddleware:", error); // Log error for debugging purposes
    return res.status(400).json({ message: "Invalid token or server error" });
  }
};
const adminMiddlewareForMatchCreation = async (req, res, next) => {
  // Get the token from the 'Authorization' header
  const token = req.header("Authorization")?.replace("Bearer ", "");
  const { matchId } = req.params;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check if user is registered and if they have admin privileges
    const isRegistered = await User.findById(decoded.id);
    const unlistedMatchDetails = await unlistedMatches
      .findById(matchId)
      .select("hostDetail");

    if (!isRegistered) {
      return res
        .status(400)
        .json({ message: "User not registered", decoded: decoded });
    }

    if (!isRegistered.isAdmin) {
      return res.status(403).json({ message: "You are not an admin" });
    }

    req.user = decoded; // Store user info from token

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error in adminMiddleware:", error); // Log error for debugging purposes
    return res.status(400).json({ message: "Invalid token or server error" });
  }
};

module.exports = {
  adminMiddleware,
  authMiddleware,
  adminMiddlewareForMatchCreation,
};

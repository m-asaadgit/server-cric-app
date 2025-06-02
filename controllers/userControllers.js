const User = require("../models/userModel");
const Blacklist = require("../models/blacklistModel");
const UnlistedMatches = require("../models/NonListingMatchModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const series = require("../models/seriesModel");
const tournament = require("../models/tournamentModel");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

// Generate OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Signup
const otpCache = new Map(); // Temporary in-memory storage for simplicity

exports.requestOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    // Save OTP and expiry in memory (use Redis or database for production)
    otpCache.set(email, { otp, otpExpiry });

    // Send OTP email
    await transporter.sendMail({
      to: email,
      subject: "Verify Your Email",
      html: `
          <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f3f4f6; padding: 20px;">
            <div style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 600px; margin: 0 auto;">
              <h1 style="color: #1F2937; font-size: 24px; font-weight: bold;">Verify Your Email</h1>
              <p style="color: #4B5563; font-size: 16px; line-height: 1.5;">Your OTP is <strong style="color: #10B981;">${otp}</strong>. It is valid for 10 minutes.</p>
              <p style="margin-top: 20px; font-size: 14px; color: #6B7280;">If you didn't request this, please ignore this email.</p>
              
            </div>
          </div>
        `,
    });

    res.status(200).json({
      message: "OTP sent to your email. Verify to complete registration.",
      otp: otp,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};

exports.verifySignup = async (req, res) => {
  const { name, email, password, otp } = req.body;

  try {
    // Check if the OTP exists and has not expired
    const otpData = otpCache.get(email);
    if (!otpData || otpData.otp !== otp || otpData.otpExpiry < Date.now()) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP", success: false });
    }

    // OTP is valid, create the user

    const newUser = new User({
      name,
      email,
      password,
      isAdmin: false,
      matchesHost: 0,
      MatchsId: [],
    });
    await newUser.save();
    const token = newUser.generateAuthToken();
    // Remove OTP from memory (cleanup)
    otpCache.delete(email);

    // Generate JWT token

    // Send response with token
    res.status(201).json({
      message: "User registered successfully.",
      success: true,
      token: token, // Send token in the response
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
      success: false,
    });
  }
};

// Token verification and user email check
exports.verifyToken = async (req, res) => {
  const token = req.body.token; // Token sent from the client

  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Token is required" });
  }

  try {
    // Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the email exists in the Users collection
    const user = await User.findOne({ email: decoded.email }).select(
      "-password -email -isVerified "
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    console.log(user);
    // Token and user verified
    return res.status(200).json({
      success: true,
      message: "Token is verified",
      user: { _id: user._id, email: user.email },
      decoded,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: err,
    });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email " });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid password" });

    const token = user.generateAuthToken();
    res.status(200).json({ token, message: "Logged in successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};

// 1. Request Password Reset
exports.requestResetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Invalid email" });

    // Generate a reset token (valid for 15 minutes)
    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    // Send reset link via email
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset",
      html: `<div style="background-color: #f3f4f6; padding: 20px; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 20px;">
    <h2 style="text-align: center; color: #1f2937; font-size: 24px; margin-bottom: 16px;">Password Reset Request</h2>
    <p style="text-align: center; color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
      We received a request to reset your password. Click the button below to proceed. This link is valid for 15 minutes.
    </p>
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${resetLink}"
         style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); transition: background-color 0.3s ease;">
        Reset Your Password
      </a>
    </div>
    <p style="text-align: center; color: #9ca3af; font-size: 14px; line-height: 1.5;">
      If you didn’t request this, you can safely ignore this email.
    </p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="text-align: center; color: #d1d5db; font-size: 12px;">
      © 2025 Your Company. All rights reserved.
    </p>
  </div>
</div>

`,
    });

    res
      .status(200)
      .json({ message: "Password reset email sent.", token: resetToken });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { id } = req.params; // Extract token from URL

  // Debugging logs

  if (!id) {
    return res.status(400).json({ message: "can't change password" });
  }
  const expiredToken = await Blacklist.findOne({ token: id });
  if (expiredToken) {
    return res.status(400).json({ message: "Link expired" });
  }

  try {
    const decoded = jwt.verify(id, process.env.JWT_SECRET); // Verify the token

    const user = await User.findById(decoded.id); // Find user by decoded ID
    if (!user) return res.status(404).json({ message: "Invalid request" });

    // Uncomment this when accepting newPassword in req.body
    const { newPassword } = req.body;
    // const hashedPassword = await bcrypt.hash(newPassword, 12); // Hash the new password
    user.password = newPassword;
    await user.save();
    await Blacklist.create({ token: id });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      message: "time has expired",
      error: error.message,
    });
  }
};

exports.getUserDetails = async (req, res) => {
  const { token } = req.params;

  try {
    // Verify the JWT token and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and exclude sensitive fields
    const isUserExist = await User.findById(decoded.id).select(
      "-password -updatedAt -createdAt"
    );

    if (!isUserExist) {
      return res
        .status(401)
        .json({ message: "User does not exist", success: false });
    }

    // Fetch matches hosted by the user
    const matchesHosted = await Promise.all([
      series.find({ hostId: isUserExist._id }).select("_id name type"),
      tournament.find({ hostId: isUserExist._id }).select("_id name type"),
    ]);

    const combinedMatches = [...matchesHosted[0], ...matchesHosted[1]];

    return res.status(200).json({
      message: "Token verified successfully",
      success: true,
      userId: isUserExist.id,
      userName: isUserExist.name,
      isAdmin: isUserExist.isAdmin,
      hostedTournamentsAndSeries: combinedMatches,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
      success: false,
      error: error.message,
    });
  }
};

exports.adminVerificationForEvent = async (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  const { eventId } = req.params;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user exists and has admin privileges
    const isRegistered = await User.findById(decoded.id);
    if (!isRegistered) {
      return res.status(400).json({ message: "User not registered", decoded });
    }
    if (!isRegistered.isAdmin) {
      return res.status(403).json({ message: "You are not an admin" });
    }

    // Fetch match details from tournament or series
    const unlistedMatchDetails =
      (await tournament.findById(eventId).select("hostId")) ??
      (await series.findById(eventId).select("hostId"));

    // Check if match details exist
    if (!unlistedMatchDetails) {
      return res.status(404).json({ message: "Match not found" });
    }
    console.log(decoded.id, unlistedMatchDetails.hostId);

    // Check if the user is authorized to update the match
    if (decoded.id != unlistedMatchDetails.hostId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this match ScoreCard",
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in adminMiddleware:", error);
    return res
      .status(400)
      .json({ success: false, message: "Invalid token or server error" });
  }
};
exports.adminVerificationForMatch = async (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  const { matchId } = req.params;

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user exists and has admin privileges
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: "User not registered" });
    }
    if (!user.isAdmin) {
      return res.status(403).json({ message: "You are not an admin" });
    }

    // Fetch match details
    const matchData = await UnlistedMatches.findById(matchId);

    // Check if match exists
    if (!matchData) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Check if the user is authorized to update the match
    if (decoded.id !== matchData.hostDetail.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this match ScoreCard",
      });
    }

    return res.status(200).json({ success: true,matchData:matchData });
  } catch (error) {
    console.error("Error in adminVerificationForMatch:", error);
    return res.status(400).json({ success: false, message: "Invalid token or server error" });
  }
};

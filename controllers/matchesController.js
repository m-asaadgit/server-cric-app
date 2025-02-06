// const Matches = require("../models/matchesModel");
// const User = require("../models/userModel");

// exports.createMatch = async (req, res) => {
//   const { userId } = req.user;
//   const { aTeamId, aTeamName, bTeamId, bTeamName, overs } = req.body;

//   try {
//     const matchDetail = await Matches.create({
//       hostDetail: userId,

//       teams: [
//         {
//           teamId: aTeamId,
//           teamName: aTeamName,
//         },
//         {
//           teamId: bTeamId,
//           teamName: bTeamName,
//         },
//       ],
//       overs: overs,
//     });
//     const userDataUpdate = await User.findByIdAndUpdate(
//       { _id: userId },
//       {
//         matchRoutes:matchRoutes+1,
//         $push: {
//           matchesHosted: matchDetail._id,
//         },
//       }
//     );
//   } catch (error) {}
// };
const Matches = require("../models/matchesModel");
const User = require("../models/userModel");

exports.createMatch = async (req, res) => {
  const { id } = req.user;
  const { aTeamId, aTeamName, bTeamId, bTeamName, overs, timing } = req.body;

  try {
    const aTeamInning = [];
    const bTeamInning = [];

    for (let i = 1; i <= overs; i++) {
      // Add an object for each over for aTeamInning
      aTeamInning.push({
        overNumber: {
          overNumber: i,
        },
        overCompleted: "pending",
        balls: [], // Initialize balls as an empty array
      });

      // Add an object for each over for bTeamInning
      bTeamInning.push({
        overNumber: {
          overNumber: i,
        },
        overCompleted: "pending",
        balls: [], // Initialize balls as an empty array
      });
    }

    // Create match
    const matchDetail = await Matches.create({
      hostDetail: id,
      teams: [
        { teamId: aTeamId, teamName: aTeamName },
        { teamId: bTeamId, teamName: bTeamName },
      ],
      overs: overs,
      timing: timing,
      aTeamInning,
      bTeamInning,
    });

    // Fetch user data to get current matchRoutes count
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user data
    await User.findByIdAndUpdate(id, {
      $push: { matchsHosted: matchDetail._id },
    });

    // Return success response
    res.status(201).json({
      message: "Match created successfully",
      matchDetail,
      aTeamInning,
      bTeamInning,
    });
  } catch (error) {
    console.error("Error creating match:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// updates toss winner ,
exports.updateMatchDetailsById = async (req, res) => {
  const { matchId } = req.params;
  const {
    tossWinnerTeamId,
    tossLoserTeamId,
    tossWinnerTeamName,
    tossLooserTeamName,
    tossDecision,
  } = req.body;
  let { aTeamPlayers, bTeamPlayers } = req.body;

  // Adjust these initializations based on your intended logic.
  // For example, if toss winner is always the first team unless swapped:
  let aTeamId = tossWinnerTeamId;
  let aTeamName = tossWinnerTeamName;
  let bTeamId = tossLoserTeamId;
  let bTeamName = tossLooserTeamName;

  try {
    if (tossDecision === "bowlFirst") {
      // Swap team players
      [aTeamPlayers, bTeamPlayers] = [bTeamPlayers, aTeamPlayers];

      // Swap team IDs
      [aTeamId, bTeamId] = [bTeamId, aTeamId];

      // Swap team names
      [aTeamName, bTeamName] = [bTeamName, aTeamName];
    }

    const updateThisData = await Matches.findByIdAndUpdate(
      matchId,
      {
        "tossWinner.teamId": tossWinnerTeamId,
        "tossWinner.teamName": tossWinnerTeamName,
        "tossWinner.elected": tossDecision,
        aTeamPlayers,
        bTeamPlayers,
        "aTeambattingStats.teamId": aTeamId,
        "aTeambattingStats.teamName": aTeamName,
        "bTeambattingStats.teamId": bTeamId,
        "bTeambattingStats.teamName": bTeamName,
        "aTeamBowlerStats.teamId": bTeamId,
        "aTeamBowlerStats.teamName": bTeamName,
        "bTeamBowlerStats.teamId": aTeamId,
        "bTeamBowlerStats.teamName": aTeamName,
        status: "In Progress",
      },
      { new: true } // Returns the updated document
    );

    if (!updateThisData) {
      return res.status(404).json({ message: "Match not found" });
    }

    res
      .status(200)
      .json({ message: "Match updated successfully", match: updateThisData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// exports.updateMatchDetailsById = async (req, res) => {
//   const { matchId } = req.params;
//   const {
//     tossWinnerTeamId,
//     tossLoserTeamId,
//     tossWinnerTeamName,
//     tossLooserTeamName,
//     tossDecision,
//   } = req.body;
//   let { aTeamPlayers, bTeamPlayers } = req.body;
//   var aTeamId = tossLoserTeamId;
//   var aTeamName = tossWinnerTeamName;
//   var bTeamId = tossLoserTeamId;
//   var bTeamName = tossLooserTeamName;
//   try {
//     if (tossDecision == "bowlFirst") {
//       [aTeamPlayers, bTeamPlayers] = [bTeamPlayers, aTeamPlayers];

//       [aTeamId, bTeamId] = [bTeamId, aTeamId];
//       [aTeamName, bTeamName] = [bTeamName, aTeamName];
//     }
//     const updateThisData = await Matches.findByIdAndUpdate(
//       matchId,
//       {
//         "tossWinner.teamId": tossWinnerTeamId,
//         // "tossWinner.teamId": tossWinnerTeamId,
//         // "tossWinner.teamId": tossLoserTeamId,
//         "tossWinner.teamName": tossWinnerTeamName,
//         "tossWinner.elected": tossDecision,
//         aTeamPlayers: aTeamPlayers,
//         bTeamPlayers: bTeamPlayers,
//       },
//       { new: true } // Returns the updated document
//     );

//     if (!updateThisData) {
//       return res.status(404).json({ message: "Match not found" });
//     }

//     res
//       .status(200)
//       .json({ message: "Match updated successfully", match: updateThisData });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// };

exports.updateOpeners = async (req, res) => {
  const { matchId } = req.params;
  const {
    batter1Name,
    batter1Id,
    batter2Name,
    batter2Id,
    bowlerName,
    bowlerId,
  } = req.body;

  try {
    const updatedMatch = await Matches.findByIdAndUpdate(
      matchId,
      {
        "aTeamInning.0.overNumber.bowlerName": bowlerName,
        "aTeamInning.0.overNumber.bowlerId": bowlerId,
        "aTeambattingStats.aTeamplayerStats.0.playerId": batter1Id,
        "aTeambattingStats.aTeamplayerStats.0.playerName": batter1Name,
        "aTeambattingStats.aTeamplayerStats.0.isStrike": true,
        "aTeambattingStats.aTeamplayerStats.1.playerId": batter2Id,
        "aTeambattingStats.aTeamplayerStats.1.playerName": batter2Name,
        "aTeambattingStats.aTeamplayerStats.1.isStrike": false,
      },
      { new: true } // This option returns the updated document
    );

    // Check if a match was found and updated
    if (!updatedMatch) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.status(200).json({
      message: "Openers updated successfully",
      match: updatedMatch,
    });
  } catch (error) {
    console.error("Error updating openers:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// exports.updateOpeners = async (req, res) => {
//   const { matchId } = req.params;
//   const { batter1Name, batter1Id, batter2Name, batter2Id, bowlerName, bowlerId } = req.body;

//   try {
//     const updatedMatch = await Matches.findByIdAndUpdate(
//       matchId,
//       {
//         $set: {
//           "aTeamInning.0.overNumber.bowlerName": bowlerName,
//           "aTeamInning.0.overNumber.bowlerId": bowlerId,
//           "aTeambattingStats.aTeamplayerStats.$[batter1].playerId": batter1Id,
//           "aTeambattingStats.aTeamplayerStats.$[batter1].playerName": batter1Name,
//           "aTeambattingStats.aTeamplayerStats.$[batter1].isStrike": true,
//           "aTeambattingStats.aTeamplayerStats.$[batter2].playerId": batter2Id,
//           "aTeambattingStats.aTeamplayerStats.$[batter2].playerName": batter2Name,
//           "aTeambattingStats.aTeamplayerStats.$[batter2].isStrike": false,
//         },
//       },
//       {
//         new: true, // Return the updated document
//         arrayFilters: [
//           { "batter1.playerId": { $exists: true } }, // Match existing batter 1
//           { "batter2.playerId": { $exists: true } }, // Match existing batter 2
//         ],
//       }
//     );

//     if (!updatedMatch) {
//       return res.status(404).json({ message: "Match not found"});
//     }

//     res.status(200).json({
//       message: "Openers updated successfully",
//       match: updatedMatch,
//       batter1Name:batter1Id
//     });
//   } catch (error) {
//     console.error("Error updating openers:", error);
//     res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };

// players,status
// exports.updateMatchDetails=async (req,res)=>{
//   const { id } = req.user;
//   const { matchId, tossWinner,  tossDecision, aTeamPlayers, bTeamPlayers } = req.body;

//   try {
//     const aTeamStarting11

//   } catch (error) {

//   }

// }

exports.getMatchDetailsById = async (req, res) => {
  try {
    const { matchId } = req.params;
    const matchDetails = await Matches.findById(matchId);
    if (!matchDetails) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.json({ message: "Match details fetched successfully", matchDetails });
  } catch (error) {}
};

exports.postTossDataUpdate = async (req, res) => {
  const { matchId } = req.params;
  const { tossWinner, tossDecision } = req.body;
};

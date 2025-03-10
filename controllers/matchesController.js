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
        "aTeambattingStats.aTeamplayerStats.0.methodOfDismissal": "Not out",
        "aTeambattingStats.aTeamplayerStats.1.playerId": batter2Id,
        "aTeambattingStats.aTeamplayerStats.1.playerName": batter2Name,
        "aTeambattingStats.aTeamplayerStats.1.methodOfDismissal": "Not out",
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
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.ballToBallUpdate = async (req, res) => {
  const { matchId } = req.params;
  let {
    ballNumber,
    batterName,
    batterId,
    runs,
    dot,
    single,
    double,
    triple,
    four,
    six,
    wide,
    extra,
    bye,
    no_ball,
    nonextraRuns,
    caption,
    wicket,
    dismissalType,
    // aTeam,
    // bTeam,
    // bowlerName,
    // bowlerId,
  } = req.body;
  let ballFacedByBatter = 0;
  if (wide && no_ball) {
    ballFacedByBatter = 1;
  }

  const matchDetails = await Matches.findById(matchId);
  const overIndex = matchDetails.aTeamInning.filter(
    (data) => data.overCompleted == "completed"
  ).length;
  let inningComplition = overIndex;

  if (overIndex == matchDetails.overs) {
    return res
      .status(500)
      .send({ success: false, message: "inning completed" });
  }
  const overUpdate = matchDetails.aTeamInning[overIndex].balls.filter(
    (data) => data.extras == false
  ).length;

  // const IndexCount = Math.floor(ballNumber / 6);
  try {
    const matchDetails = await Matches.findByIdAndUpdate(
      matchId,
      {
        $push: {
          [`aTeamInning.${overIndex}.balls`]: {
            ballNumber: 1,
            batsmanName: batterName,
            batsmanId: batterId,
            runs: runs,
            dot: dot,
            single: single,
            double: double,
            triple: triple,
            four: four,
            six: six,
            extras: extra,
            caption: caption,
            isWicket: wicket,
            dismissalType: dismissalType,
          },
        },
        $inc: {
          "aTeamExtras.byes": bye,
          "aTeamExtras.wides": wide,
          "aTeamExtras.noBalls": no_ball,
        },
        $inc: {
          "aTeambattingStats.aTeambattingStats.$[player].runs": nonextraRuns,
          "aTeambattingStats.aTeambattingStats.$[player].ballsFaced":
            ballFacedByBatter,
          "aTeambattingStats.aTeambattingStats.$[player].fours": four ? 1 : 0,
          "aTeambattingStats.aTeambattingStats.$[player].sixes": six ? 1 : 0,
          "aTeambattingStats.aTeambattingStats.$[player].singles": single
            ? 1
            : 0,
          "aTeambattingStats.aTeambattingStats.$[player].doubles": double
            ? 1
            : 0,
          "aTeambattingStats.aTeambattingStats.$[player].triples": triple
            ? 1
            : 0,
        },
      },
      {
        arrayFilters: [{ "player.playerId": batterId }],
        new: true,
      }
    );
    if (wicket) {
      const matchDetailToUpdateWicketFallen = await Matches.findByIdAndUpdate(
        matchId,
        {
          $set: {
            "aTeamPlayers.$[player].isOut": true,
            "aTeamPlayers.$[player].methodOfDismissal": dismissalType,
            "aTeambattingStats.aTeambattingStats.$[batter].isOut": true,
            "aTeambattingStats.aTeambattingStats.$[batter].methodOfDismissal":
              dismissalType,
          },
        },
        {
          arrayFilters: [
            { "player.playerId": batterId },
            { "batter.playerId": batterId },
          ],
          new: true,
        }
      );
    }

    const overUpdateAfterUpation = matchDetails.aTeamInning[
      overIndex
    ].balls.filter((data) => data.extras == false).length;

    if (overUpdateAfterUpation >= 6) {
      const overCompleted = await Matches.findByIdAndUpdate(matchId, {
        $set: {
          [`aTeamInning.${overIndex}.overCompleted`]: "completed",
        },
      });
      inningComplition += 1;
    } else {
      return res.status(200).json({
        inningComplition: false,
        matchDetails: matchDetails.aTeamInning,
        overIndex,
        overUpdate,
        overUpdateAfterUpation,
      });
    }

    if (inningComplition == matchDetails.overs) {
      return res.status(200).json({
        inningComplition: true,
        data: matchDetails,
        overUpdate: overUpdate,
        sd: matchDetails.overs,
      });
    }

    return res.json({
      inningComplition: false,
      data: matchDetails,
      overUpdate: overUpdate,
      sd: matchDetails.overs,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update ball details" });
  }
};

exports.updateBowlerAfterOver = async (req, res) => {
  const { matchId } = req.params;
  const { bowlerId, bowlerName } = req.body;

  try {
    const matchDetail = await Matches.findById(matchId);
    if (!matchDetail) {
      return res
        .status(404)
        .json({ message: "Match not found", success: false });
    }
    const overFinished = matchDetail.aTeamInning.filter(
      (data) => data.overCompleted == "completed"
    ).length;
    const updateField = {};
    updateField[`aTeamInning.${overFinished}.overNumber.bowlerId`] =
      bowlerId;
    updateField[`aTeamInning.${overFinished}.overNumber.bowlerName`] =
      bowlerName;
    const updatedDetails = await Matches.findByIdAndUpdate(matchDetail, {
      $set: updateField,
    });
    return res.status(200).json({
      message: updatedDetails,
      success: true,
      matchdetail: matchDetail,
    });
  } catch (error) {
    return res.status(500).json({ message: error, success: false });
  }
};

exports.newBatterAfterWicket = async (req, res) => {
  const { playerId, playerName } = req.body;
  const { matchId } = req.params;

  try {
    const matchDetails = await Matches.findById(matchId);

    // Check if match exists
    if (!matchDetails) {
      return res
        .status(404)
        .json({ message: "Match not found", success: false });
    }

    // Ensure aTeambattingStats exists
    if (
      !matchDetails.aTeambattingStats ||
      !Array.isArray(matchDetails.aTeambattingStats.aTeambattingStats)
    ) {
      return res
        .status(400)
        .json({ message: "Batting stats not found", success: false });
    }

    // Count the number of out or retired hurt players
    const indexCount = matchDetails.aTeambattingStats.aTeambattingStats.filter(
      (player) => player?.isOut || player?.methodOfDismissal === "retired hurt"
    ).length;

    // Prepare update fields using computed property names
    const updateField = {};
    updateField[
      `aTeambattingStats.aTeambattingStats.${indexCount + 1}.playerId`
    ] = playerId;
    updateField[
      `aTeambattingStats.aTeambattingStats.${indexCount + 1}.playerName`
    ] = playerName;
    updateField[
      `aTeambattingStats.aTeambattingStats.${indexCount + 1}.methodOfDismissal`
    ] = "Not out";

    // Update the match document
    const updatedMatch = await Matches.findByIdAndUpdate(
      matchId,
      { $set: updateField },
      { new: true }
    );

    if (!updatedMatch) {
      return res
        .status(404)
        .json({ message: "Failed to update match", success: false });
    }

    return res.status(200).json({ matchDetails: updatedMatch, success: true });
  } catch (error) {
    console.error("Error updating new batter:", error);
    res
      .status(500)
      .json({ message: "Failed to update ball details", success: false });
  }
};

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

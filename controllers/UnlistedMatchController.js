const { isAllOf } = require("@reduxjs/toolkit");
const Matches = require("../models/NonListingMatchModel");
const User = require("../models/userModel");

exports.createMatch = async (req, res) => {
  const { id } = req.user;
  const { aTeamName, bTeamName, overs, timing } = req.body;

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
      teamAName: aTeamName,
      teamBName: bTeamName,

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
  const { tossWinnerTeamName, tossLooserTeamName, tossDecision } = req.body;
  let { aTeamPlayers, bTeamPlayers } = req.body;

  // Adjust these initializations based on your intended logic.
  // For example, if toss winner is always the first team unless swapped:
  let aTeamName = tossWinnerTeamName;
  let bTeamName = tossLooserTeamName;

  try {
    if (tossDecision === "bowlFirst") {
      // Swap team players
      [aTeamPlayers, bTeamPlayers] = [bTeamPlayers, aTeamPlayers];

      // Swap team IDs

      // Swap team names
      [aTeamName, bTeamName] = [bTeamName, aTeamName];
    }

    const updateThisData = await Matches.findByIdAndUpdate(
      matchId,
      {
        "tossWinner.teamName": tossWinnerTeamName,
        "tossWinner.elected": tossDecision,
        aTeamPlayers,
        bTeamPlayers,
        "aTeambattingStats.teamName": aTeamName,
        "bTeambattingStats.teamName": bTeamName,
        "aTeamBowlerStats.teamName": bTeamName,
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
  const { batter1Name, batter2Name, bowlerName } = req.body;
  try {
    const updatedMatch = await Matches.findByIdAndUpdate(
      matchId,
      {
        "aTeamInning.0.overNumber.bowlerName": bowlerName,
        "aTeamBatterStats.aTeambattingStats.0.playerName": batter1Name,
        "aTeamBatterStats.aTeambattingStats.0.methodOfDismissal": "Not out",
        "aTeamBatterStats.aTeambattingStats.1.playerName": batter2Name,
        "aTeamBatterStats.aTeambattingStats.1.methodOfDismissal": "Not out",
      },
      { new: true } // This option returns the updated document
    );
    // Check if a match was found and updated
    if (!updatedMatch) {
      return res.status(404).json({ message: "Match not found" });
    }
    //   if (!d) {
    //   return res.status(404).json({ message: "Match not found"  });
    // }

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
exports.updateNewBowler = async (req, res) => {
  const { matchId } = req.params;
  const { bowlerName, firstInnning } = req.body;
  try {
    const matchDetailsToExtractData = await Matches.findById(matchId);

    const isPushed =
      matchDetailsToExtractData.bTeamBowlerStats.bTeamBowlingStats.filter(
        (player) => player.playerName == bowlerName
      );

    if (isPushed.length == 0) {
      const matchDetails = await Matches.findByIdAndUpdate(matchId, {
        $push: {
          "bTeamBowlerStats.bTeamBowlingStats": {
            playerName: bowlerName,
          },
        },
      });
    } else {
      return res.status(400).json({
        message: `${bowlerName} already exist `,
        data: isPushed,
        success: false,
      });
    }

    if (!matchDetailsToExtractData) {
      return res
        .status(404)
        .json({ message: "Match not found", error: error, success: false });
    }

    return res.status(201).json({
      message: `bowler name ${bowlerName} added succesfully`,

      success: true,
    });
  } catch (error) {
    return res
      .status(404)
      .json({ message: "cannot fetch data", success: false });
  }
};

exports.ballToBallUpdate = async (req, res) => {
  const { matchId } = req.params;
  let {
    firstInning,
    batterName,
    bowlerName,
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
  } = req.body;
  try {
    let inning = "aTeamInning";
    let battingStat = "aTeamBatterStats.aTeambattingStats";
    let bowlerStat = "bTeamBowlerStats.bTeamBowlingStats";
    let extras = "aTeamExtras";
    let player = "aTeamPlayers";

    if (firstInning == false) {
      inning = "bTeamInning";
      battingStat = "bTeambatterStats.bTeambattingStats";
      bowlerStat = "aTeamBowlerStats.aTeamBowlingStats";
      extras = "bTeamExtras";
      player = "bTeamPlayers";
    }

    const matchDetailsToExtractData = await Matches.findById(matchId);
    const overUpdatingIndex = matchDetailsToExtractData[inning].filter(
      (data) => data.overCompleted == "completed"
    ).length;
    let inningComplition = overUpdatingIndex;

    if (overUpdatingIndex >= matchDetailsToExtractData.overs) {
      return res
        .status(500)
        .send({ success: false, message: "inning completed" });
    }
    const ballUpdatingIndex = matchDetailsToExtractData[inning][
      overUpdatingIndex
    ].balls.filter((data) => data.extras == false).length;

    // const IndexCount = Math.floor(ballNumber / 6);
    const matchDetails = await Matches.findByIdAndUpdate(
      matchId,
      {
        $push: {
          [`${inning}.${overUpdatingIndex}.balls`]: {
            ballNumber: ballUpdatingIndex + 1,
            batsmanName: batterName,
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
          [`${extras}.byes`]: bye,
          [`${extras}.wides`]: wide ? 1 : 0,
          [`${extras}.noBalls`]: no_ball ? 1 : 0,

          [`${battingStat}.$[batter].runs`]: nonextraRuns,
          [`${battingStat}.$[batter].ballsFaced`]: wide || no_ball ? 0 : 1,
          [`${battingStat}.$[batter].fours`]: four ? 1 : 0,
          [`${battingStat}.$[batter].dot`]: dot ? 1 : 0,
          [`${battingStat}.$[batter].sixes`]: six ? 1 : 0,
          [`${battingStat}.$[batter].singles`]: single ? 1 : 0,
          [`${battingStat}.$[batter].doubles`]: double ? 1 : 0,
          [`${battingStat}.$[batter].triples`]: triple ? 1 : 0,

          [`${bowlerStat}.$[bowler].runsConceded`]: nonextraRuns,
          [`${bowlerStat}.$[bowler].noBalls`]: no_ball ? 1 : 0,
          [`${bowlerStat}.$[bowler].wides`]: wide ? 1 : 0,
        },
      },
      {
        arrayFilters: [
          { "batter.playerName": batterName },
          { "bowler.playerName": bowlerName },
        ],
        new: true,
      }
    );
    if (wicket) {
      // Base update query
      const updateQuery = {
        $set: {
          [`${battingStat}.$[batter].isOut`]: true,
          [`${battingStat}.$[batter].methodOfDismissal`]: dismissalType,
        },
      };

      // Only add bowler update if dismissalType !== "run out"
      let arrayFilters = [{ "batter.playerName": batterName }];

      if (dismissalType !== "run out") {
        updateQuery.$push = {
          [`${bowlerStat}.$[bowler].wickets`]: { batterName: batterName },
        };
        arrayFilters.push({ "bowler.playerName": bowlerName }); // Only include if needed
      }

      const matchDetailToUpdateWicketFallen = await Matches.findByIdAndUpdate(
        matchId,
        updateQuery,
        {
          arrayFilters,
          new: true,
        }
      );
    }

    const overUpdateAfterUpation = matchDetails.aTeamInning[
      overUpdatingIndex
    ].balls.filter((data) => data.extras == false).length;

    if (overUpdateAfterUpation >= 6) {
      const overCompleted = await Matches.findByIdAndUpdate(
        matchId,
        {
          $set: {
            [`${inning}.${overUpdatingIndex}.overCompleted`]: "completed",
          },
          $inc: {
            [`${bowlerStat}.$[bowler].oversBowled`]: 1,
          },
        },
        {
          arrayFilters: [
            {
              "bowler.playerName": bowlerName,
            },
          ],
          new: true,
        }
      );
      inningComplition += 1;
    }

    if (inningComplition == matchDetails.overs) {
      return res.status(200).json({
        inningComplition: true,
        data: matchDetails,
        sd: matchDetails.overs,
      });
    }
    if (extra == false && ballUpdatingIndex == 5) {
      return res.status(200).json({
        success: true,
        inningComplition: false,

        overcompletion: true,
        data: matchDetails,

        messege: "score updated",
      });
    }

    return res.json({
      inningComplition: false,
      data: matchDetails,
      ballUpdatingIndex,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: error, messege: "something went wrong" });
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
    updateField[`aTeamInning.${overFinished}.overNumber.bowlerId`] = bowlerId;
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

// super over controller
exports.superOverCreation = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { batter1, batter2, batter3, bowler, firstInning } = req.body;
    let inning = "bTeamSuperOverStat";
    if (!firstInning) {
      inning = "aTeamSuperOverStat";
    }

    const matchDetails = await Matches.findByIdAndUpdate(
      matchId,
      {
        $set: {
          [`${inning}.bowlerName`]: bowler,
          [`${inning}.batters`]: [
            { batsmanName: batter1 },
            { batsmanName: batter2 },
            { batsmanName: batter3 },
          ],
        },
      },
      { new: true, upsert: true } // upsert ensures it creates the field if missing
    );

    if (!matchDetails) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.status(200).json(matchDetails);
  } catch (error) {
    console.error("Error creating super over:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.superOverBallUpdate = async (req, res) => {
  try {
    const { matchId } = req.params;
    let {
      firstInning,
      batterName,
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
      caption,
      wicket,
      dismissalType,
    } = req.body;

    let inningUpdater = "bTeamSuperOverStat";
    let inningDefender = "aTeamSuperOverStat";
    let extras = "aTeamExtras";

    if (firstInning === false) {
      inningUpdater = "aTeamSuperOverStat";
      inningDefender = "bTeamSuperOverStat";

      extras = "bTeamExtras";
    }

    const matchDetailsToExtractData = await Matches.findById(matchId);

    const ballUpdatingIndex = matchDetailsToExtractData[inningUpdater].balls.filter(
      (data) => data.extras === false
    ).length;

    let nonextraRuns = runs - (bye + wide + no_ball); // Fixing undefined variable

    const matchDetails = await Matches.findByIdAndUpdate(
      matchId,
      {
        $push: {
          [`${inningUpdater}.balls`]: {
            ballNumber: ballUpdatingIndex + 1,
            batsmanName: batterName,
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
          [`${extras}.byes`]: bye,
          [`${extras}.wides`]: wide ? 1 : 0,
          [`${extras}.noBalls`]: no_ball ? 1 : 0,
          [`${inningUpdater}.runs`]: runs,
          [`${inningUpdater}.batters.$[batter].runs`]: nonextraRuns,
          [`${inningUpdater}.batters.$[batter].ballsFaced`]: wide || no_ball ? 0 : 1,
        },
      },
      {
        arrayFilters: [{ "batter.batsmanName": batterName }],
        new: true,
      }
    );

    if (wicket) {
      // Base update query

      // Only add bowler update if dismissalType !== "run out"

      const matchDetailToUpdateAfterWicketFallen =
        await Matches.findByIdAndUpdate(
          matchId,
          {
            $set: {
              [`${inningUpdater}.batters.$[batter].isOut`]: true,
            },
          },
          {
            arrayFilters: [{ "batter.batsmanName": batterName }],
            new: true,
          }
        );
      const isAllOut = matchDetailToUpdateAfterWicketFallen[
        inningUpdater
      ].batters.filter((batter) => batter.isOut >= 2);
      if (isAllOut) {
        return res.status(200).json({
          success: true,

          isAllOut: true,
          superOverInningComplition: true,
          messege: `super over inning    `,
          data: matchDetailToUpdateAfterWicketFallen,
        });
      } else {
        return res.status(200).json({
          success: true,

          isAllOut: false,
          superOverInningComplition: false,
          messege: `choose next batter `,
          data: matchDetailToUpdateAfterWicketFallen,
        });
      }
    }

    if (!extra && ballUpdatingIndex === 5) {
      if (firstInning===false) {
        if (matchDetails[inningDefender].runs == matchDetails[inningUpdater].runs) {
        console.log("hi")

          return res.status(200).json({
            success: true,
            matchResult: {
              draw: true,
              win: null,
              loss: null,
            },
            superOverInningComplition: true,
            messege: `super over inning completed `,
            data: matchDetails,
          });
        }
        if (matchDetails[inningDefender].runs < matchDetails[inningUpdater].runs) {
          return res.status(200).json({
            success: true,
            matchResult: {
              draw: false,
              win: matchDetails.teamBName,
              loss: matchDetails.teamAName,
            },
            superOverInningComplition: true,
            messege: `super over inning completed `,
            data: matchDetails,
          });
        }
        if (matchDetails[inningDefender].runs > matchDetails[inningUpdater].runs) {
          return res.status(200).json({
            success: true,
            matchResult: {
              draw: false,
              loss: matchDetails.teamBName,
              win: matchDetails.teamAName,
            },
            superOverInningComplition: true,
            messege: `super over inning completed `,
            data: matchDetails,
          });
        }
      }
      return res.status(200).json({
        success: true,
        superOverInningComplition: false,
        isAllout: false,
        data: matchDetails,
        message: "Super over inning completed", // Fixed spelling
      });
    }

    return res.json({
      success: true,
      data: matchDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message, // Ensuring error message is readable
      message: "Internal server error, customized",
    });
  }
};

const { isAllOf } = require("@reduxjs/toolkit");
const Matches = require("../models/NonListingMatchModel");
const User = require("../models/userModel");
const series = require("../models/seriesModel");
const tournament = require("../models/tournamentModel");

exports.updateBowlerAfterOver = async (req, res) => {
  const { matchId } = req.params;
  const { firstInning, bowlerName } = req.body; // Ensure both bowlerName and bowlerId are included

  let bowlingPath = "bTeamBowlerStats.bTeamBowlingStats";
  if (!firstInning) {
    bowlingPath = "aTeamBowlerStats.aTeamBowlingStats";
  }

  try {
    const matchDetail = await Matches.findById(matchId);
    if (!matchDetail) {
      return res
        .status(404)
        .json({ message: "Match not found", success: false });
    }
    if (matchDetail.chooseNextBowler == false) {
      return res
        .status(404)
        .json({ message: "Unable to change bowler", success: false });
    }

    let overCompleted; // ✅ Declare outside to avoid undefined errors

    if (firstInning) {
      overCompleted = matchDetail.aTeamInning.filter(
        (item) => item.overCompleted == "completed"
      ).length;
      matchDetail.aTeamInning[overCompleted].overNumber.bowlerName = bowlerName;
      matchDetail.aTeamInning[overCompleted].overCompleted = "ongoing";
    } else {
      overCompleted = matchDetail.bTeamInning.filter(
        (item) => item.overCompleted == "completed"
      ).length;
      matchDetail.bTeamInning[overCompleted].overNumber.bowlerName = bowlerName;
      matchDetail.bTeamInning[overCompleted].overCompleted = "ongoing";
    }
    matchDetail.chooseNextBowler = false;

    await matchDetail.save();

    // Get the bowling stats array
    const bowlingStats = bowlingPath
      .split(".")
      .reduce((obj, key) => (obj && obj[key] ? obj[key] : null), matchDetail);

    // Check if the bowler already exists in the array
    const existingBowler = bowlingStats?.find(
      (bowler) => bowler.playerName === bowlerName
    );

    if (!existingBowler) {
      var updatedDetails = await Matches.findByIdAndUpdate(
        matchId,
        { $push: { [bowlingPath]: { playerName: bowlerName } } },
        { new: true }
      );
      req.app.locals.io.emit("matchUpdated", {
        updatedMatch: updatedDetails,
      });
      return res.status(200).json({
        message: "Bowler added successfully",
        bowlingStats,
        success: true,
        overCompleted, // ✅ Now it will always be defined
        matchDetail: updatedDetails,
      });
    } else {
      req.app.locals.io.emit("matchUpdated", {
        updatedMatch: matchDetail,
      });
      return res
        .status(404)
        .json({ message: "Bowler already exists", success: false });
    }
  } catch (error) {
    console.error("Error updating bowler:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

exports.newBatterAfterWicket = async (req, res) => {
  try {
    const { batterName, firstInnning } = req.body; // Ensure correct variable name
    const { matchId } = req.params;

    if (!batterName) {
      return res
        .status(400)
        .json({ message: "batterName is required", success: false });
    }
    // Find match details

    const matchDetails = await Matches.findById(matchId);
    if (!matchDetails) {
      return res
        .status(404)
        .json({ message: "Match not found", success: false });
    }
    if (matchDetails.addNewBatter == false) {
      return res
        .status(400)
        .json({ message: "Unable to add new batter", success: false });
    }

    let batting = "aTeamBatterStats.aTeambattingStats";
    let teamPlayer = "aTeamPlayers";
    if (!firstInnning) {
      batting = "bTeamBatterStats.bTeambattingStats";
      teamPlayer = "bTeamPlayers";
    }

    // Count the number of out or retired hurt players
    const indexCount = matchDetails.aTeamBatterStats.aTeambattingStats.filter(
      (player) => player?.isOut || player?.methodOfDismissal === "retired hurt"
    ).length;

    // Prepare update fields using computed property names
    const updateField = {};
    updateField[`${batting}.${indexCount + 1}.playerName`] = batterName;
    updateField[`${batting}.${indexCount + 1}.methodOfDismissal`] = "Not out";

    // Update the match document
    const updatedMatch = await Matches.findByIdAndUpdate(
      matchId,
      {
        $push: {
          [batting]: { playerName: batterName, methodOfDismissal: "Not Out" },
        },
        $set: {
          [`${teamPlayer}.$[batter].methodOfDismissal`]: "Not Out",
          addNewBatter: false,
        },
      },
      { new: true, arrayFilters: [{ "batter.playerName": batterName }] } // ✅ FIXED
    );
    if (!updatedMatch) {
      return res
        .status(404)
        .json({ message: "Failed to update new batter", success: false });
    }
    req.app.locals.io.emit("matchUpdated", {
      updatedMatch: updatedMatch,
    });
    return res.status(200).json({
      matchDetails: updatedMatch,
      success: true,
      message: "New batter added succesfullly",
    });
  } catch (error) {
    console.error("Error updating new batter:", error);
    res
      .status(500)
      .json({ message: "Failed to update batter details", success: false });
  }
};

exports.updateOpenersForSuperOver = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { batter1, batter2, bowler, firstInning } = req.body;

    let inning = "bTeamSuperOverStat";
    let teamPlayers = "bTeamPlayers";
    let InningStartedOfSuperOver = "firstInningStartedOfSuperOver";
    if (!firstInning) {
      inning = "aTeamSuperOverStat";
      InningStartedOfSuperOver = "secondInningStartedOfSuperOver";
      teamPlayers = "aTeamPlayers";
    }

    // Set the inning started flag first
    await Matches.findByIdAndUpdate(matchId, {
      $set: {
        [InningStartedOfSuperOver]: true,
      },
    });

    // Then update methodOfDismissal and isOut using arrayFilters
    const matchDetails = await Matches.findByIdAndUpdate(
      matchId,
      {
        $set: {
          [`${inning}.bowlerName`]: bowler,
          [`${InningStartedOfSuperOver}`]: true,
          [`${inning}.batters`]: [
            {
              batsmanName: batter1,
              methodOfDismissal: "Not Out",
              isOut: false,
            },
            {
              batsmanName: batter2,
              methodOfDismissal: "Not Out",
              isOut: false,
            },
          ],
          [`${teamPlayers}.$[batter1].isOutSuperOver`]: false,
          [`${teamPlayers}.$[batter2].isOutSuperOver`]: false,
        },
      },
      {
        new: true,
        arrayFilters: [
          { "batter1.playerName": batter1 },
          { "batter2.playerName": batter2 },
        ],
      }
    );
    req.app.locals.io.emit("matchUpdated", {
      updatedMatch: matchDetails,
    });
    res.status(200).json({ success: true, data: matchDetails });
  } catch (error) {
    console.error("Error updating openers for super over:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.superOverBallUpdate = async (req, res) => {
  try {
    const { matchId } = req.params;
    let {
      firstInning,
      batterName,
      runs,
      bowlerName,
      nonextraRuns,
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
      dismissedVia,
    } = req.body;
    console.log(req.body);
    let inningUpdater = "bTeamSuperOverStat";
    let inningDefender = "aTeamSuperOverStat";
    let teamPlayer = "bTeamPlayers";
    let extras = "aTeamExtrasOfSuperOver";

    if (firstInning == false) {
      inningUpdater = "aTeamSuperOverStat";
      inningDefender = "bTeamSuperOverStat";
      teamPlayer = "aTeamPlayers";

      extras = "bTeamExtrasOfSuperOver";
    }

    const matchDetailsToExtractData = await Matches.findById(matchId);
    if (matchDetailsToExtractData.status === "Completed") {
      return res
        .status(400)
        .json({ message: "Match is already completed", success: false });
    }

    const ballUpdatingIndex = matchDetailsToExtractData[
      inningUpdater
    ].balls.filter((data) => data.extras === false).length;

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
            dismissedVia: dismissedVia,
          },
        },
        $inc: {
          [`${extras}.byes`]: bye,
          [`${extras}.wides`]: wide ? 1 : 0,
          [`${extras}.noBalls`]: no_ball ? 1 : 0,
          [`${inningUpdater}.runs`]: runs,
          [`${inningUpdater}.batters.$[batter].runs`]: nonextraRuns,
          [`${inningUpdater}.batters.$[batter].four`]: !bye && four,
          [`${inningUpdater}.batters.$[batter].six`]: !bye && six,
          [`${inningUpdater}.batters.$[batter].ballsFaced`]:
            wide || no_ball ? 0 : 1,
        },
      },
      {
        new: true,
        arrayFilters: [{ "batter.batsmanName": batterName }],
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
              [`${teamPlayer}.$[batterInTeamPlayer]`]: {
                isOutSuperOver: true,
              },
              [`${inningUpdater}.batters.$[batter].isOut`]: true,
              [`${inningUpdater}.batters.$[batter].wicketTaker`]: bowlerName,
              [`${inningUpdater}.batters.$[batter].methodOfDismissal`]:
                dismissalType,
              [`${inningUpdater}.batters.$[batter].dismissedVia`]: dismissedVia,
            },
          },

          {
            arrayFilters: [
              { "batter.batsmanName": batterName },
              { "batterInTeamPlayer.playerName": batterName },
            ],
            new: true,
          }
        );

      const isAllOut = matchDetailToUpdateAfterWicketFallen[
        inningUpdater
      ].batters.filter((batter) => batter.isOut == true);
      console.log(isAllOut.length);

      if (isAllOut.length >= 2 || (!extra && ballUpdatingIndex === 5)) {
        console.log(isAllOut.length);
        if (!firstInning) {
          if (
            matchDetails[inningDefender].runs ==
            matchDetails[inningUpdater].runs
          ) {
            matchDetailToUpdateAfterWicketFallen.resultMessege =
              "Super Over Tie";
            (matchDetailToUpdateAfterWicketFallen.addNewBatter = false),
              await matchDetailToUpdateAfterWicketFallen.save();

            req.app.locals.io.emit("matchUpdated", {
              updatedMatch: matchDetailToUpdateAfterWicketFallen,
            });
            return res.status(200).json({
              success: true,
              matchResult: {
                tie: true,
                win: null,
                loss: null,
              },
              superOverInningComplition: true,
              messege: `match tie`,
              data: matchDetails,
            });
          }
          if (
            matchDetails[inningDefender].runs < matchDetails[inningUpdater].runs
          ) {
            matchDetailToUpdateAfterWicketFallen.winner =
              matchDetailToUpdateAfterWicketFallen.teamAName;
            matchDetailToUpdateAfterWicketFallen.secondInningEndedOfSuperOver = true;
            (matchDetailToUpdateAfterWicketFallen.addNewBatter = false),
              (matchDetailToUpdateAfterWicketFallen.status = "Completed");
            await matchDetailToUpdateAfterWicketFallen.save();
            req.app.locals.io.emit("matchUpdated", {
              updatedMatch: matchDetailToUpdateAfterWicketFallen,
            });
            return res.status(200).json({
              success: true,
              matchResult: {
                tie: false,
                loss: matchDetails.teamBName,
                win: matchDetails.teamAName,
              },
              superOverInningComplition: true,
              messege: ``,
              data: matchDetails,
            });
          }
          if (
            matchDetails[inningDefender].runs > matchDetails[inningUpdater].runs
          ) {
            matchDetailToUpdateAfterWicketFallen.winner =
              matchDetailToUpdateAfterWicketFallen.teamBName;
            (matchDetailToUpdateAfterWicketFallen.addNewBatter = false),
              (matchDetailToUpdateAfterWicketFallen.status = "Completed");
            matchDetailToUpdateAfterWicketFallen.secondInningEndedOfSuperOver = true;

            await matchDetailToUpdateAfterWicketFallen.save();
            req.app.locals.io.emit("matchUpdated", {
              updatedMatch: matchDetailToUpdateAfterWicketFallen,
            });

            return res.status(200).json({
              success: true,
              matchResult: {
                tie: false,
                win: matchDetails.teamBName,
                loss: matchDetails.teamAName,
              },
              superOverInningComplition: true,
              messege: `super over inning completed `,
              data: matchDetails,
            });
          }
        }
      } else {
        req.app.locals.io.emit("matchUpdated", {
          updatedMatch: matchDetailToUpdateAfterWicketFallen,
        });
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
      await Matches.findByIdAndUpdate(matchId, {
        $set: {
          [`${inningUpdater}.overComplete`]: true,
        },
      });
      if (firstInning == false) {
        if (
          matchDetails[inningDefender].runs == matchDetails[inningUpdater].runs
        ) {
          await Matches.findByIdAndUpdate(matchId, {
            isSuperOver: true,
            $set: {
              [`${inningUpdater}.overComplete`]: true,
              superOverResult: "Super over 2 ,Tie!",
              addNewBatter: false,
            },
          });
          req.app.locals.io.emit("matchUpdated", {
            updatedMatch: matchDetails,
          });
          return res.status(200).json({
            success: true,
            matchResult: {
              tie: true,
              win: null,
              loss: null,
            },
            superOverInningComplition: true,
            messege: ``,
            data: matchDetails,
          });
        }
        if (
          matchDetails[inningDefender].runs < matchDetails[inningUpdater].runs
        ) {
          matchDetails.winner = matchDetails.teamAName;
          matchDetails.secondInningEndedOfSuperOver = true;
          matchDetails.superOverResult = `${
            matchDetails.teamAName
          } won the match by ${
            matchDetails.aTeamPlayers.filter((item) => {
              item.isOutSuperOver == true;
            }).length - 4
          } wickets`;
          matchDetails.status = "Completed";
          (matchDetails.addNewBatter = false), await matchDetails.save();
          req.app.locals.io.emit("matchUpdated", {
            updatedMatch: matchDetails,
          });
          return res.status(200).json({
            success: true,
            matchResult: {
              tie: false,
              loss: matchDetails.teamBName,
              win: matchDetails.teamAName,
            },
            superOverInningComplition: true,
            messege: ``,
            data: matchDetails,
          });
        }
        if (
          matchDetails[inningDefender].runs > matchDetails[inningUpdater].runs
        ) {
          matchDetails.winner = matchDetails.teamBName;
          matchDetails.superOverResult = "Completed";
          matchDetails.status = `${matchDetails.teamBName} won the match by ${
            matchDetails.bTeamSuperOverStat.runs -
            matchDetails.aTeamSuperOverStat.runs
          } `;
          matchDetails.secondInningEndedOfSuperOver = true;
          (matchDetails.addNewBatter = false), await matchDetails.save();
          req.app.locals.io.emit("matchUpdated", {
            updatedMatch: matchDetails,
          });
          return res.status(200).json({
            success: true,
            matchResult: {
              tie: false,
              win: matchDetails.teamBName,
              loss: matchDetails.teamAName,
            },
            superOverInningComplition: true,
            messege: `super over inning completed `,
            data: matchDetails,
          });
        }
      }
      matchDetails.firstInningEndedOfSuperOver = true;
      matchDetails.superOverResult = `${matchDetails.teamAName} needs ${
        matchDetails.bTeamSuperOverStat.runs + 1
      } to win `;
      const matchFirstInningCompletionDetails = await matchDetails.save();

      req.app.locals.io.emit("matchUpdated", {
        updatedMatch: matchFirstInningCompletionDetails,
      });
      return res.status(200).json({
        success: true,
        superOverInningComplition: true,
        isAllout: false,
        data: matchDetails,
        message: "Super over inning completed", // Fixed spelling
      });
    }

    if (firstInning === false) {
      if (
        matchDetails[inningDefender].runs < matchDetails[inningUpdater].runs
      ) {
        matchDetails.winner = matchDetails.teamBName;
        matchDetails.status = "Completed";
        matchDetails.secondInningEndedOfSuperOver = true;
        matchDetails.superOverResult = `${
          matchDetails.teamAName
        } won the match by ${
          matchDetails.aTeamPlayers.filter((item) => {
            item.isOutSuperOver == true;
          }).length - 4
        } wickets`;
        const matchSecoundInningCompletionDetails = await matchDetails.save();
        req.app.locals.io.emit("matchUpdated", {
          updatedMatch: matchSecoundInningCompletionDetails,
        });
        return res.status(200).json({
          success: true,
          matchResult: {
            tie: false,
            win: matchDetails.teamAName,
            loss: matchDetails.teamBName,
          },
          superOverInningComplition: true,
          messege: ``,
          data: matchDetails,
        });
      }
    }
    if (ballUpdatingIndex != 5) {
      matchDetails.superOverResult = `${matchDetails.teamAName} needs ${
        matchDetails.bTeamSuperOverStat.runs +
        1 -
        matchDetails.aTeamSuperOverStat.runs
      } to win  `;

      // }
      req.app.locals.io.emit("matchUpdated", {
        updatedMatch: matchDetails,
      });

      return res.json({
        success: true,
        data: matchDetails,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message, // Ensuring error message is readable
      message: "Internal server error, customized",
    });
  }
};
exports.nextBatterInSuperOver = async (req, res) => {
  const { matchId } = req.params;
  const { firstInning, batterName } = req.body;
  let inning = "bTeamSuperOverStat";
  let teamPlayers = "bTeamPlayers";
  let InningStartedOfSuperOver = "firstInningStartedOfSuperOver";
  if (!firstInning) {
    inning = "aTeamSuperOverStat";
    InningStartedOfSuperOver = "secondInningStartedOfSuperOver";
    teamPlayers = "aTeamPlayers";
  }

  try {
    const matchData = await Matches.findById(matchId);
    if (!matchData) {
      return res.status(500).json({
        success: false,
        messeghe: "match not found",
      });
    }
    const result = await Matches.findByIdAndUpdate(
      matchId,
      {
        $push: {
          [`${inning}.batters`]: [
            {
              batsmanName: batterName,
              methodOfDismissal: "Not Out",
            },
          ],
        },
        $set: {
          [`${teamPlayers}.$[batter].isOutSuperOver`]: false,
        },
      },
      {
        new: true,
        arrayFilters: [{ "batter.playerName": batterName }],
      }
    );

    req.app.locals.io.emit("matchUpdated", {
      updatedMatch: result,
    });
    return res.status(200).json({
      success: true,
      messege: "next batter successfully added!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      messege: "something went wrong while added next batter in super over",
    });
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
exports.createMatchForCategoried = async (req, res) => {
  const { id } = req.user;

  const {
    aTeamName,
    bTeamName,
    overs,
    playersAside,
    timing,
    matchCategory,
    categoryId,
    categoryHostId,
    matchType,
  } = req.body;

  try {
    const aTeamInning = [];
    const bTeamInning = [];
    if (categoryHostId != id) {
      return res.status(403).json({
        message: "You are not allowed to access this match's stats updation",
        success: false,
      });
    }

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
    let category = "tournamentId";
    if (matchCategory == "series") {
      category = "seriesId";
    }
    // Create match
    const matchDetail = await Matches.create({
      hostDetail: id,
      teamAName: aTeamName,
      teamBName: bTeamName,
      [category]: categoryId,
      matchType: matchType,
      playersAside: playersAside,
      overs: overs,
      timing: timing,
      bTeamBatterStats: { ballsYetToFace: overs * 6 }, // Corrected this line
      aTeamBatterStats: { ballsYetToFace: overs * 6 }, // Corrected this line

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
    return res.status(201).json({
      message: "Match created successfully",
      matchDetail,
      user: req.user,
      aTeamInning,
      bTeamInning,
    });
  } catch (error) {
    console.error("Error creating match:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.createMatch = async (req, res) => {
  const { id } = req.user;
  const { aTeamName, bTeamName, overs, playersAside, timing } = req.body;

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

      playersAside: playersAside,
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
      user: req.user,
      aTeamInning,
      bTeamInning,
    });
  } catch (error) {
    console.error("Error creating match:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// updates toss winner ,
exports.updateMatchDetailsAfterTossById = async (req, res) => {
  const { matchId } = req.params;
  const { tossWinnerTeamName, tossLooserTeamName, tossDecision } = req.body;
  let { aTeamPlayers, bTeamPlayers } = req.body;

  // Adjust these initializations based on your intended logic.
  // For example, if toss winner is always the first team unless swapped:
  let aTeamName = tossWinnerTeamName;
  let bTeamName = tossLooserTeamName;

  try {
    if (tossDecision === "Bowl First") {
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
        "aTeamInning.0.overCompleted": "ongoing",
        "bTeamInning.0.overCompleted": "ongoing",
        "bTeambattingStats.teamName": bTeamName,
        "aTeamBowlerStats.teamName": bTeamName,
        "bTeamBowlerStats.teamName": aTeamName,
        status: "In Progress",
        teamAName: aTeamName,
        teamBName: bTeamName,
        resultMessege: `${tossWinnerTeamName} won the toss and elected to ${tossDecision}`,
      },
      { new: true } // Returns the updated document
    );

    if (!updateThisData) {
      return res.status(404).json({ message: "Match not found" });
    }
    req.app.locals.io.emit("matchUpdated", {
      updatedMatch: updateThisData,
    });
    return res.status(200).json({
      message: "Match toss updated successfully",
      match: updateThisData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.updateOpeners = async (req, res) => {
  const { matchId } = req.params;
  const { batter1Name, batter2Name, bowlerName, firstInning } = req.body;
  let inning = "aTeamInning";
  let inningStarted = "firstInningStarted";
  let batters = "aTeamBatterStats.aTeambattingStats";
  let bowlers = "bTeamBowlerStats.bTeamBowlingStats";
  let teamPlayer = "aTeamPlayers";

  if (!firstInning) {
    inningStarted = "secondInningStarted";
    inning = "bTeamInning";
    teamPlayer = "bTeamPlayers";
    batters = "bTeamBatterStats.bTeambattingStats";
    bowlers = "aTeamBowlerStats.aTeamBowlingStats";
  }

  try {
    const updatedMatch = await Matches.findByIdAndUpdate(
      matchId,
      {
        chooseNextBowler: false,
        addNewBatter: false,
        resultMessege: null,
        [`${inning}.0.overNumber.bowlerName`]: bowlerName,
        [`${inning}.0.overCompleted`]: "ongoing",
        [`${bowlers}.0.playerName`]: bowlerName,
        [`${batters}.0.playerName`]: batter1Name,
        [`${batters}.0.methodOfDismissal`]: "Not Out",
        [`${batters}.1.playerName`]: batter2Name,
        [`${batters}.1.methodOfDismissal`]: "Not Out",
        [`${inningStarted}`]: true,
        [`${teamPlayer}.$[batter1].methodOfDismissal`]: "Not Out",
        [`${teamPlayer}.$[batter2].methodOfDismissal`]: "Not Out",
      },
      {
        new: true,
        arrayFilters: [
          { "batter1.playerName": batter1Name },
          { "batter2.playerName": batter2Name },
        ],
      }
    );

    if (!updatedMatch) {
      return res.status(404).json({ message: "Match not found" });
    }

    // ✅ Emit an event to update frontend
    req.app.locals.io.emit("matchUpdated", {
      updatedMatch: updatedMatch,
    });
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
    const matchDetailsToExtractData = await Matches.findByIdAndUpdate(
      matchId,
      { chooseNextBowler: false }, // Update object
      { new: true } // Optional: Returns the updated document
    );

    const isPushed =
      matchDetailsToExtractData.bTeamBowlerStats.bTeamBowlingStats.filter(
        (player) => player.playerName == bowlerName
      );

    if (isPushed.length == 0) {
      var matchDetails = await Matches.findByIdAndUpdate(matchId, {
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
    req.app.locals.io.emit("matchUpdated", {
      updatedMatch: matchDetails,
    });

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

exports.ballToBallUpdateForSecondInning = async (req, res) => {
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
    dismissedVia,
  } = req.body;
  if (runs == null) {
    runs = 0;
  }
  if (nonextraRuns == null) {
    nonextraRuns = 0;
  }
  console.log(req.body);
  try {
    // fetches data to check pre data updation
    const matchDetailsToExtractData = await Matches.findById(matchId);
    // returns of no maatch is found
    if (!matchDetailsToExtractData) {
      return res.status.json({ messege: "Match not found", success: false });
    } else {
      // returns if thier inning ended
      if (matchDetailsToExtractData.secondInningEnded == true) {
        return res.status(400).json({
          message: `${matchDetailsToExtractData.teamBName}'s inning completed`,
          success: false,
        });
      }
      // return if batter not selected after wicket fallen
      if (matchDetailsToExtractData.addNewBatter) {
        return res.status(400).json({
          message: `Next Batter not selected`,
          success: false,
        });
      }
      // return if bowler not selected after over completion

      if (matchDetailsToExtractData.chooseNextBowler) {
        return res.status(400).json({
          message: `Next Bowler not selected`,
          success: false,
        });
      }
    }
    // get the current over index to update it in "findByIdAndUpdate" operation
    const oversCompletedBeforeCurrentBallUpdation =
      matchDetailsToExtractData.bTeamInning.filter(
        (data) => data.overCompleted === "completed"
      )?.length;
    console.log(
      oversCompletedBeforeCurrentBallUpdation,
      "overs are completed "
    );
    // get the current over index to update it in "findByIdAndUpdate" operation, this will get increased if current ball is 6th and the ball is not extra
    let inningComplition = oversCompletedBeforeCurrentBallUpdation;

    const ballUpdatingIndex = matchDetailsToExtractData.bTeamInning[
      oversCompletedBeforeCurrentBallUpdation
    ].balls.filter((data) => data.extras == false).length;

    // update operation for current ball stat
    const matchDetailsAfterBallDataUpdation = await Matches.findByIdAndUpdate(
      matchId,
      {
        $push: {
          [`bTeamInning.${oversCompletedBeforeCurrentBallUpdation}.balls`]: {
            ballNumber: ballUpdatingIndex + 1,
            batsmanName: batterName,
            runs: runs ? runs : 0,
            dot: dot,

            currentTotalRuns:
              matchDetailsToExtractData.bTeamBatterStats.totalRuns + runs,
            currentTotalWickets: wicket
              ? matchDetailsToExtractData.bTeamBatterStats.bTeambattingStats.filter(
                  (item) => item.isOut == true
                ).length + 1
              : matchDetailsToExtractData.bTeamBatterStats.bTeambattingStats.filter(
                  (item) => item.isOut == true
                ).length,
            single: single,
            double: double,
            triple: triple,
            four: four,
            six: six,
            wide: wide,
            bye: bye,
            extras: extra,
            caption: caption,
            isWicket: wicket,
            dismissalType: dismissalType && dismissalType,
            dismissedVia: dismissedVia && dismissedVia,
          },
        },
        $inc: {
          [`bTeamExtras.byes`]: bye,
          [`bTeamExtras.wides`]: wide ? 1 : 0,
          [`bTeamExtras.noBalls`]: no_ball ? 1 : 0,
          [`bTeamBatterStats.totalRuns`]: runs ? runs : 0,
          [`bTeamBatterStats.ballsFaced`]: no_ball || wide ? 0 : 1,
          [`bTeamBatterStats.ballsYetToFace`]: no_ball || wide ? 0 : -1,
          [`bTeamBatterStats.bTeambattingStats.$[batter].runs`]: nonextraRuns,
          [`bTeamBatterStats.bTeambattingStats.$[batter].ballsFaced`]:
            wide || no_ball ? 0 : 1,
          [`bTeamBatterStats.bTeambattingStats.$[batter].fours`]: four ? 1 : 0,
          [`bTeamBatterStats.bTeambattingStats.$[batter].dot`]: dot ? 1 : 0,
          [`bTeamBatterStats.bTeambattingStats.$[batter].sixes`]: six ? 1 : 0,
          [`bTeamBatterStats.bTeambattingStats.$[batter].singles`]: single
            ? 1
            : 0,
          [`bTeamBatterStats.bTeambattingStats.$[batter].doubles`]: double
            ? 1
            : 0,
          [`bTeamBatterStats.bTeambattingStats.$[batter].triples`]: triple
            ? 1
            : 0,

          [`aTeamBowlerStats.aTeamBowlingStats.$[bowler].runsConceded`]: runs
            ? runs
            : 0,
          [`aTeamBowlerStats.aTeamBowlingStats.$[bowler].noBalls`]: no_ball
            ? 1
            : 0,
          [`aTeamBowlerStats.aTeamBowlingStats.$[bowler].wides`]: wide ? 1 : 0,
          [`aTeamBowlerStats.aTeamBowlingStats.$[bowler].ballsBowled`]:
            wide || no_ball ? 0 : 1,
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
    // calculates current ball of this inning to set data for wicket fallen at.
    const outOnBallNumber =
      matchDetailsAfterBallDataUpdation.aTeamBatterStats.ballsFaced;

    // calculates current ball of over of this inning after this ball updated

    const currentOverBallsAfterThisBallUpdation =
      matchDetailsAfterBallDataUpdation.bTeamInning[
        oversCompletedBeforeCurrentBallUpdation
      ].balls.filter((data) => data.extras === false)?.length || 0;
    //calculates if inning completed after updating current ball
    var inningCompletedAfterCurrentBallUpdation = 0;
    if (currentOverBallsAfterThisBallUpdation == 6) {
      inningCompletedAfterCurrentBallUpdation =
        matchDetailsAfterBallDataUpdation.bTeamInning.filter(
          (item) => item.overCompleted == "completed"
        ).length ==
        matchDetailsAfterBallDataUpdation.overs - 1;
    } else {
      inningCompletedAfterCurrentBallUpdation =
        matchDetailsAfterBallDataUpdation.bTeamInning.filter(
          (item) => item.overCompleted == "completed"
        ).length == matchDetailsAfterBallDataUpdation.overs;
    }

    console.log(
      matchDetailsAfterBallDataUpdation.bTeamInning.filter(
        (item) => item.overCompleted == "completed"
      ).length,
      "is length of over comleted"
    );
    console.log(inningCompletedAfterCurrentBallUpdation);
    if (wicket) {
      // calculates wicket fallen length
      const fallOfWicketLength =
        matchDetailsAfterBallDataUpdation.bTeamFallOfWicket.length;
      console.log(fallOfWicketLength, `w`);
      // checks if team has all out
      var isAllOutAfterWicketOnCurrentBall =
        fallOfWicketLength + 1 ==
        matchDetailsAfterBallDataUpdation.playersAside - 1;
      const updateQuery = {
        $set: {
          // Batter stats updates
          "bTeamBatterStats.bTeambattingStats.$[batter].isOut": true,
          "bTeamBatterStats.bTeambattingStats.$[batter].methodOfDismissal":
            dismissalType,
          "bTeamBatterStats.bTeambattingStats.$[batter].dismissedVia":
            dismissedVia,
          "bTeamBatterStats.bTeambattingStats.$[batter].wicketTaker":
            bowlerName,

          // Player list updates
          "bTeamPlayers.$[batter].isOut": true,
          "bTeamPlayers.$[batter].methodOfDismissal": dismissalType,
          "bTeamPlayers.$[batter].outOnBallNumber": outOnBallNumber,

          // Add new batter flag
          addNewBatter:
            !inningCompletedAfterCurrentBallUpdation &&
            !isAllOutAfterWicketOnCurrentBall,

          // Fall of wicket (specific index set, not push)
          [`bTeamFallOfWicket.${fallOfWicketLength}`]: {
            ballNumber:
              matchDetailsAfterBallDataUpdation.bTeamBatterStats.ballsFaced,
            runs: matchDetailsAfterBallDataUpdation.bTeamBatterStats.totalRuns,
            wickets:
              matchDetailsToExtractData.bTeamBatterStats.bTeambattingStats.filter(
                (item) => item.isOut === true
              ).length + 1,
            batterName: batterName,
          },
        },
        $push: {}, // We'll fill this below
      };

      // Ensure push for batterName

      // Add wickets only if dismissal type is NOT 'Run out'
      const arrayFilters = [{ "batter.playerName": batterName }];

      if (
        dismissalType != "Run out" &&
        dismissalType != "Not Out" &&
        dismissalType != "Retired Hurt"
      ) {
        updateQuery.$push = {
          [`aTeamBowlerStats.aTeamBowlingStats.$[bowler].wickets`]: {
            batterName: batterName,
          },
        };
        arrayFilters.push({ "bowler.playerName": bowlerName }); // Only include if needed
      }

      // Final database update
      var matchDetailToUpdateWicketFallen = await Matches.findByIdAndUpdate(
        matchId,
        updateQuery,
        {
          arrayFilters,
          new: true,
        }
      );

      console.log(
        matchDetailToUpdateWicketFallen && matchDetailToUpdateWicketFallen
      );
      // condition of current ball is 6th of the over
      if (currentOverBallsAfterThisBallUpdation >= 6) {
        var isMaiden = false;
        // checks if this over is maiden
        matchDetailsAfterBallDataUpdation.bTeamInning[
          oversCompletedBeforeCurrentBallUpdation
        ].balls?.map((item) => {
          if (item.runs == 0 || item.byes == true) {
            isMaiden = true;
          }
        });

        inningComplition += 1;

        var overCompleted = await Matches.findByIdAndUpdate(
          matchId,
          {
            $set: {
              [`bTeamInning.${oversCompletedBeforeCurrentBallUpdation}.overCompleted`]:
                "completed",
              chooseNextBowler:
                !inningCompletedAfterCurrentBallUpdation &&
                !isAllOutAfterWicketOnCurrentBall,
            },
            $inc: {
              [`bTeamBowlerStats.bTeamBowlingStats.$[bowler].oversBowled`]: 1,
              [`bTeamBowlerStats.bTeamBowlingStats.$[bowler].maidens`]:
                isMaiden && 1,
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
        inningComplition -= 1;
      }
      const getNestedProperty = (obj, path) => {
        return path.split(".").reduce((acc, key) => acc?.[key], obj) || [];
      };

      const isAllOut =
        fallOfWicketLength + 1 ==
        matchDetailsAfterBallDataUpdation.playersAside - 1;

      if (isAllOut) {
        if (
          matchDetailToUpdateWicketFallen.aTeamBatterStats.totalRuns ==
          matchDetailToUpdateWicketFallen.bTeamBatterStats.totalRuns
        ) {
          console.log("super over due to all out");
          const superOverData = await Matches.findByIdAndUpdate(matchId, {
            isSuperOver: true,
            resultMessege: "Match tie, Super over!",
            secondInningEnded: true,
            addNewBatter: false,
            chooseNextBowler: false,
          });
          await superOverData.save();
          req.app.locals.io.emit("matchUpdated", {
            updatedMatch: superOverData,
          });
          return res.status(200).json({
            success: true,
            matchResult: {
              tie: true,
              win: null,
              loss: null,
            },
            inningComplition: true,
            messege: `match tie`,
            data: matchDetailToUpdateWicketFallen,
          });
        }
        if (
          matchDetailToUpdateWicketFallen.aTeamBatterStats.totalRuns <
          matchDetailToUpdateWicketFallen.bTeamBatterStats.totalRuns
        ) {
          matchDetailToUpdateWicketFallen.winner =
            matchDetailToUpdateWicketFallen.teamBName;
          matchDetailToUpdateWicketFallen.status = "Completed";
          const wicketPendingCount =
            matchDetailToUpdateWicketFallen.bTeamPlayers.filter(
              (item) => !item.isOut && !item.isTwelfthMan
            ).length - 1;

          matchDetailToUpdateWicketFallen.resultMessege = `${
            matchDetailToUpdateWicketFallen.teamBName
          } won by ${
            wicketPendingCount == 0
              ? `${wicketPendingCount} wicket`
              : `${wicketPendingCount} wickets`
          } `;
          matchDetailToUpdateWicketFallen.chooseNextBowler = false;
          matchDetailToUpdateWicketFallen.addNewBatter = false;
          matchDetailToUpdateWicketFallen.secondInningEnded = true;
          await matchDetailToUpdateWicketFallen.save();
          req.app.locals.io.emit("matchUpdated", {
            updatedMatch: matchDetailToUpdateWicketFallen,
          });
          return res.status(200).json({
            success: true,
            matchResult: {
              tie: false,
              win: matchDetailToUpdateWicketFallen.teamBName,
              loss: matchDetailToUpdateWicketFallen.teamAName,
            },
            inningComplition: true,
            messege: `match completed`,
            data: matchDetailToUpdateWicketFallen,
          });
        }
        if (
          matchDetailToUpdateWicketFallen.aTeamBatterStats.totalRuns >
          matchDetailToUpdateWicketFallen.bTeamBatterStats.totalRuns
        ) {
          matchDetailToUpdateWicketFallen.winner =
            matchDetailToUpdateWicketFallen.teamAName;
          matchDetailToUpdateWicketFallen.status = "Completed";
          matchDetailToUpdateWicketFallen.secondInningEnded = true;

          const pendingRunCount =
            matchDetailToUpdateWicketFallen.aTeamBatterStats.totalRuns -
            matchDetailToUpdateWicketFallen.bTeamBatterStats.totalRuns;
          matchDetailToUpdateWicketFallen.resultMessege = `${
            matchDetailToUpdateWicketFallen.teamAName
          } won by ${
            pendingRunCount == 1
              ? `${pendingRunCount} runs`
              : `${pendingRunCount} runs`
          } runs`;
          matchDetailToUpdateWicketFallen.chooseNextBowler = false;
          matchDetailToUpdateWicketFallen.addNewBatter = false;
          await matchDetailToUpdateWicketFallen.save();
          req.app.locals.io.emit("matchUpdated", {
            updatedMatch: matchDetailToUpdateWicketFallen,
          });
          return res.status(200).json({
            success: true,
            matchResult: {
              tie: false,
              loss: matchDetailToUpdateWicketFallen.teamBName,
              win: matchDetailToUpdateWicketFallen.teamAName,
            },
            inningComplition: true,
            messege: `match completed`,
            data: matchDetailToUpdateWicketFallen,
          });
        }

        req.app.locals.io.emit("matchUpdated", {
          updatedMatch: matchDetailToUpdateWicketFallen,
        });
        return res.status(200).json({
          success: true,
          message: "Allout, Inning",
          inningComplition: true,
        });
      }
    }

    if (currentOverBallsAfterThisBallUpdation >= 6 && !wicket) {
      var isMaiden = true;
      matchDetailsAfterBallDataUpdation.bTeamInning[
        oversCompletedBeforeCurrentBallUpdation
      ].balls?.map((item) => {
        if (item.runs > 0) {
          isMaiden = false;
        }
      });
      console.log(inningCompletedAfterCurrentBallUpdation, "2nd");

      const overCompleted2 = await Matches.findByIdAndUpdate(
        matchId,
        {
          $set: {
            [`bTeamInning.${oversCompletedBeforeCurrentBallUpdation}.overCompleted`]:
              "completed",
            chooseNextBowler: !inningCompletedAfterCurrentBallUpdation,
          },
          $inc: {
            [`bTeamBowlerStats.bTeamBowlingStats.$[bowler].oversBowled`]: 1,
            [`bTeamBowlerStats.bTeamBowlingStats.$[bowler].maidens`]:
              isMaiden && 1,
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
      // if second inning batting team inning completed and not all out
    }
    // if second batting team chases down without playing all overs

    // First inning completion due to over completion
    if (inningComplition == matchDetailsAfterBallDataUpdation.overs) {
      if (
        matchDetailsAfterBallDataUpdation.aTeamBatterStats.totalRuns ==
        matchDetailsAfterBallDataUpdation.bTeamBatterStats.totalRuns
      ) {
        await Matches.findByIdAndUpdate(matchId, {
          isSuperOver: true,
          resultMessege: "Match tie, Super over!",
          secondInningEnded: true,
          addNewBatter: false,
          chooseNextBowler: false,
        });
        req.app.locals.io.emit("matchUpdated", {
          updatedMatch: matchDetailsAfterBallDataUpdation,
        });
        return res.status(200).json({
          success: true,
          matchResult: {
            tie: true,
            win: null,
            loss: null,
          },
          inningComplition: true,
          messege: `match completed`,
          data: matchDetailsAfterBallDataUpdation,
        });
      }
      if (
        matchDetailsAfterBallDataUpdation.aTeamBatterStats.totalRuns <
        matchDetailsAfterBallDataUpdation.bTeamBatterStats.totalRuns
      ) {
        matchDetailsAfterBallDataUpdation.winner =
          matchDetailsAfterBallDataUpdation.teamBName;
        matchDetailsAfterBallDataUpdation.status = "Completed";
        const wicketPendingCount =
          matchDetailsAfterBallDataUpdation.bTeamPlayers.filter(
            (item) => !item.isOut && !item.isTwelfthMan
          ).length - 1;

        matchDetailsAfterBallDataUpdation.resultMessege = `${
          matchDetailsAfterBallDataUpdation.teamBName
        } won by ${
          wicketPendingCount == 0
            ? `${wicketPendingCount} wicket`
            : `${wicketPendingCount} wickets`
        } `;
        matchDetailsAfterBallDataUpdation.chooseNextBowler = false;
        matchDetailsAfterBallDataUpdation.addNewBatter = false;
        matchDetailsAfterBallDataUpdation.secondInningEnded = true;
        await matchDetailsAfterBallDataUpdation.save();
        req.app.locals.io.emit("matchUpdated", {
          updatedMatch: matchDetailsAfterBallDataUpdation,
        });
        return res.status(200).json({
          success: true,
          matchResult: {
            tie: false,
            win: matchDetailsAfterBallDataUpdation.teamBName,
            loss: matchDetailsAfterBallDataUpdation.teamAName,
          },
          inningComplition: true,
          messege: `match completed`,
          data: matchDetailsAfterBallDataUpdation,
        });
      }
      if (
        matchDetailsAfterBallDataUpdation.aTeamBatterStats.totalRuns >
        matchDetailsAfterBallDataUpdation.bTeamBatterStats.totalRuns
      ) {
        matchDetailsAfterBallDataUpdation.winner =
          matchDetailsAfterBallDataUpdation.teamAName;
        matchDetailsAfterBallDataUpdation.status = "Completed";
        matchDetailsAfterBallDataUpdation.secondInningEnded = true;

        const pendingRunCount =
          matchDetailsAfterBallDataUpdation.aTeamBatterStats.totalRuns -
          matchDetailsAfterBallDataUpdation.bTeamBatterStats.totalRuns;
        matchDetailsAfterBallDataUpdation.resultMessege = `${
          matchDetailsAfterBallDataUpdation.teamAName
        } won by ${
          pendingRunCount == 1 ? `${pendingRunCount} runs` : `${runCount} runs`
        } runs`;
        matchDetailsAfterBallDataUpdation.chooseNextBowler = false;
        matchDetailsAfterBallDataUpdation.addNewBatter = false;
        await matchDetailsAfterBallDataUpdation.save();
        req.app.locals.io.emit("matchUpdated", {
          updatedMatch: matchDetailsAfterBallDataUpdation,
        });
        return res.status(200).json({
          success: true,
          matchResult: {
            tie: false,
            loss: matchDetailToUpdateWicketFallen.teamBName,
            win: matchDetailToUpdateWicketFallen.teamAName,
          },
          inningComplition: true,
          messege: `match completed`,
          data: matchDetailToUpdateWicketFallen,
        });
      }
    }
    // s io to update over completion
    if (extra == false && ballUpdatingIndex == 5) {
      req.app.locals.io.emit("matchUpdated", {
        updatedMatch: matchDetailsAfterBallDataUpdation,
      });
      return res.status(200).json({
        success: true,
        inningComplition: false,

        overcompletion: true,
        data: matchDetailsAfterBallDataUpdation,

        messege: "score updated",
      });
    }
    if (wicket) {
      req.app.locals.io.emit("matchUpdated", {
        updatedMatch: matchDetailToUpdateWicketFallen,
      });
      return res.status(200).json({
        success: true,
        data: matchDetailToUpdateWicketFallen,
      });
    } else {
      if (
        matchDetailsAfterBallDataUpdation.aTeamBatterStats.totalRuns <
        matchDetailsAfterBallDataUpdation.bTeamBatterStats.totalRuns
      ) {
        matchDetailsAfterBallDataUpdation.winner =
          matchDetailsAfterBallDataUpdation.teamBName;
        matchDetailsAfterBallDataUpdation.status = "Completed";
        const wicketPendingCount =
          matchDetailsAfterBallDataUpdation.bTeamPlayers.filter(
            (item) => !item.isOut && !item.isTwelfthMan
          ).length - 1;

        matchDetailsAfterBallDataUpdation.resultMessege = `${
          matchDetailsAfterBallDataUpdation.teamBName
        } won by ${
          wicketPendingCount == 0
            ? `${wicketPendingCount} wicket`
            : `${wicketPendingCount} wickets`
        } `;
        matchDetailsAfterBallDataUpdation.chooseNextBowler = false;
        matchDetailsAfterBallDataUpdation.addNewBatter = false;
        matchDetailsAfterBallDataUpdation.secondInningEnded = true;
        await matchDetailsAfterBallDataUpdation.save();
        req.app.locals.io.emit("matchUpdated", {
          updatedMatch: matchDetailsAfterBallDataUpdation,
        });
        return res.status(200).json({
          data: matchDetailsAfterBallDataUpdation,
        });
      }
    }
    req.app.locals.io.emit("matchUpdated", {
      updatedMatch: matchDetailsAfterBallDataUpdation,
    });

    return res.status(200).json({
      inningComplition: false,
      data: matchDetailsAfterBallDataUpdation,
      AddBatsman: wicket ? true : false,
      ballUpdatingIndex,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: error.messege, messege: "Cannot update this ball" });
  }
};

exports.ballToBallUpdateForFirstInning = async (req, res) => {
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
    dismissedVia,
  } = req.body;
  if (runs == null) {
    runs = 0;
  }
  if (nonextraRuns == null) {
    nonextraRuns = 0;
  }
  console.log(req.body);
  try {
    const matchDetailsToExtractData = await Matches.findById(matchId);
    // returns of no maatch is found
    if (!matchDetailsToExtractData) {
      return res.status.json({ messege: "Match not found", success: false });
    } else {
      if (matchDetailsToExtractData.firstInningEnded == true) {
        return res.status(400).json({
          message: `${matchDetailsToExtractData.teamAName} inning completed`,
          success: false,
        });
      }

      if (matchDetailsToExtractData.addNewBatter) {
        return res.status(400).json({
          message: `Next Batter not selected`,
          success: false,
        });
      }
      if (matchDetailsToExtractData.chooseNextBowler) {
        return res.status(400).json({
          message: `Next Bowler not selected`,
          success: false,
        });
      }
    }

    const oversCompletedBeforeCurrentBallUpdation =
      matchDetailsToExtractData.aTeamInning.filter(
        (data) => data.overCompleted === "completed"
      )?.length;
    console.log(
      oversCompletedBeforeCurrentBallUpdation,
      "overs are completed "
    );

    let inningComplition = oversCompletedBeforeCurrentBallUpdation;

    if (
      oversCompletedBeforeCurrentBallUpdation >= matchDetailsToExtractData.overs
    ) {
      return res
        .status(500)
        .send({ success: false, message: "inning completed" });
    }
    const ballUpdatingIndex = matchDetailsToExtractData.aTeamInning[
      oversCompletedBeforeCurrentBallUpdation
    ].balls.filter((data) => data.extras == false).length;

    const matchDetailsAfterBallDataUpdation = await Matches.findByIdAndUpdate(
      matchId,
      {
        $push: {
          [`aTeamInning.${oversCompletedBeforeCurrentBallUpdation}.balls`]: {
            ballNumber: ballUpdatingIndex + 1,
            batsmanName: batterName,
            runs: runs ? runs : 0,
            dot: dot,
            single: single,
            double: double,
            currentTotalRuns:
              matchDetailsToExtractData.aTeamBatterStats.totalRuns + runs,
            currentTotalWickets: wicket
              ? matchDetailsToExtractData.aTeamBatterStats.aTeambattingStats.filter(
                  (item) => item.isOut == true
                ).length + 1
              : matchDetailsToExtractData.aTeamBatterStats.aTeambattingStats.filter(
                  (item) => item.isOut == true
                ).length,
            triple: triple,
            four: four,
            six: six,
            wide: wide,
            bye: bye,
            extras: extra,
            caption: caption,
            isWicket: wicket,
            dismissalType: dismissalType && dismissalType,
            dismissedVia: dismissedVia && dismissedVia,
          },
        },
        $inc: {
          [`aTeamExtras.byes`]: bye,
          [`aTeamExtras.wides`]: wide ? 1 : 0,
          [`aTeamExtras.noBalls`]: no_ball ? 1 : 0,
          [`aTeamBatterStats.totalRuns`]: runs ? runs : 0,
          [`aTeamBatterStats.ballsFaced`]: no_ball || wide ? 0 : 1,
          [`aTeamBatterStats.ballsYetToFace`]: no_ball || wide ? 0 : -1,

          [`aTeamBatterStats.aTeambattingStats.$[batter].runs`]: nonextraRuns,
          [`aTeamBatterStats.aTeambattingStats.$[batter].ballsFaced`]:
            wide || no_ball ? 0 : 1,
          [`aTeamBatterStats.aTeambattingStats.$[batter].fours`]: four ? 1 : 0,
          [`aTeamBatterStats.aTeambattingStats.$[batter].dot`]: dot ? 1 : 0,
          [`aTeamBatterStats.aTeambattingStats.$[batter].sixes`]: six ? 1 : 0,
          [`aTeamBatterStats.aTeambattingStats.$[batter].singles`]: single
            ? 1
            : 0,
          [`aTeamBatterStats.aTeambattingStats.$[batter].doubles`]: double
            ? 1
            : 0,
          [`aTeamBatterStats.aTeambattingStats.$[batter].triples`]: triple
            ? 1
            : 0,

          [`bTeamBowlerStats.bTeamBowlingStats.$[bowler].runsConceded`]: runs
            ? runs
            : 0,
          [`bTeamBowlerStats.bTeamBowlingStats.$[bowler].noBalls`]: no_ball
            ? 1
            : 0,
          [`bTeamBowlerStats.bTeamBowlingStats.$[bowler].wides`]: wide ? 1 : 0,
          [`bTeamBowlerStats.bTeamBowlingStats.$[bowler].ballsBowled`]:
            wide || no_ball ? 0 : 1,
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

    const outOnBallNumber =
      matchDetailsAfterBallDataUpdation.aTeamBatterStats.ballsFaced;

    const currentOverBallsAfterThisBallUpdation =
      matchDetailsAfterBallDataUpdation.aTeamInning[
        oversCompletedBeforeCurrentBallUpdation
      ].balls.filter((data) => data.extras === false)?.length || 0;

    var inningCompletedAfterCurrentBallUpdation =
      matchDetailsAfterBallDataUpdation.aTeamInning.filter(
        (item) => item.overCompleted == "completed"
      ).length ==
      matchDetailsAfterBallDataUpdation.overs - 1;
    console.log(
      matchDetailsAfterBallDataUpdation.aTeamInning.filter(
        (item) => item.overCompleted == "completed"
      ).length,
      "is length of over comleted"
    );
    console.log(inningCompletedAfterCurrentBallUpdation);
    if (wicket) {
      // Base update query
      const fallOfWicketLength =
        matchDetailsAfterBallDataUpdation.aTeamFallOfWicket.length;
      console.log(fallOfWicketLength, `w`);
      const updateQuery = {
        $set: {
          [`aTeamBatterStats.aTeambattingStats.$[batter].isOut`]: true,
          [`aTeamBatterStats.aTeambattingStats.$[batter].methodOfDismissal`]:
            dismissalType,
          [`aTeamBatterStats.aTeambattingStats.$[batter].dismissedVia`]:
            dismissedVia,
          [`aTeamBatterStats.aTeambattingStats.$[batter].wicketTaker`]:
            bowlerName,

          [`aTeamPlayers.$[batter].isOut`]: true,
          [`aTeamPlayers.$[batter].methodOfDismissal`]: dismissalType,
          [`aTeamPlayers.$[batter].outOnBallNumber`]: outOnBallNumber,

          addNewBatter: inningCompletedAfterCurrentBallUpdation,

          // 👇 Replace fallOfWicket[0] instead of pushing
          [`aTeamFallOfWicket.${fallOfWicketLength}`]: {
            ballNumber:
              matchDetailsAfterBallDataUpdation.aTeamBatterStats.ballsFaced,
            runs: matchDetailsAfterBallDataUpdation.aTeamBatterStats.totalRuns,
            wickets:
              matchDetailsToExtractData.aTeamBatterStats.aTeambattingStats.filter(
                (item) => item.isOut === true
              ).length + 1,
            batterName: batterName,
          },
        },
      };

      console.log(updateQuery);
      // Only add bowler update if dismissalType !== "run out"
      let arrayFilters = [{ "batter.playerName": batterName }];

      if (
        dismissalType != "Run out" &&
        dismissalType != "Not Out" &&
        dismissalType != "Retired Hurt"
      ) {
        updateQuery.$push = {
          [`bTeamBowlerStats.bTeamBowlingStats.$[bowler].wickets`]: {
            batterName: batterName,
          },
        };
        arrayFilters.push({ "bowler.playerName": bowlerName }); // Only include if needed
      }

      var matchDetailToUpdateWicketFallen = await Matches.findByIdAndUpdate(
        matchId,
        updateQuery,

        {
          arrayFilters,
          new: true,
        }
      );
      console.log(
        matchDetailToUpdateWicketFallen && matchDetailToUpdateWicketFallen
      );
      if (currentOverBallsAfterThisBallUpdation >= 6) {
        var isMaiden = true;

        matchDetailsAfterBallDataUpdation.aTeamInning[
          oversCompletedBeforeCurrentBallUpdation
        ].balls?.map((item) => {
          if (item.runs > 0) {
            isMaiden = false;
          }
        });
        inningComplition += 1;
        var overCompleted = await Matches.findByIdAndUpdate(
          matchId,
          {
            $set: {
              [`aTeamInning.${oversCompletedBeforeCurrentBallUpdation}.overCompleted`]:
                "completed",
              chooseNextBowler: !inningCompletedAfterCurrentBallUpdation,
            },
            $inc: {
              [`bTeamBowlerStats.bTeamBowlingStats.$[bowler].oversBowled`]: 1,
              [`bTeamBowlerStats.bTeamBowlingStats.$[bowler].maidens`]:
                isMaiden && 1,
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
        inningComplition -= 1;
      }
      const getNestedProperty = (obj, path) => {
        return path.split(".").reduce((acc, key) => acc?.[key], obj) || [];
      };

      const isAllout =
        matchDetailToUpdateWicketFallen.aTeamBatterStats.aTeambattingStats.filter(
          (player) => player.isOut === true
        ).length;

      if (isAllout == matchDetailToUpdateWicketFallen.playersAside - 1) {
        matchDetailToUpdateWicketFallen.firstInningEnded = true;
        matchDetailToUpdateWicketFallen.resultMessege = `${
          matchDetailToUpdateWicketFallen.teamBName
        } need ${
          matchDetailToUpdateWicketFallen.aTeamBatterStats.totalRuns + 1
        } to win`;
        matchDetailToUpdateWicketFallen.chooseNextBowler = false;
        matchDetailToUpdateWicketFallen.addNewBatter = false;
        await matchDetailToUpdateWicketFallen.save();
        req.app.locals.io.emit("matchUpdated", {
          updatedMatch: matchDetailToUpdateWicketFallen,
        });
        return res.status(200).json({
          success: true,
          message: "Allout, Inning",
          inningComplition: true,
        });
      }
    }

    if (currentOverBallsAfterThisBallUpdation >= 6) {
      var isMaiden = true;
      matchDetailsAfterBallDataUpdation.aTeamInning[
        oversCompletedBeforeCurrentBallUpdation
      ].balls?.map((item) => {
        if (item.runs > 0) {
          isMaiden = false;
        }
      });
      console.log(inningCompletedAfterCurrentBallUpdation, "2nd");

      const overCompleted2 = await Matches.findByIdAndUpdate(
        matchId,
        {
          $set: {
            [`aTeamInning.${oversCompletedBeforeCurrentBallUpdation}.overCompleted`]:
              "completed",
            chooseNextBowler: !inningCompletedAfterCurrentBallUpdation,
          },
          $inc: {
            [`bTeamBowlerStats.bTeamBowlingStats.$[bowler].oversBowled`]: 1,
            [`bTeamBowlerStats.bTeamBowlingStats.$[bowler].maidens`]:
              isMaiden && 1,
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
      // if second inning batting team inning completed and not all out
    }
    // if second batting team chases down without playing all overs

    // First inning completion due to over completion
    if (inningComplition == matchDetailsAfterBallDataUpdation.overs) {
      matchDetailsAfterBallDataUpdation.firstInningEnded = true;
      matchDetailsAfterBallDataUpdation.resultMessege = `${
        matchDetailsAfterBallDataUpdation.teamBName
      } need ${
        matchDetailsAfterBallDataUpdation.aTeamBatterStats.totalRuns + 1
      } to win`;
      matchDetailsAfterBallDataUpdation.chooseNextBowler = false;
      matchDetailsAfterBallDataUpdation.addNewBatter = false;
      await matchDetailsAfterBallDataUpdation.save();
      req.app.locals.io.emit("matchUpdated", {
        updatedMatch: matchDetailsAfterBallDataUpdation,
      });
      return res.status(200).json({
        inningComplition: true,
        data: matchDetailsAfterBallDataUpdation,
        sd: matchDetailsAfterBallDataUpdation.overs,
      });
    }
    // s io to update over completion
    if (extra == false && ballUpdatingIndex == 5) {
      req.app.locals.io.emit("matchUpdated", {
        updatedMatch: matchDetailsAfterBallDataUpdation,
      });
      return res.status(200).json({
        success: true,
        inningComplition: false,

        overcompletion: true,
        data: matchDetailsAfterBallDataUpdation,

        messege: "score updated",
      });
    }
    if (wicket) {
      req.app.locals.io.emit("matchUpdated", {
        updatedMatch: matchDetailToUpdateWicketFallen,
      });
    } else {
      req.app.locals.io.emit("matchUpdated", {
        updatedMatch: matchDetailsAfterBallDataUpdation,
      });
    }

    return res.status(200).json({
      inningComplition: false,
      data: matchDetailsAfterBallDataUpdation,
      AddBatsman: wicket ? true : false,
      ballUpdatingIndex,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: error.messege, messege: "Cannot update this ball" });
  }
};

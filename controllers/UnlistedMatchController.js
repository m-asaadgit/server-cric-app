const { isAllOf } = require("@reduxjs/toolkit");
const Matches = require("../models/NonListingMatchModel");
const User = require("../models/userModel");

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
        teamAName: aTeamName,
        teamBName: bTeamName,
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
  const { batter1Name, batter2Name, bowlerName, firstInning } = req.body;
  let inning = "aTeamInning";
  let inningStarted="firstInningStarted"
  let batters = "aTeamBatterStats.aTeambattingStats";
  let bowlers = "bTeamBowlerStats.bTeamBowlingStats";
  if (!firstInning) {
    inningStarted="secondInningStarted"
    inning = "bTeamInning";
    batters = "bTeambatterStats.bTeambattingStats";
    bowlers = "aTeamBowlerStats.aTeamBowlingStats";
  }
  try {
    const updatedMatch = await Matches.findByIdAndUpdate(
      matchId,
      {
        [`${inning}.0.overNumber.bowlerName`]: bowlerName,
        [`${bowlers}.0.playerName`]: bowlerName,
        [`${batters}.0.playerName`]: batter1Name,
        [`${batters}.0.methodOfDismissal`]: "Not out",
        [`${batters}.1.playerName`]: batter2Name,
        [`${batters}.1.methodOfDismissal`]: "Not out",
        [`${inningStarted}`]:true
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
    dismissedVia,
  } = req.body;
  try {
    let inning = "aTeamInning";
    let battingTeam = "aTeamBatterStats";
    let bowlingTeam = "bTeambatterStats";
    let battingStat = "aTeamBatterStats.aTeambattingStats";
    let bowlerStat = "bTeamBowlerStats.bTeamBowlingStats";
    let extras = "aTeamExtras";
    let player = "aTeamPlayers";

    if (firstInning == false) {
      inning = "bTeamInning";
      battingTeam = "bTeambatterStats";
      bowlingTeam = "aTeamBatterStats";

      battingStat = "bTeambatterStats.bTeambattingStats";
      bowlerStat = "aTeamBowlerStats.aTeamBowlingStats";
      extras = "bTeamExtras";
      player = "bTeamPlayers";
    }

    const matchDetailsToExtractData = await Matches.findById(matchId);
    const overUpdatingIndex = matchDetailsToExtractData[inning].filter(
      (data) => data.overCompleted === "completed"
    )?.length;

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
            dismissalType: dismissalType && dismissalType,
            dismissedVia: dismissedVia,
          },
        },
        $inc: {
          [`${extras}.byes`]: bye,
          [`${extras}.wides`]: wide ? 1 : 0,
          [`${extras}.noBalls`]: no_ball ? 1 : 0,
          [`${battingTeam}.totalRuns`]: runs,

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
    const overUpdateAfterUpation =
      matchDetails[inning][overUpdatingIndex].balls.filter(
        (data) => data.extras === false
      )?.length || 0;
    console.log(overUpdateAfterUpation + "cwjiwe");
    console.log(overUpdatingIndex + "jiwe");
    if (wicket) {
      // Base update query
      const updateQuery = {
        $set: {
          [`${battingStat}.$[batter].isOut`]: true,
          [`${battingStat}.$[batter].methodOfDismissal`]: dismissalType,
          [`${battingStat}.$[batter].dismissedVia`]: dismissedVia,
        },
      };

      // Only add bowler update if dismissalType !== "run out"
      let arrayFilters = [{ "batter.playerName": batterName }];

      if (dismissalType !== "Run out") {
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

      if (overUpdateAfterUpation >= 6) {
        console.log("hi");
        var overCompleted = await Matches.findByIdAndUpdate(
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
      }
      const getNestedProperty = (obj, path) => {
        return path.split(".").reduce((acc, key) => acc?.[key], obj) || [];
      };

      const isAllout = getNestedProperty(
        matchDetailToUpdateWicketFallen,
        battingStat
      ).filter((player) => player.isOut === true).length;
      if (
        !firstInning &&
        overCompleted?.[inning].length >= overCompleted?.overs
      ) {
        if (
          matchDetails.aTeamBatterStats.totalRuns ==
          matchDetails.bTeambatterStats.totalRuns
        ) {
          await Matches.findByIdAndUpdate(matchId, {
            isSuperOver: true,
          });
          return res.status(200).json({
            success: true,
            matchResult: {
              draw: true,
              win: null,
              loss: null,
            },
            inningComplition: true,
            messege: `match completed`,
            data: matchDetails,
          });
        }
        if (
          matchDetails.aTeamBatterStats.totalRuns <
          matchDetails.bTeambatterStats.totalRuns
        ) {
          matchDetails.winner = matchDetails.teamBName;
          matchDetails.status = "Completed";
          await matchDetails.save();
          return res.status(200).json({
            success: true,
            matchResult: {
              draw: false,
              win: matchDetails.teamBName,
              loss: matchDetails.teamAName,
            },
            inningComplition: true,
            messege: `match completed`,
            data: matchDetails,
          });
        }
        if (
          matchDetails.aTeamBatterStats.totalRuns >
          matchDetails.bTeambatterStats.totalRuns
        ) {
          matchDetails.winner = matchDetails.teamAName;
          matchDetails.status = "Completed";
          await matchDetails.save();

          return res.status(200).json({
            success: true,
            matchResult: {
              draw: false,
              loss: matchDetails.teamBName,
              win: matchDetails.teamAName,
            },
            inningComplition: true,
            messege: `match completed`,
            data: matchDetails,
          });
        }
      }

      if (isAllout == matchDetailToUpdateWicketFallen.playersAside - 1) {
        if (!firstInning) {
          if (
            matchDetails.aTeamBatterStats.totalRuns ==
            matchDetails.bTeambatterStats.totalRuns
          ) {
            await Matches.findByIdAndUpdate(matchId, {
              isSuperOver: true,
            });
            return res.status(200).json({
              success: true,
              matchResult: {
                draw: true,
                win: null,
                loss: null,
              },
              inningComplition: true,
              messege: `match completed`,
              data: matchDetails,
            });
          }
          if (
            matchDetails.aTeamBatterStats.totalRuns <
            matchDetails.bTeambatterStats.totalRuns
          ) {
            matchDetails.winner = matchDetails.teamBName;
            matchDetails.status = "Completed";
            await matchDetails.save();
            return res.status(200).json({
              success: true,
              matchResult: {
                draw: false,
                win: matchDetails.teamBName,
                loss: matchDetails.teamAName,
              },
              inningComplition: true,
              messege: `match completed`,
              data: matchDetails,
            });
          }
          if (
            matchDetails.aTeamBatterStats.totalRuns >
            matchDetails.bTeambatterStats.totalRuns
          ) {
            matchDetails.winner = matchDetails.teamAName;
            matchDetails.status = "Completed";
            await matchDetails.save();

            return res.status(200).json({
              success: true,
              matchResult: {
                draw: false,
                loss: matchDetails.teamBName,
                win: matchDetails.teamAName,
              },
              inningComplition: true,
              messege: `match completed`,
              data: matchDetails,
            });
          }
        }
        return res.status(200).json({
          success: true,
          message: "Allout, Inning",
          inningComplition: true,
        });
      }
    }

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
      if (!firstInning && overCompleted[inning].length >= overCompleted.overs) {
        if (
          matchDetails.aTeamBatterStats.totalRuns ==
          matchDetails.bTeambatterStats.totalRuns
        ) {
          await Matches.findByIdAndUpdate(matchId, {
            isSuperOver: true,
          });
          return res.status(200).json({
            success: true,
            matchResult: {
              draw: true,
              win: null,
              loss: null,
            },
            inningComplition: true,
            messege: `match completed`,
            data: matchDetails,
          });
        }
        if (
          matchDetails.aTeamBatterStats.totalRuns <
          matchDetails.bTeambatterStats.totalRuns
        ) {
          matchDetails.winner = matchDetails.teamBName;
          matchDetails.status = "Completed";
          await matchDetails.save();
          return res.status(200).json({
            success: true,
            matchResult: {
              draw: false,
              win: matchDetails.teamBName,
              loss: matchDetails.teamAName,
            },
            inningComplition: true,
            messege: `match completed`,
            data: matchDetails,
          });
        }
        if (
          matchDetails.aTeamBatterStats.totalRuns >
          matchDetails.bTeambatterStats.totalRuns
        ) {
          matchDetails.winner = matchDetails.teamAName;
          matchDetails.status = "Completed";
          await matchDetails.save();

          return res.status(200).json({
            success: true,
            matchResult: {
              draw: false,
              loss: matchDetails.teamBName,
              win: matchDetails.teamAName,
            },
            inningComplition: true,
            messege: `match completed`,
            data: matchDetails,
          });
        }
      }
    }
    if (!firstInning) {
      if (
        matchDetails.aTeamBatterStats.totalRuns <
        matchDetails.bTeambatterStats.totalRuns
      ) {
        matchDetails.winner = matchDetails.teamBName;
        matchDetails.status = "Completed";
        await matchDetails.save();
        return res.status(200).json({
          success: true,
          matchResult: {
            draw: false,
            win: matchDetails.teamBName,
            loss: matchDetails.teamAName,
          },
          inningComplition: true,
          messege: `match completed`,
          data: matchDetails,
        });
      }
      // if (
      //   matchDetails.aTeamBatterStats.totalRuns >
      //   matchDetails.bTeambatterStats.totalRuns
      // ) {
      //   matchDetails.winner = matchDetails.teamAName;
      //   matchDetails.status = "Completed";
      //   await matchDetails.save();

      //   return res.status(200).json({
      //     success: true,
      //     matchResult: {
      //       draw: false,
      //       loss: matchDetails.teamBName,
      //       win: matchDetails.teamAName,
      //     },
      //     inningComplition: true,
      //     messege: `match completed`,
      //     data: matchDetails,
      //   });
      // }
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
      .json({ error: error.messege, messege: "something went wrong" });
  }
};

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
    } else {
      return res
        .status(404)
        .json({ message: "Bowler already exist", success: false });
    }

    return res.status(200).json({
      message: "Bowler added successfully",
      bowlingStats,
      success: true,
      matchDetail: updatedDetails,
    });
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

    let batting = "aTeamBatterStats.aTeambattingStats";
    if (!firstInnning) {
      batting = "bTeambatterStats.bTeambattingStats";
    }

    // Find match details
    const matchDetails = await Matches.findById(matchId);
    if (!matchDetails) {
      return res
        .status(404)
        .json({ message: "Match not found", success: false });
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
          [batting]: { playerName: batterName },
        },
      },
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
    let InningStartedOfSuperOver="firstInningStartedOfSuperOver";
    if (!firstInning) {
      inning = "aTeamSuperOverStat";
      InningStartedOfSuperOver="secondInningStartedOfSuperOver" 
    }

    const matchDetails = await Matches.findByIdAndUpdate(
      matchId,
      {
        $set: {
          [`${inning}.bowlerName`]: bowler,
          [`${InningStartedOfSuperOver}`]: true,
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
      dismissedVia,
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
    if (matchDetailsToExtractData.status === "Completed") {
      return res
        .status(400)
        .json({ message: "Match is already completed", success: false });
    }

    const ballUpdatingIndex = matchDetailsToExtractData[
      inningUpdater
    ].balls.filter((data) => data.extras === false).length;

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
            dismissedVia: dismissedVia,
          },
        },
        $inc: {
          [`${extras}.byes`]: bye,
          [`${extras}.wides`]: wide ? 1 : 0,
          [`${extras}.noBalls`]: no_ball ? 1 : 0,
          [`${inningUpdater}.runs`]: runs,
          [`${inningUpdater}.batters.$[batter].runs`]: nonextraRuns,
          [`${inningUpdater}.batters.$[batter].ballsFaced`]:
            wide || no_ball ? 0 : 1,
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
      ].batters.filter((batter) => batter.isOut == true);
      console.log(isAllOut.length);

      if (isAllOut.length >= 2) {
        console.log(isAllOut.length);
        if (!firstInning) {
          if (
            matchDetails[inningDefender].runs ==
            matchDetails[inningUpdater].runs
          ) {
            // await Matches.findByIdAndUpdate(matchId, {
            //   isSuperOver: true,
            //   $set: {
            //     [`${inningUpdater}.overComplete`]: true,
            //   },
            // });

            return res.status(200).json({
              success: true,
              matchResult: {
                draw: true,
                win: null,
                loss: null,
              },
              superOverInningComplition: true,
              messege: `match draw`,
              data: matchDetails,
            });
          }
          if (
            matchDetails[inningDefender].runs < matchDetails[inningUpdater].runs
          ) {
            matchDetails.winner = matchDetails.teamAName;
            matchDetails.status = "Completed";
            await matchDetails.save();
            return res.status(200).json({
              success: true,
              matchResult: {
                draw: false,
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
            matchDetails.status = "Completed";
            await matchDetails.save();

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
        }
     
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
      await Matches.findByIdAndUpdate(matchId, {
        $set: {
          [`${inningUpdater}.overComplete`]: true,
        },
      });
      if (firstInning === false) {
        if (
          matchDetails[inningDefender].runs == matchDetails[inningUpdater].runs
        ) {
          await Matches.findByIdAndUpdate(matchId, {
            isSuperOver: true,
            $set: {
              [`${inningUpdater}.overComplete`]: true,
            },
          });

          return res.status(200).json({
            success: true,
            matchResult: {
              draw: true,
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
          matchDetails.status = "Completed";
          await matchDetails.save();
          return res.status(200).json({
            success: true,
            matchResult: {
              draw: false,
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
          matchDetails.status = "Completed";
          await matchDetails.save();

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
      }
      return res.status(200).json({
        success: true,
        superOverInningComplition: true,
        isAllout: false,
        data: matchDetails,
        message: "Super over inning completed", // Fixed spelling
      });
    }
    // if (matchDetails[inningDefender].runs < matchDetails[inningUpdater].runs) {
    //   matchDetails.winner = matchDetails.teamBName;
    //   matchDetails.status = "Completed";
    //   await matchDetails.save();
    //   return res.status(200).json({
    //     success: true,
    //     matchResult: {
    //       draw: false,
    //       win: matchDetails.teamBName,
    //       loss: matchDetails.teamAName,
    //     },
    //     superOverInningComplition: true,
    //     messege: `super over inning completed `,
    //     data: matchDetails,
    //   });
    // }
    // if (matchDetails[inningDefender].runs > matchDetails[inningUpdater].runs) {
    //   matchDetails.winner = matchDetails.teamAName;
    //   matchDetails.status = "Completed";
    //   await matchDetails.save();

    //   return res.status(200).json({
    //     success: true,
    //     matchResult: {
    //       draw: false,
    //       loss: matchDetails.teamBName,
    //       win: matchDetails.teamAName,
    //     },
    //     superOverInningComplition: true,
    //     messege: `super over inning completed `,
    //     data: matchDetails,
    //   });
    // }
    if (firstInning === false) {
      // if (
      //   matchDetails[inningDefender].runs == matchDetails[inningUpdater].runs
      // ) {
      //   await Matches.findByIdAndUpdate(matchId, {
      //     isSuperOver: true,
      //     $set: {
      //       [`${inningUpdater}.overComplete`]: true,
      //     },
      //   });

      //   return res.status(200).json({
      //     success: true,
      //     matchResult: {
      //       draw: true,
      //       win: null,
      //       loss: null,
      //     },
      //     superOverInningComplition: true,
      //     messege: ``,
      //     data: matchDetails,
      //   });
      // }
      if (
        matchDetails[inningDefender].runs < matchDetails[inningUpdater].runs
      ) {
        matchDetails.winner = matchDetails.teamBName;
        matchDetails.status = "Completed";
        await matchDetails.save();
        return res.status(200).json({
          success: true,
          matchResult: {
            draw: false,
            win: matchDetails.teamAName,
            loss: matchDetails.teamBName,
          },
          superOverInningComplition: true,
          messege: ``,
          data: matchDetails,
        });
      }
      // if (
      //   matchDetails[inningDefender].runs > matchDetails[inningUpdater].runs
      // ) {
      //   matchDetails.winner = matchDetails.teamAName;
      //   matchDetails.status = "Completed";
      //   await matchDetails.save();

      //   return res.status(200).json({
      //     success: true,
      //     matchResult: {
      //       draw: false,
      //       loss: matchDetails.teamBName,
      //       win: matchDetails.teamAName,
      //     },
      //     superOverInningComplition: true,
      //     messege: `super over inning completed `,
      //     data: matchDetails,
      //   });
      // }
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

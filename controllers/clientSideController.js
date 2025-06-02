const unListedMatchs = require("../models/NonListingMatchModel");
const Tournament = require("../models/tournamentModel");
const Series = require("../models/seriesModel");
exports.getAllNonlistedMatchesDetail = async (req, res) => {
  try {
    const nonListedMatches = await unListedMatchs
      .find()
      .select(
        "teamAName teamBName timing status winner aTeamBatterStats.totalRuns bTeamBatterStats.totalRuns aTeamSuperOverStat.runs bTeamSuperOverStat.runs "
      );

    if (!nonListedMatches) {
      return res
        .status(404)
        .json({ message: "No matches found", success: false });
    }
    return res.status(200).json({
      message: "matches data successfull fetched",
      success: true,
      data: nonListedMatches,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
// exports.abc = async (req, res) => {
//   const { id } = req.body;
//   try {
//     const nonListedMatches = await unListedMatchs.findByIdAndUpdate(
//       "67d2a82059142ae39a552e57",
//       {
//         seriesId: id,
//       }
//     );

//     if (!nonListedMatches) {
//       return res
//         .status(404)
//         .json({ message: "No matches found", success: false });
//     }
//     return res.status(200).json({
//       message: "matches data successfull fetched",
//       success: true,
//       data: nonListedMatches,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message, success: false });
//   }
// };

exports.getAllEvents = async (req, res) => {
  try {
    const tournamentData = await Tournament.find().lean().select("-updatedAt");
    const seriesData = await Series.find().lean().select("-updatedAt");

    if (tournamentData.length === 0 && seriesData.length === 0) {
      return res.status(404).json({
        message: "No series or tournament found",
        success: false,
      });
    }
    

    return res.status(200).json({
      success: true,
      message: "Matches successfully fetched",
      seriesData,
      tournamentData,
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ message: "Server down", success: false });
  }
};

// exports.getAllMatchesOfSeriesById = async (req, res) => {
//   const { categoryId } = req.params;
//   try {
//     const matches = await unListedMatchs
//       .find({
//         $or: [{ tournamentId: categoryId }, { seriesId: categoryId }],
//       })
//       // .select(
//       //   "teamAName firstInningStarted  secondInningStarted firstInningStartedOfSuperOver secondInningStartedOfSuperOver teamBName timing status winner aTeamBatterStats.totalRuns  aTeamBatterStats.aTeambattingStats.isOut bTeamBatterStats.bTeambattingStats.isOut bTeamBatterStats.totalRuns aTeamSuperOverStat.runs aTeamSuperOverStat.batters.isOut bTeamSuperOverStat.runs aTeamSuperOverStat.balls bTeamSuperOverStat.balls bTeamSuperOverStat.batters.isOut resultMessege overs aTeamInning aTeamBatterStats.ballsFaced aTeamBatterStats.ballsYetToFace  bTeamBatterStats.ballsFaced bTeamBatterStats.ballsYetToFace bTeamInning"
//       // );

//     const eventName1 = await Series.findById(categoryId).select("name");
//     const eventName2 = await Tournament.findById(categoryId).select("name");
//     if (matches.length == 0) {
//       return res
//         .status(404)
//         .json({ message: "No matches found", success: false });
//     }
//     req.io.emit("matchUpdated", { type: "nextBatterUpdate", data: eventName1 || eventName2 });

//     return res.status(200).json({
//       success: true,
//       messege: "matches succesfully fetched",
//       data: matches,
//       eventName: eventName1 || eventName2,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "server down", success: false });
//   }
// };
exports.getAllMatchesOfSeriesById = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const matches = await unListedMatchs.find({
      $or: [{ tournamentId: categoryId }, { seriesId: categoryId }],
    });

    const eventName1 = await Series.findById(categoryId).select("name");
    const eventName2 = await Tournament.findById(categoryId).select("name");

    if (!matches.length) {
      return res.status(404).json({ message: "No matches found", success: false });
    }

    const eventName = eventName1 || eventName2;

    
    return res.status(200).json({
      success: true,
      message: "Matches successfully fetched",
      data: matches,
      eventName,
    });
  } catch (error) {
    res.status(500).json({ message: "Server down", success: false });
  }
};

exports.getNonlistedMatchesDetailById = async (req, res) => {
  const { matchId } = req.params;
  try {
    const nonListedMatches = await unListedMatchs.findById(matchId);

    if (!nonListedMatches) {
      return res
        .status(404)
        .json({ message: "No data available  ", success: false });
    }
    return res.status(200).json({
      message: "matches data successfull fetched",
      success: true,
      data: nonListedMatches,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "No details of this match are found", success: false });
  }
};

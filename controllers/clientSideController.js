const unListedMatchs = require("../models/NonListingMatchModel");
exports.getAllNonlistedMatchesDetail = async (req, res) => {
  try {
    const nonListedMatches = await unListedMatchs.find().select("teamAName teamBName timing status winner aTeamBatterStats bTeambatterStats aTeamSuperOverStat bTeamSuperOverStat tossWinner");

    if (!nonListedMatches) {
      return res
        .status(404)
        .json({ message: "No matches found", success: false });
    }
    return res.status(200).json({
      message: "matches data successfull fetched",
      success: true,
      data:nonListedMatches
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
exports.getNonlistedMatchesDetailById = async (req, res) => {
    const {matchId}=req.params
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
      data:nonListedMatches
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

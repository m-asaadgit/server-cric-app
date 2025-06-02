const series = require("../models/seriesModel");
const tournament = require("../models/tournamentModel");

exports.createSeriesOrTournament = async (req, res) => {
  const { id } = req.user;
  const { matchType, name } = req.body;
  try {
    if (matchType == "series") {
      const createSeries = await series.create({
        hostId: id,
        name: name,
      });
      return res.status(200).json({
        success: true,
        message: "Series created successfully",
        data: createSeries,
      });
    } else {
      const createtournament = await tournament.create({
        hostId: id,
        name: name,
      });
      return res.status(200).json({
        success: true,
        message: `Tournament created successfully`,
        data: createtournament,
      });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "cannot create tournament or series" ,
        error:error
      });
  }
};


const Players= require("../models/playerModel")
exports.createPlayer = async (req, res) => {
    try {
      const player = new Players(req.body);

      const {firstName,lastName,email}=player;
      const duplicate=await Players.findOne({email:email});
      if(duplicate){
        return res.status(400).json({ email:email,message:  "Player with this email already exists" });
      }
      await player.save();
      res.status(201).json({ success: true, data: player,message:`${firstName} ${lastName}'s detail added successfully  `  });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

// exports.updateToalStats = async (req, res) => {
//     try {
//       const { Id } = req.params;
//       const {   runs,
//       ballsFaced,
//       fours,
//       sixes,
//       wickets,
//       overs,
//       catches,
//       sixConceded,
//       fourConceded,
//       runConceded} = req.body;
      
//       const player = await Players.findByIdAndUpdate(Id, { runs, wickets, fours, sixes }, { new: true });




//       if (!player) return res.status(404).json({ message: "Player not found" });
//       res.json({ success: true, data: player, message:`Total stats updated successfully for ${player.firstName} ${player.lastName}` });
//     } catch (error) {
//       res.status(400).json({ success: false, message: error.message });
//     }
//   };
exports.updateTotalStats = async (req, res) => {
    try {
      const { playerId } = req.params; // Get Player ID
      const updatedStats = req.body;  // Incoming stats from request body
  const updatedStatsPerMatch={
    "StatsPerMatch.matchId":updatedStats.matchId,
    "StatsPerMatch.runs":updatedStats.totalruns,
    "StatsPerMatch.ballsFaced":updatedStats.totalBallsFaced,
    "StatsPerMatch.fours":updatedStats.totalFours,
    "StatsPerMatch.sixes":updatedStats.totalSixes,
    // "StatsPerMatch.runOuts":updatedStats.totalruns,
    "StatsPerMatch.wickets":updatedStats.totalWickets,
    "StatsPerMatch.noballs":updatedStats.totalNoBalls,
    "StatsPerMatch.byes":updatedStats.totalByes,
    "StatsPerMatch.wides":updatedStats.totalWides,

    "StatsPerMatch.ballsBowled":updatedStats.totalBallsBowled,
    "StatsPerMatch.catches":updatedStats.totalCatches,
    "StatsPerMatch.sixConceded":updatedStats.totalSixConceded,
    "StatsPerMatch.fourConceded":updatedStats.totalFourConceded,
    "StatsPerMatch.runConceded":updatedStats.totalRunsConceded,

  }
      // Build the update object dynamically
      let updateFields = {};
      for (const key in updatedStats) {
        console.log(key)
        console.log(updatedStats[key])
        console.log(key)
        if (updatedStats[key] !== undefined) {
          updateFields[`Stats.${key}`] = updatedStats[key];
        }
      }

  
      // Update the player's total stats
      const updatedPlayer = await Players.findByIdAndUpdate(
        playerId,
        { $inc: updateFields ,

            
        }, // Increment values dynamically
        { new: true }
      );
  
      if (!updatedPlayer) {
        return res.status(404).json({ success: false, message: "Player not found" });
      }
  
      res.status(200).json({ success: true, message: "Total stats updated successfully", data: updatedPlayer,d:updatedStats ,ds:updateFields});
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };